// lib/services/invoicePdfGenerator.tsx
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  orderStatus?: string;
  paymentMethod: string;
  paymentStatus: string;
  currency: string;
  documentType?: "receipt" | "invoice";
  company: {
    name: string;
    address: string;
    city: string;
    email: string;
    phone?: string;
    website?: string;
    logo?: string;
    logoBuffer?: Buffer | null;
  };
  billTo: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  shipTo: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items: {
    name: string;
    variantAttributes?: { [key: string]: string };
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  pricing: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    shippingCost: number;
    total: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function money(amount: number, currency: string): string {
  const formatted = Math.round(amount || 0).toLocaleString();
  if (currency === "PKR" || !currency) {
    return `Rs. ${formatted}`;
  }
  return `${currency} ${formatted}`;
}

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
    jazzcash: "JazzCash",
    easypaisa: "EasyPaisa",
  };
  return map[method?.toLowerCase()] ?? method ?? "Standard Payment";
}

// ─── Pure in-memory PDF Generation using pdf-lib ──────────────────────────────

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Standard fonts are 100% in-memory — zero disk AFM dependencies
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // A4 dimensions: 595.28 x 841.89
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const MARGIN = 40;
  const CONTENT_W = width - MARGIN * 2;

  // Colors
  const cPrimary = rgb(0.14, 0.1, 0.06); // Deep Espresso (#241910)
  const cGold = rgb(0.56, 0.44, 0.32); // Antique Brass (#8E7051)
  const cText = rgb(0.17, 0.16, 0.15); // Charcoal (#2B2825)
  const cMuted = rgb(0.48, 0.45, 0.42); // Soft Slate (#7A736C)
  const cBorder = rgb(0.9, 0.87, 0.84); // Warm Border (#E5DFD7)
  const cBgLight = rgb(0.98, 0.97, 0.96); // Antique Canvas (#FAF8F5)
  const cWhite = rgb(1, 1, 1);

  // Status Colors aligned with database payment and order state
  const isPaid = data.paymentStatus === "paid";
  const isCOD = data.paymentMethod?.toLowerCase() === "cod";
  const orderSt = (data.orderStatus || "pending").toLowerCase();
  const paySt = (data.paymentStatus || "pending").toLowerCase();

  let stamp = "PENDING PAYMENT";
  let stampColor = rgb(0.71, 0.33, 0.04); // Amber

  if (orderSt === "cancelled") {
    stamp = "ORDER CANCELLED";
    stampColor = rgb(0.86, 0.15, 0.15); // Red
  } else if (orderSt === "refunded" || paySt === "refunded") {
    stamp = "ORDER REFUNDED";
    stampColor = rgb(0.29, 0.33, 0.39); // Slate
  } else if (isPaid) {
    stamp = "PAID";
    stampColor = rgb(0.08, 0.5, 0.24); // Green
  } else if (isCOD) {
    // COD must be checked BEFORE generic "pending" check
    if (orderSt === "delivered") {
      stamp = "PAID ON DELIVERY";
      stampColor = rgb(0.08, 0.5, 0.24);
    } else {
      stamp = "CASH ON DELIVERY";
      stampColor = rgb(0.14, 0.1, 0.06);
    }
  } else if (
    paySt === "pending_verification" ||
    paySt === "pending" ||
    ["bank_transfer", "jazzcash", "easypaisa"].includes(data.paymentMethod?.toLowerCase())
  ) {
    stamp = "PENDING VERIFICATION";
    stampColor = rgb(0.71, 0.33, 0.04); // Amber
  } else if (paySt === "failed") {
    stamp = "PAYMENT FAILED";
    stampColor = rgb(0.86, 0.15, 0.15);
  }

  const isReceipt = data.documentType === "receipt";
  const docHeading = isReceipt ? "ORDER RECEIPT" : "TAX INVOICE";

  let curY = height - MARGIN;

  // ── 1. HEADER ─────────────────────────────────────────────────────────────
  // Left: Brand Info
  page.drawText(data.company.name?.toUpperCase() || "TALAL WOODEN LAMPS", {
    x: MARGIN,
    y: curY - 14,
    size: 15,
    font: fontBold,
    color: cPrimary,
  });

  page.drawText("HANDMADE NATURAL LUMINAIRES · PAKISTAN", {
    x: MARGIN,
    y: curY - 26,
    size: 7.5,
    font: fontRegular,
    color: cGold,
  });

  const companyLines = [
    data.company.address || "Atelier Workshop, Lahore, Pakistan",
    data.company.city || "Lahore, Pakistan",
    data.company.email || "concierge@talalwoodenlamp.com",
    data.company.phone ? `Tel: ${data.company.phone}` : "+92 300 1234567",
  ];

  companyLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN,
      y: curY - 42 - i * 11,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
  });

  // Right: Document Heading & Metadata
  const headingWidth = fontBold.widthOfTextAtSize(docHeading, 18);
  page.drawText(docHeading, {
    x: width - MARGIN - headingWidth,
    y: curY - 14,
    size: 18,
    font: fontBold,
    color: cPrimary,
  });

  const metaRows: [string, string][] = isReceipt
    ? [
        ["Receipt Ref:", `#${data.orderNumber}`],
        ["Order Date:", data.orderDate],
        ["Payment Method:", paymentLabel(data.paymentMethod)],
        ["Order Status:", (data.orderStatus || "Confirmed").toUpperCase()],
      ]
    : [
        ["Invoice No:", data.invoiceNumber],
        ["Invoice Date:", data.invoiceDate],
        ["Order Ref:", `#${data.orderNumber}`],
        ["Payment Method:", paymentLabel(data.paymentMethod)],
      ];

  metaRows.forEach(([lbl, val], i) => {
    const rowY = curY - 34 - i * 13;
    page.drawText(lbl, {
      x: width - MARGIN - 210,
      y: rowY,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
    const valWidth = fontBold.widthOfTextAtSize(val, 8);
    page.drawText(val, {
      x: width - MARGIN - valWidth,
      y: rowY,
      size: 8,
      font: fontBold,
      color: cText,
    });
  });

  // Status Badge Pill (Right) - cleanly positioned below all metadata rows
  const badgeY = curY - 102;
  const badgeW = 120;
  const badgeH = 18;
  const badgeX = width - MARGIN - badgeW;

  page.drawRectangle({
    x: badgeX,
    y: badgeY,
    width: badgeW,
    height: badgeH,
    borderColor: stampColor,
    borderWidth: 1,
    color: cBgLight,
  });

  const stampTextW = fontBold.widthOfTextAtSize(stamp, 8);
  page.drawText(stamp, {
    x: badgeX + (badgeW - stampTextW) / 2,
    y: badgeY + 5,
    size: 8,
    font: fontBold,
    color: stampColor,
  });

  curY -= 124;

  // Header Divider
  page.drawLine({
    start: { x: MARGIN, y: curY },
    end: { x: width - MARGIN, y: curY },
    thickness: 1.5,
    color: cPrimary,
  });

  curY -= 15;

  // ── 2. BILL TO / SHIP TO ADDRESSES ────────────────────────────────────────
  const colW = (CONTENT_W - 20) / 2;

  // Bill To Box
  page.drawText("BILLED TO", {
    x: MARGIN,
    y: curY,
    size: 8,
    font: fontBold,
    color: cGold,
  });
  page.drawText(data.billTo.name || "Valued Patron", {
    x: MARGIN,
    y: curY - 12,
    size: 9,
    font: fontBold,
    color: cPrimary,
  });

  const billLines = [
    data.billTo.line1,
    data.billTo.line2,
    [data.billTo.city, data.billTo.state, data.billTo.postalCode]
      .filter(Boolean)
      .join(", "),
    data.billTo.country || "Pakistan",
    data.billTo.phone ? `Phone: ${data.billTo.phone}` : null,
    data.billTo.email ? `Email: ${data.billTo.email}` : null,
  ].filter(Boolean) as string[];

  billLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN,
      y: curY - 24 - i * 10.5,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
  });

  // Ship To Box
  const shipX = MARGIN + colW + 20;
  page.drawText("SHIPPED TO", {
    x: shipX,
    y: curY,
    size: 8,
    font: fontBold,
    color: cGold,
  });
  page.drawText(data.shipTo.name || data.billTo.name || "Valued Patron", {
    x: shipX,
    y: curY - 12,
    size: 9,
    font: fontBold,
    color: cPrimary,
  });

  const shipLines = [
    data.shipTo.line1 || data.billTo.line1,
    data.shipTo.line2 || data.billTo.line2,
    [
      data.shipTo.city || data.billTo.city,
      data.shipTo.state || data.billTo.state,
      data.shipTo.postalCode || data.billTo.postalCode,
    ]
      .filter(Boolean)
      .join(", "),
    data.shipTo.country || "Pakistan",
    data.shipTo.phone ? `Phone: ${data.shipTo.phone}` : null,
  ].filter(Boolean) as string[];

  shipLines.forEach((line, i) => {
    page.drawText(line, {
      x: shipX,
      y: curY - 24 - i * 10.5,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
  });

  const maxAddrLines = Math.max(billLines.length, shipLines.length);
  curY -= 35 + maxAddrLines * 10.5 + 15;

  // ── 3. ITEMS TABLE ────────────────────────────────────────────────────────
  // Table Header Bar
  const thHeight = 18;
  page.drawRectangle({
    x: MARGIN,
    y: curY,
    width: CONTENT_W,
    height: thHeight,
    color: cPrimary,
  });

  page.drawText("ITEM DESCRIPTION", {
    x: MARGIN + 8,
    y: curY + 5,
    size: 7.5,
    font: fontBold,
    color: cWhite,
  });
  page.drawText("QTY", {
    x: MARGIN + 310,
    y: curY + 5,
    size: 7.5,
    font: fontBold,
    color: cWhite,
  });
  page.drawText("UNIT PRICE", {
    x: MARGIN + 360,
    y: curY + 5,
    size: 7.5,
    font: fontBold,
    color: cWhite,
  });
  page.drawText("AMOUNT", {
    x: width - MARGIN - 60,
    y: curY + 5,
    size: 7.5,
    font: fontBold,
    color: cWhite,
  });

  curY -= 4;

  // Table Rows
  data.items.forEach((item, idx) => {
    const rowBg = idx % 2 === 1 ? cBgLight : cWhite;
    const hasVariants =
      item.variantAttributes &&
      Object.keys(item.variantAttributes).length > 0;
    const rowHeight = hasVariants ? 26 : 18;

    curY -= rowHeight;

    page.drawRectangle({
      x: MARGIN,
      y: curY,
      width: CONTENT_W,
      height: rowHeight,
      color: rowBg,
    });

    // Bottom row border
    page.drawLine({
      start: { x: MARGIN, y: curY },
      end: { x: width - MARGIN, y: curY },
      thickness: 0.5,
      color: cBorder,
    });

    // Product Title
    const truncatedName =
      item.name.length > 45 ? item.name.substring(0, 42) + "..." : item.name;
    page.drawText(truncatedName, {
      x: MARGIN + 8,
      y: curY + (hasVariants ? 14 : 5),
      size: 8,
      font: fontBold,
      color: cPrimary,
    });

    // Variants subtitle
    if (hasVariants) {
      const varStr = Object.entries(item.variantAttributes || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");
      page.drawText(varStr, {
        x: MARGIN + 8,
        y: curY + 4,
        size: 6.5,
        font: fontOblique,
        color: cMuted,
      });
    }

    // Quantity
    page.drawText(String(item.quantity || 1), {
      x: MARGIN + 316,
      y: curY + (hasVariants ? 10 : 5),
      size: 8,
      font: fontRegular,
      color: cText,
    });

    // Unit Price
    const priceStr = money(item.price, data.currency);
    page.drawText(priceStr, {
      x: MARGIN + 360,
      y: curY + (hasVariants ? 10 : 5),
      size: 8,
      font: fontRegular,
      color: cText,
    });

    // Amount
    const amountStr = money(item.subtotal || item.price * (item.quantity || 1), data.currency);
    const amountW = fontBold.widthOfTextAtSize(amountStr, 8);
    page.drawText(amountStr, {
      x: width - MARGIN - 8 - amountW,
      y: curY + (hasVariants ? 10 : 5),
      size: 8,
      font: fontBold,
      color: cPrimary,
    });
  });

  curY -= 15;

  // ── 4. TOTALS BREAKDOWN ───────────────────────────────────────────────────
  const totBoxW = 200;
  const totBoxX = width - MARGIN - totBoxW;

  const totalLines: [string, string][] = [
    ["Items Subtotal:", money(data.pricing.subtotal, data.currency)],
    ...(data.pricing.discountAmount > 0
      ? [
          [
            "Discount:",
            `-${money(data.pricing.discountAmount, data.currency)}`,
          ] as [string, string],
        ]
      : []),
    [
      "Delivery Charges:",
      data.pricing.shippingCost === 0
        ? "FREE"
        : money(data.pricing.shippingCost, data.currency),
    ],
  ];

  totalLines.forEach(([lbl, val]) => {
    curY -= 12;
    page.drawText(lbl, {
      x: totBoxX,
      y: curY,
      size: 8,
      font: fontRegular,
      color: cMuted,
    });
    const vW = fontRegular.widthOfTextAtSize(val, 8);
    page.drawText(val, {
      x: width - MARGIN - vW,
      y: curY,
      size: 8,
      font: fontRegular,
      color: cText,
    });
  });

  // Grand Total Line
  curY -= 6;
  page.drawLine({
    start: { x: totBoxX, y: curY },
    end: { x: width - MARGIN, y: curY },
    thickness: 1.5,
    color: cPrimary,
  });

  curY -= 14;
  page.drawText(`Total (${data.currency || "PKR"}):`, {
    x: totBoxX,
    y: curY,
    size: 9.5,
    font: fontBold,
    color: cPrimary,
  });

  const grandTotalStr = money(data.pricing.total, data.currency);
  const gtW = fontBold.widthOfTextAtSize(grandTotalStr, 10);
  page.drawText(grandTotalStr, {
    x: width - MARGIN - gtW,
    y: curY,
    size: 10,
    font: fontBold,
    color: cPrimary,
  });

  // ── 5. FOOTER & ATELIER SIGNATURE ─────────────────────────────────────────
  const footY = 40;
  page.drawLine({
    start: { x: MARGIN, y: footY + 12 },
    end: { x: width - MARGIN, y: footY + 12 },
    thickness: 0.5,
    color: cBorder,
  });

  page.drawText(
    `Talal Wooden Lamps · Handcrafted Natural Luminaires · Concierge: ${data.company.email || "concierge@talalwoodenlamp.com"}`,
    {
      x: MARGIN,
      y: footY,
      size: 7,
      font: fontRegular,
      color: cMuted,
    }
  );

  const docCode = isReceipt
    ? `RECEIPT #${data.orderNumber}`
    : `INVOICE ${data.invoiceNumber}`;
  const docCodeW = fontBold.widthOfTextAtSize(docCode, 7);
  page.drawText(docCode, {
    x: width - MARGIN - docCodeW,
    y: footY,
    size: 7,
    font: fontBold,
    color: cGold,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}