// lib/services/invoicePdfGenerator.tsx
import "server-only";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import sharp from "sharp";

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

// ─── Logo Buffer Loader ───────────────────────────────────────────────────────

export async function getLogoBuffer(logoPathOrUrl?: string): Promise<Buffer | null> {
  try {
    let rawBuffer: Buffer | null = null;

    if (logoPathOrUrl) {
      if (logoPathOrUrl.startsWith("http://") || logoPathOrUrl.startsWith("https://")) {
        const res = await fetch(logoPathOrUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          rawBuffer = Buffer.from(arrayBuffer);
        }
      } else {
        const cleanPath = logoPathOrUrl.replace(/^\//, "");
        const localPath = path.join(process.cwd(), "public", cleanPath);
        if (fs.existsSync(localPath)) {
          rawBuffer = await fs.promises.readFile(localPath);
        }
      }
    }

    if (!rawBuffer) {
      const companyDir = path.join(process.cwd(), "public", "company");
      if (fs.existsSync(companyDir)) {
        const files = await fs.promises.readdir(companyDir);
        const logoFiles = files.filter((f) => f.startsWith("company_logo_")).sort().reverse();
        if (logoFiles.length > 0) {
          rawBuffer = await fs.promises.readFile(path.join(companyDir, logoFiles[0]));
        }
      }
    }

    if (rawBuffer) {
      // PDFKit requires PNG or JPEG. Convert buffer to high-res PNG
      return await sharp(rawBuffer).png().toBuffer();
    }
  } catch (err) {
    console.error("Failed to load or convert company logo for PDF:", err);
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function money(amount: number, currency: string): string {
  const formatted = Math.round(amount || 0).toLocaleString();
  if (currency === "PKR" || !currency) {
    return `Rs. ${formatted}`;
  }
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
  };
  return `${symbols[currency] ?? currency + " "}${formatted}`;
}

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    bank_transfer: "Direct Bank Transfer",
    jazzcash: "JazzCash Mobile Account",
  };
  return map[method?.toLowerCase()] ?? method ?? "Standard Payment";
}

// ─── Fonts — pdfkit built-ins ─────────────────────────────────────────────────
const F = {
  regular:  "Helvetica",
  bold:     "Helvetica-Bold",
  italic:   "Helvetica-Oblique",
  mono:     "Courier",
  monoBold: "Courier-Bold",
} as const;

// ─── Luxury Atelier Layout Metrics & Palette ──────────────────────────────────
const MARGIN      = 44;
const PAGE_W      = 595.28;
const CONTENT_W   = PAGE_W - MARGIN * 2;
const COL_QTY_W   = 36;
const COL_PRICE_W = 85;
const COL_TOTAL_W = 95;
const COL_ITEM_W  = CONTENT_W - COL_QTY_W - COL_PRICE_W - COL_TOTAL_W;
const TOT_LBL_W   = 130;
const TOT_VAL_W   = 95;
const TOT_X       = PAGE_W - MARGIN - TOT_LBL_W - TOT_VAL_W;

// Colors
const COLOR_PRIMARY = "#241910"; // Deep Espresso
const COLOR_GOLD    = "#8E7051"; // Antique Brass
const COLOR_TEXT    = "#2B2825"; // Charcoal Body
const COLOR_MUTED   = "#7A736C"; // Soft Slate
const COLOR_BORDER  = "#E5DFD7"; // Warm Border
const COLOR_BG_STRIP= "#FBF9F5"; // Antique Card Canvas

