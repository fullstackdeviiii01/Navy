// app/api/orders/[id]/invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import connectDB from "../../../../../lib/db";
import Order from "../../../../models/Order";
import Invoice from "../../../../models/Invoice";
import User from "../../../../models/User";
import SiteSettings from "../../../../models/SiteSettings";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";
import { generateInvoicePDF } from "../../../../../lib/services/invoicePdfGenerator";
import type { InvoiceData } from "../../../../../lib/services/invoicePdfGenerator";

// ── Company info from SiteSettings DB ────────────────────────────────────────
async function getCompanyInfo() {
  const settings = await (SiteSettings as any).findOne({ is_global_settings: true }).lean() as any;
  const info = settings?.company_info ?? {};
  return {
    name:    info.company_name    ?? "Your Store",
    address: info.company_address ?? "",
    city:    info.company_city    ?? "",
    email:   info.company_email   ?? "",
    phone:   info.company_phone   ?? undefined,
    website: info.company_website ?? undefined,
  };
}

// ── Exchange rates from CurrencySettings DB ──────────────────────────────────
// Orders are always stored in USD. This converts to the user's display currency.
// CurrencySettings is the model behind /api/currency-settings
async function getExchangeRates(): Promise<Record<string, number>> {
  // Dynamic import to avoid circular deps — same pattern as the currency API route
  const CurrencySettings = (await import("../../../../models/CurrencySettings")).default;
  const settings = await (CurrencySettings as any).findOne({}).lean() as any;
  return settings?.exchangeRates ?? {};
}

function convertFromUSD(amount: number, toCurrency: string, rates: Record<string, number>): number {
  if (toCurrency === "USD" || !rates[toCurrency]) return amount;
  return amount * rates[toCurrency];
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get("admin") === "true";

    // ── Auth ────────────────────────────────────────────────────────────────
    const token = getIdTokenFromHeader(request);
    let user: any = null;

    if (token) {
      const decoded = await verifyIdToken(token);
      if (decoded) {
        user = await (User as any).findOne({ uid: decoded.uid });
      }
    }

    // ── Fetch order ─────────────────────────────────────────────────────────
    let order: any;

    if (isAdmin) {
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      order = await Order.findById(id).lean();
    } else if (user) {
      order = await Order.findOne({ _id: id, user_id: user._id }).lean();
    } else {
      const sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      order = await Order.findOne({
        _id: id,
        session_id: sessionId,
        order_type: "guest",
      }).lean();
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ── Invoice access rules ─────────────────────────────────────────────────
    if (!isAdmin && order.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Invoice not available until payment is confirmed." },
        { status: 403 }
      );
    }

    // ── Fetch invoice record ─────────────────────────────────────────────────
    const invoice = await Invoice.findOne({ order_id: id }).lean();
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found for this order." },
        { status: 404 }
      );
    }

    // ── Fetch company + exchange rates in parallel ────────────────────────────
    const [company, exchangeRates] = await Promise.all([
      getCompanyInfo(),
      getExchangeRates(),
    ]);

    // ── Currency conversion ───────────────────────────────────────────────────
    // DB always stores amounts in USD. The user's preferred_currency is on their
    // profile. For registered users use that; for guests fall back to USD.
    const displayCurrency: string =
      user?.preferred_currency && exchangeRates[user.preferred_currency]
        ? user.preferred_currency
        : "USD";

    const convert = (amount: number) =>
      convertFromUSD(amount, displayCurrency, exchangeRates);

    // ── Customer email ────────────────────────────────────────────────────────
    const customerEmail = user?.email ?? order.guest_info?.email ?? null;

    // ── Build InvoiceData ────────────────────────────────────────────────────
    const billing  = order.billing_address;
    const shipping = order.shipping_address;

    const invoiceData: InvoiceData = {
      invoiceNumber: (invoice as any).invoice_number,
      invoiceDate:   formatDate((invoice as any).issued_at ?? (invoice as any).created_at),
      orderNumber:   order.order_number,
      orderDate:     formatDate(order.placed_at),
      paymentMethod: order.payment_method ?? "N/A",
      paymentStatus: order.payment_status,
      currency:      displayCurrency,

      company,

      billTo: {
        name:       billing.full_name,
        line1:      billing.line1,
        line2:      billing.line2,
        city:       billing.city,
        state:      billing.state,
        postalCode: billing.postal_code,
        country:    billing.country,
        phone:      billing.phone,
        email:      customerEmail ?? undefined,
      },

      shipTo: {
        name:       shipping.full_name,
        line1:      shipping.line1,
        line2:      shipping.line2,
        city:       shipping.city,
        state:      shipping.state,
        postalCode: shipping.postal_code,
        country:    shipping.country,
        phone:      shipping.phone,
      },

      items: order.items.map((item: any) => ({
        name:              item.product_name,
        variantAttributes: item.variant_attributes
          ? Object.fromEntries(Object.entries(item.variant_attributes))
          : undefined,
        quantity: item.quantity,
        price:    convert(item.price),
        subtotal: convert(item.subtotal),
      })),

      pricing: {
        subtotal:       convert(order.pricing.subtotal),
        discountAmount: convert(order.pricing.discount_amount ?? 0),
        taxAmount:      convert(order.pricing.tax_amount ?? 0),
        shippingCost:   convert(order.pricing.shipping_cost ?? 0),
        total:          convert(order.pricing.total),
      },
    };

    // ── Generate PDF ─────────────────────────────────────────────────────────
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    const filename  = `${(invoice as any).invoice_number}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length":      String(pdfBuffer.length),
        "Cache-Control":       "no-store",
      },
    });
  } catch (error) {
    console.error("Invoice generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice." },
      { status: 500 }
    );
  }
}