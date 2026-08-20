// lib/services/invoicePdfGenerator.ts
// npm install pdfkit && npm install --save-dev @types/pdfkit
import "server-only";
import PDFDocument from "pdfkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  paymentStatus: string;
  currency: string;
  company: {
    name: string;
    address: string;
    city: string;
    email: string;
    phone?: string;
    website?: string;
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
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", CAD: "CA$",
    AUD: "A$", INR: "Rs ", PKR: "Rs ",
  };
  return `${symbols[currency] ?? currency + " "}${amount.toFixed(2)}`;
}

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    card: "Credit / Debit Card",
    stripe: "Card (Stripe)",
    paypal: "PayPal",
  };
  return map[method?.toLowerCase()] ?? method ?? "N/A";
}

// ─── Fonts — pdfkit built-ins, no registration needed ────────────────────────
// These are standard PDF fonts, always available, no file access required.
const F = {
  regular:  "Helvetica",
  bold:     "Helvetica-Bold",
  mono:     "Courier",
  monoBold: "Courier-Bold",
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────

const MARGIN      = 52;
const PAGE_W      = 595.28;
const CONTENT_W   = PAGE_W - MARGIN * 2;
const COL_QTY_W   = 36;
const COL_PRICE_W = 80;
const COL_TOTAL_W = 90;
const COL_ITEM_W  = CONTENT_W - COL_QTY_W - COL_PRICE_W - COL_TOTAL_W;
const TOT_LBL_W   = 120;
const TOT_VAL_W   = 90;
const TOT_X       = PAGE_W - MARGIN - TOT_LBL_W - TOT_VAL_W;
const GRAY_L      = "#e0e0e0";
const GRAY_M      = "#888888";
const GRAY_D      = "#555555";
const BLACK       = "#1a1a1a";
const STRIP_BG    = "#f5f5f5";

// ─── Generator ────────────────────────────────────────────────────────────────

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // bufferPages: true keeps all pages in memory so we can finalize cleanly
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: MARGIN, bottom: 72, left: MARGIN, right: MARGIN },
        bufferPages: true,
        info: {
          Title:   `Invoice ${data.invoiceNumber}`,
          Author:  data.company.name,
          Subject: `Invoice for Order ${data.orderNumber}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data",  (c: Buffer) => chunks.push(c));
      doc.on("end",   () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const isPaid = data.paymentStatus === "paid";
      const isVoid = data.paymentStatus === "void";
      const stamp  = isVoid ? "VOID" : isPaid ? "PAID" : "PENDING";

      // ── HEADER ─────────────────────────────────────────────────────────────
      const hY = MARGIN;

      doc.font(F.bold).fontSize(18).fillColor(BLACK)
         .text(data.company.name, MARGIN, hY);

      // Company detail lines — explicit Y positions so spacing matches the rest
      // of the doc (same 13pt row height used in meta rows and table rows)
      const companyLines = [
        data.company.address,
        data.company.city,
        data.company.email,
        ...(data.company.phone   ? [data.company.phone]   : []),
        ...(data.company.website ? [data.company.website] : []),
      ].filter(Boolean) as string[];

      companyLines.forEach((line, i) => {
        doc.font(F.regular).fontSize(9).fillColor(GRAY_D)
           .text(line, MARGIN, hY + 26 + i * 13, { width: CONTENT_W / 2 - 20, lineBreak: false });
      });

      doc.font(F.bold).fontSize(26).fillColor(BLACK)
         .text("INVOICE", MARGIN, hY, { width: CONTENT_W, align: "right" });

      const metaRows: [string, string][] = [
        ["Invoice No.", data.invoiceNumber],
        ["Invoice Date", data.invoiceDate],
        ["Order Date",   data.orderDate],
        ["Currency",     data.currency],
      ];
      let mY = hY + 38;
      const lblX = PAGE_W - MARGIN - 190;
      const valX = PAGE_W - MARGIN - 110;
      metaRows.forEach(([lbl, val]) => {
        doc.font(F.regular).fontSize(8).fillColor(GRAY_M)
           .text(lbl, lblX, mY, { width: 75, align: "right" });
        doc.font(F.monoBold).fontSize(8).fillColor(BLACK)
           .text(val, valX, mY, { width: 110, align: "right" });
        mY += 13;
      });

      // Status stamp
      const sW = 64;
      const sX = PAGE_W - MARGIN - sW;
      mY += 4;
      doc.rect(sX, mY, sW, 16).strokeColor(BLACK).lineWidth(1.5).stroke();
      doc.font(F.bold).fontSize(8).fillColor(BLACK)
         .text(stamp, sX, mY + 4, { width: sW, align: "center" });

      // Header rule
      const rY = Math.max(doc.y + 8, mY + 28);
      doc.moveTo(MARGIN, rY).lineTo(PAGE_W - MARGIN, rY)
         .lineWidth(2).strokeColor(BLACK).stroke();

      // ── ADDRESSES ──────────────────────────────────────────────────────────
      const aY = rY + 20;
      const cW = CONTENT_W / 2 - 12;

      function drawAddr(x: number, y: number, lbl: string, addr: any, email?: string) {
        doc.font(F.bold).fontSize(7).fillColor(GRAY_M)
           .text(lbl.toUpperCase(), x, y, { characterSpacing: 1.5 });
        doc.font(F.bold).fontSize(8.5).fillColor(BLACK)
           .text(addr.name, x, y + 12);
        doc.font(F.regular).fontSize(8.5).fillColor(BLACK);
        const lines = [
          addr.line1,
          addr.line2,
          `${addr.city}, ${addr.state} ${addr.postalCode}`,
          addr.country,
        ].filter(Boolean) as string[];
        let lY = y + 25;
        lines.forEach(l => { doc.text(l, x, lY, { width: cW }); lY += 13; });
        if (addr.phone) { doc.text(addr.phone, x, lY + 2, { width: cW }); lY += 13; }
        if (email)      { doc.text(email,      x, lY + 2, { width: cW }); }
      }

      drawAddr(MARGIN,           aY, "Bill To", data.billTo, data.billTo.email);
      drawAddr(MARGIN + cW + 24, aY, "Ship To", data.shipTo);

      // ── META STRIP ─────────────────────────────────────────────────────────
      const stY = aY + 95;
      doc.rect(MARGIN, stY, CONTENT_W, 28).fill(STRIP_BG);

      const stItems: [string, string][] = [
        ["ORDER REF",      data.orderNumber],
        ["PAYMENT METHOD", paymentLabel(data.paymentMethod)],
        ["PAYMENT STATUS", (data.paymentStatus ?? "pending").toUpperCase()],
      ];
      stItems.forEach(([lbl, val], i) => {
        const sx = MARGIN + i * (CONTENT_W / 3) + 12;
        doc.font(F.bold).fontSize(7).fillColor(GRAY_M)
           .text(lbl, sx, stY + 5, { characterSpacing: 0.8 });
        doc.font(F.bold).fontSize(8.5).fillColor(BLACK)
           .text(val, sx, stY + 16);
      });

      // ── TABLE HEADER ───────────────────────────────────────────────────────
      const tY = stY + 42;
      const th = (txt: string, x: number, w: number, align: "left"|"right"|"center" = "left") =>
        doc.font(F.bold).fontSize(7).fillColor(GRAY_M)
           .text(txt, x, tY, { width: w, align, characterSpacing: 0.8 });

      th("DESCRIPTION", MARGIN,                                           COL_ITEM_W);
      th("QTY",         MARGIN + COL_ITEM_W,                              COL_QTY_W,   "center");
      th("UNIT PRICE",  MARGIN + COL_ITEM_W + COL_QTY_W,                 COL_PRICE_W, "right");
      th("AMOUNT",      MARGIN + COL_ITEM_W + COL_QTY_W + COL_PRICE_W,  COL_TOTAL_W, "right");

      const thL = tY + 14;
      doc.moveTo(MARGIN, thL).lineTo(PAGE_W - MARGIN, thL)
         .lineWidth(1.5).strokeColor(BLACK).stroke();

      // ── ROWS ───────────────────────────────────────────────────────────────
      let rowY = thL + 6;

      data.items.forEach((item, idx) => {
        const isLast  = idx === data.items.length - 1;
        const variant = item.variantAttributes
          ? Object.entries(item.variantAttributes)
              .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
              .join("  ·  ")
          : null;
        const rowH = variant ? 30 : 22;
        const numY = rowY + (rowH - 9) / 2;

        doc.font(F.bold).fontSize(8.5).fillColor(BLACK)
           .text(item.name, MARGIN, rowY + 4, { width: COL_ITEM_W - 4 });
        if (variant) {
          doc.font(F.regular).fontSize(7.5).fillColor(GRAY_M)
             .text(variant, MARGIN, rowY + 16, { width: COL_ITEM_W - 4 });
        }

        doc.font(F.mono).fontSize(8.5).fillColor(BLACK)
           .text(String(item.quantity),
                 MARGIN + COL_ITEM_W, numY,
                 { width: COL_QTY_W, align: "center" })
           .text(money(item.price, data.currency),
                 MARGIN + COL_ITEM_W + COL_QTY_W, numY,
                 { width: COL_PRICE_W, align: "right" })
           .text(money(item.subtotal, data.currency),
                 MARGIN + COL_ITEM_W + COL_QTY_W + COL_PRICE_W, numY,
                 { width: COL_TOTAL_W, align: "right" });

        rowY += rowH;
        if (!isLast) {
          doc.moveTo(MARGIN, rowY).lineTo(PAGE_W - MARGIN, rowY)
             .lineWidth(0.5).strokeColor(GRAY_L).stroke();
        }
        rowY += 2;
      });

      // ── TOTALS ─────────────────────────────────────────────────────────────
      rowY += 12;

      const totRows: [string, string][] = [
        ["Subtotal", money(data.pricing.subtotal, data.currency)],
        ...(data.pricing.discountAmount > 0
          ? [["Discount", `-${money(data.pricing.discountAmount, data.currency)}`] as [string, string]]
          : []),
        ["Tax",      money(data.pricing.taxAmount, data.currency)],
        ["Shipping", data.pricing.shippingCost === 0
            ? "FREE"
            : money(data.pricing.shippingCost, data.currency)],
      ];

      totRows.forEach(([lbl, val]) => {
        doc.moveTo(TOT_X, rowY).lineTo(PAGE_W - MARGIN, rowY)
           .lineWidth(0.5).strokeColor(GRAY_L).stroke();
        rowY += 5;
        doc.font(F.regular).fontSize(8.5).fillColor(GRAY_D)
           .text(lbl, TOT_X, rowY, { width: TOT_LBL_W });
        doc.font(F.mono).fontSize(8.5).fillColor(BLACK)
           .text(val, TOT_X + TOT_LBL_W, rowY, { width: TOT_VAL_W, align: "right" });
        rowY += 17;
      });

      rowY += 2;
      doc.moveTo(TOT_X, rowY).lineTo(PAGE_W - MARGIN, rowY)
         .lineWidth(2).strokeColor(BLACK).stroke();
      rowY += 8;
      doc.font(F.bold).fontSize(10).fillColor(BLACK)
         .text(`Total (${data.currency})`, TOT_X, rowY, { width: TOT_LBL_W });
      doc.font(F.monoBold).fontSize(10).fillColor(BLACK)
         .text(money(data.pricing.total, data.currency),
               TOT_X + TOT_LBL_W, rowY,
               { width: TOT_VAL_W, align: "right" });

      // ── FOOTER ─────────────────────────────────────────────────────────────
      const fY = 795.28 - 48;
      doc.moveTo(MARGIN, fY).lineTo(PAGE_W - MARGIN, fY)
         .lineWidth(0.5).strokeColor(GRAY_L).stroke();
      doc.font(F.regular).fontSize(7).fillColor("#aaaaaa")
         .text(
           `Thank you for your order. For questions, contact ${data.company.email}`,
           MARGIN, fY + 8,
           { width: CONTENT_W - 120 }
         );
      doc.font(F.bold).fontSize(7).fillColor(GRAY_M)
         .text(data.invoiceNumber, MARGIN, fY + 8,
               { width: CONTENT_W, align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}