// ─── PDF Generator ────────────────────────────────────────────────────────────

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  // If logoBuffer is not already provided, resolve it automatically
  if (!data.company.logoBuffer) {
    data.company.logoBuffer = await getLogoBuffer(data.company.logo);
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: MARGIN, bottom: 64, left: MARGIN, right: MARGIN },
        bufferPages: true,
        info: {
          Title:   `Invoice ${data.invoiceNumber} - Talal Wooden Lamps`,
          Author:  data.company.name || "Talal Wooden Lamps",
          Subject: `Official Tax Receipt for Order #${data.orderNumber}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data",  (c: Buffer) => chunks.push(c));
      doc.on("end",   () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const isPaid = data.paymentStatus === "paid";
      const isCOD  = data.paymentMethod === "cod";
      const stamp  = isPaid ? "PAID" : isCOD ? "PAY ON DELIVERY" : "PENDING VERIFICATION";
      const stampColor = isPaid ? "#15803D" : isCOD ? "#241910" : "#B45309";

      // ── 1. BRAND HEADER WITH LOGO ─────────────────────────────────────────────
      const hY = MARGIN;
      let leftContentX = MARGIN;

      if (data.company.logoBuffer) {
        try {
          doc.image(data.company.logoBuffer, MARGIN, hY, { fit: [48, 48] });
          leftContentX = MARGIN + 56;
        } catch (imgErr) {
          console.error("PDFKit logo render fallback:", imgErr);
        }
      }

      // Brand Title
      doc.font(F.bold).fontSize(15).fillColor(COLOR_PRIMARY)
         .text(data.company.name?.toUpperCase() || "TALAL WOODEN LAMPS", leftContentX, hY + 4);
      
      doc.font(F.regular).fontSize(7.5).fillColor(COLOR_GOLD)
         .text("HANDMADE NATURAL LUMINAIRES", leftContentX, hY + 22, { characterSpacing: 0.8 });

      // Company Details Left Column
      const companyLines = [
        data.company.address,
        data.company.city,
        data.company.email,
        data.company.phone ? `Tel: ${data.company.phone}` : "",
        data.company.website || "",
      ].filter(Boolean) as string[];

      companyLines.forEach((line, i) => {
        doc.font(F.regular).fontSize(8).fillColor(COLOR_MUTED)
           .text(line, MARGIN, hY + 54 + i * 11.5, { width: CONTENT_W / 2 - 20, lineBreak: false });
      });

      // INVOICE Heading Right Column
      doc.font(F.bold).fontSize(20).fillColor(COLOR_PRIMARY)
         .text("INVOICE", MARGIN, hY, { width: CONTENT_W, align: "right", characterSpacing: 1.5 });

      // Meta Data Right Column
      const metaRows: [string, string][] = [
        ["Invoice No.", data.invoiceNumber],
        ["Invoice Date", data.invoiceDate],
        ["Order Ref",   `#${data.orderNumber}`],
        ["Currency",     data.currency || "PKR"],
      ];

      let mY = hY + 26;
      const lblX = PAGE_W - MARGIN - 210;
      const valX = PAGE_W - MARGIN - 110;

      metaRows.forEach(([lbl, val]) => {
        doc.font(F.regular).fontSize(8).fillColor(COLOR_MUTED)
           .text(lbl, lblX, mY, { width: 95, align: "right" });
        doc.font(F.monoBold).fontSize(8).fillColor(COLOR_PRIMARY)
           .text(val, valX, mY, { width: 110, align: "right" });
        mY += 12;
      });

      // Status Stamp Pill
      const sW = stamp === "PENDING VERIFICATION" ? 115 : 90;
      const sX = PAGE_W - MARGIN - sW;
      mY += 4;
      doc.rect(sX, mY, sW, 16).strokeColor(stampColor).lineWidth(1).stroke();
      doc.font(F.bold).fontSize(7.5).fillColor(stampColor)
         .text(stamp, sX, mY + 4, { width: sW, align: "center", characterSpacing: 0.8 });

      // Divider Line
      const rY = Math.max(hY + 54 + companyLines.length * 11.5 + 8, mY + 26);
      doc.moveTo(MARGIN, rY).lineTo(PAGE_W - MARGIN, rY)
         .lineWidth(1.5).strokeColor(COLOR_PRIMARY).stroke();

      // ── 2. ADDRESSES ──────────────────────────────────────────────────────────
      const aY = rY + 16;
      const cW = CONTENT_W / 2 - 12;

      function drawAddr(x: number, y: number, lbl: string, addr: any, email?: string) {
        doc.font(F.bold).fontSize(7).fillColor(COLOR_GOLD)
           .text(lbl.toUpperCase(), x, y, { characterSpacing: 1.5 });
        doc.font(F.bold).fontSize(9).fillColor(COLOR_PRIMARY)
           .text(addr.name || "Valued Patron", x, y + 12);
        doc.font(F.regular).fontSize(8).fillColor(COLOR_TEXT);
        const lines = [
          addr.line1,
          addr.line2,
          `${addr.city || ""}${addr.state ? `, ${addr.state}` : ""} ${addr.postalCode || ""}`.trim(),
          addr.country || "Pakistan",
        ].filter(Boolean) as string[];
        let lY = y + 25;
        lines.forEach(l => { doc.text(l, x, lY, { width: cW }); lY += 11.5; });
        if (addr.phone) { doc.text(`Phone: ${addr.phone}`, x, lY + 1, { width: cW }); lY += 11.5; }
        if (email)      { doc.text(`Email: ${email}`,      x, lY + 1, { width: cW }); }
      }

      drawAddr(MARGIN,           aY, "BILLING RECIPIENT", data.billTo, data.billTo.email);
      drawAddr(MARGIN + cW + 24, aY, "SHIPPING DESTINATION", data.shipTo);

      // ── 3. META HIGHLIGHT STRIP ───────────────────────────────────────────────
      const stY = aY + 86;
      doc.rect(MARGIN, stY, CONTENT_W, 26).fill(COLOR_BG_STRIP);
      doc.rect(MARGIN, stY, CONTENT_W, 26).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

      const stItems: [string, string][] = [
        ["ORDER NUMBER", `#${data.orderNumber}`],
        ["PAYMENT METHOD", paymentLabel(data.paymentMethod)],
        ["PAYMENT STATUS", (data.paymentStatus ?? "pending").toUpperCase()],
      ];

      stItems.forEach(([lbl, val], i) => {
        const sx = MARGIN + i * (CONTENT_W / 3) + 10;
        doc.font(F.bold).fontSize(6.5).fillColor(COLOR_GOLD)
           .text(lbl, sx, stY + 5, { characterSpacing: 0.8 });
        doc.font(F.bold).fontSize(8).fillColor(COLOR_PRIMARY)
           .text(val, sx, stY + 14);
      });

      // ── 4. TABLE HEADER ───────────────────────────────────────────────────────
      const tY = stY + 36;
      const th = (txt: string, x: number, w: number, align: "left"|"right"|"center" = "left") =>
        doc.font(F.bold).fontSize(7).fillColor(COLOR_MUTED)
           .text(txt, x, tY, { width: w, align, characterSpacing: 0.8 });

      th("PIECE / DESCRIPTION", MARGIN,                                           COL_ITEM_W);
      th("QTY",                 MARGIN + COL_ITEM_W,                              COL_QTY_W,   "center");
      th("UNIT PRICE",          MARGIN + COL_ITEM_W + COL_QTY_W,                 COL_PRICE_W, "right");
      th("AMOUNT",              MARGIN + COL_ITEM_W + COL_QTY_W + COL_PRICE_W,  COL_TOTAL_W, "right");

      const thL = tY + 12;
      doc.moveTo(MARGIN, thL).lineTo(PAGE_W - MARGIN, thL)
         .lineWidth(1).strokeColor(COLOR_PRIMARY).stroke();

      // ── 5. ITEMS ROWS ─────────────────────────────────────────────────────────
      let rowY = thL + 5;

      data.items.forEach((item, idx) => {
        const isLast  = idx === data.items.length - 1;
        const variant = item.variantAttributes && Object.keys(item.variantAttributes).length > 0
          ? Object.entries(item.variantAttributes)
              .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
              .join("  |  ")
          : null;
        const rowH = variant ? 26 : 20;
        const numY = rowY + (rowH - 8) / 2;

        doc.font(F.bold).fontSize(8).fillColor(COLOR_PRIMARY)
           .text(item.name, MARGIN, rowY + 3, { width: COL_ITEM_W - 4 });
        
        if (variant) {
          doc.font(F.regular).fontSize(7).fillColor(COLOR_MUTED)
             .text(variant, MARGIN, rowY + 14, { width: COL_ITEM_W - 4 });
        }

        doc.font(F.mono).fontSize(8).fillColor(COLOR_TEXT)
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
             .lineWidth(0.5).strokeColor(COLOR_BORDER).stroke();
        }
        rowY += 2;
      });

      // ── 6. TOTALS BREAKDOWN ───────────────────────────────────────────────────
      rowY += 10;

      const totRows: [string, string][] = [
        ["Subtotal", money(data.pricing.subtotal, data.currency)],
        ...(data.pricing.discountAmount > 0
          ? [["Promotion Discount", `-${money(data.pricing.discountAmount, data.currency)}`] as [string, string]]
          : []),
        ["Estimated Delivery", money(data.pricing.shippingCost || 0, data.currency)],
      ];

      totRows.forEach(([lbl, val]) => {
        doc.moveTo(TOT_X, rowY).lineTo(PAGE_W - MARGIN, rowY)
           .lineWidth(0.5).strokeColor(COLOR_BORDER).stroke();
        rowY += 4;
        doc.font(F.regular).fontSize(8).fillColor(COLOR_MUTED)
           .text(lbl, TOT_X, rowY, { width: TOT_LBL_W });
        doc.font(F.mono).fontSize(8).fillColor(COLOR_TEXT)
           .text(val, TOT_X + TOT_LBL_W, rowY, { width: TOT_VAL_W, align: "right" });
        rowY += 15;
      });

      // Grand Total Box
      doc.moveTo(TOT_X, rowY).lineTo(PAGE_W - MARGIN, rowY)
         .lineWidth(1.5).strokeColor(COLOR_PRIMARY).stroke();
      rowY += 6;
      doc.font(F.bold).fontSize(9.5).fillColor(COLOR_PRIMARY)
         .text(`Grand Total (${data.currency || "PKR"})`, TOT_X, rowY, { width: TOT_LBL_W });
      doc.font(F.monoBold).fontSize(9.5).fillColor(COLOR_PRIMARY)
         .text(money(data.pricing.total, data.currency),
               TOT_X + TOT_LBL_W, rowY,
               { width: TOT_VAL_W, align: "right" });

      // ── 7. FOOTER & ATELIER SIGNATURE ─────────────────────────────────────────
      const fY = 795.28 - 46;
      doc.moveTo(MARGIN, fY).lineTo(PAGE_W - MARGIN, fY)
         .lineWidth(0.5).strokeColor(COLOR_BORDER).stroke();
      
      doc.font(F.regular).fontSize(7).fillColor(COLOR_MUTED)
         .text(
           `Talal Wooden Lamps · Handcrafted with natural materials · For customer concierge & inquiries: ${data.company.email}`,
           MARGIN, fY + 8,
           { width: CONTENT_W - 140 }
         );
      doc.font(F.bold).fontSize(7).fillColor(COLOR_GOLD)
         .text(`DOCUMENT ${data.invoiceNumber}`, MARGIN, fY + 8,
               { width: CONTENT_W, align: "right", characterSpacing: 0.5 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}