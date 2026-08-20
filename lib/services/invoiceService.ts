// lib/services/invoiceService.ts
import connectDB from "../db";
import Invoice from "../../app/models/Invoice";
import Order from "../../app/models/Order";

export class InvoiceService {
  /**
   * Create a draft invoice when order is placed (before payment for COD,
   * immediately issued for Stripe).
   */
  static async createForOrder(
    orderId: string,
    options: {
      userId?: string | null;
      guestEmail?: string;
      currency: string;
      issueImmediately?: boolean; // true for Stripe, false for COD
    }
  ) {
    await connectDB();

    // Avoid duplicates
    const existing = await Invoice.findOne({ order_id: orderId });
    if (existing) return existing;

    const invoice = new Invoice({
      order_id: orderId,
      user_id: options.userId || null,
      guest_email: options.guestEmail,
      currency: options.currency,
      status: options.issueImmediately ? "issued" : "draft",
      issued_at: options.issueImmediately ? new Date() : undefined,
    });

    await invoice.save();
    return invoice;
  }

  /**
   * Issue (activate) a draft invoice — called when COD payment is marked received.
   */
  static async issueForOrder(orderId: string) {
    await connectDB();

    const invoice = await Invoice.findOne({ order_id: orderId });
    if (!invoice) {
      // Create + issue in one step if somehow missed at order creation
      const order = await Order.findById(orderId).lean();
      if (!order) throw new Error("Order not found");

      const newInvoice = new Invoice({
        order_id: orderId,
        user_id: (order as any).user_id || null,
        guest_email: (order as any).guest_info?.email,
        currency: (order as any).pricing?.currency || "USD",
        status: "issued",
        issued_at: new Date(),
      });
      await newInvoice.save();
      return newInvoice;
    }

    if (invoice.status === "issued") return invoice; // idempotent

    invoice.status = "issued";
    invoice.issued_at = new Date();
    await invoice.save();
    return invoice;
  }

  /**
   * Void an invoice — called when order is cancelled or refunded.
   */
  static async voidForOrder(orderId: string) {
    await connectDB();

    const invoice = await Invoice.findOne({ order_id: orderId });
    if (!invoice) return null;
    if (invoice.status === "void") return invoice;

    invoice.status = "void";
    invoice.voided_at = new Date();
    await invoice.save();
    return invoice;
  }

  /**
   * Get invoice by order ID.
   */
  static async getByOrderId(orderId: string) {
    await connectDB();
    return Invoice.findOne({ order_id: orderId }).lean();
  }
}