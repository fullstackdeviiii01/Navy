// lib/services/invoicePdfGenerator.tsx
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
    bank_transfer: "Bank Transfer",
    jazzcash: "JazzCash",
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
const TOT_LBL_W   = 140;
const TOT_VAL_W   = 100;
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
      const isReceipt = data.documentType === "receipt";
      const docHeading = isReceipt ? "ORDER RECEIPT" : "INVOICE";

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: MARGIN, bottom: 64, left: MARGIN, right: MARGIN },
        bufferPages: true,
        info: {
          Title:   isReceipt ? `Order Receipt #${data.orderNumber} - Talal Wooden Lamps` : `Invoice ${data.invoiceNumber} - Talal Wooden Lamps`,
          Author:  data.company.name || "Talal Wooden Lamps",
          Subject: isReceipt ? `Order Receipt for #${data.orderNumber}` : `Official Tax Invoice for Order #${data.orderNumber}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data",  (c: Buffer) => chunks.push(c));
      doc.on("end",   () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const isPaid = data.paymentStatus === "paid";
      const isCOD  = data.paymentMethod?.toLowerCase() === "cod";
      const isBankOrJazz = ["bank_transfer", "jazzcash"].includes(data.paymentMethod?.toLowerCase());
      const orderSt = (data.orderStatus || "pending").toLowerCase();

      // Dynamic, accurate status stamp aligned with real order state
      let stamp = "PENDING";
      let stampColor = "#B45309"; // Amber

      if (orderSt === "cancelled") {
        stamp = "ORDER CANCELLED";
        stampColor = "#DC2626";
      } else if (orderSt === "refunded" || data.paymentStatus === "refunded") {
        stamp = "ORDER REFUNDED";
        stampColor = "#4B5563";
      } else if (isPaid) {
        stamp = "PAID";
        stampColor = "#15803D";
      } else if (isCOD) {
        if (orderSt === "delivered") {
          stamp = "PAID ON DELIVERY";
          stampColor = "#15803D";
        } else if (orderSt === "confirmed" || orderSt === "processing") {
          stamp = isReceipt ? "ORDER CONFIRMED" : "COD - CONFIRMED";
          stampColor = "#15803D";
        } else if (orderSt === "shipped") {
          stamp = "DISPATCHED";
          stampColor = "#0284C7";
        } else {
          stamp = isReceipt ? "CASH ON DELIVERY" : "PAY ON DELIVERY";
          stampColor = "#241910";
        }
      } else if (isBankOrJazz) {
        if (orderSt === "confirmed" || orderSt === "processing") {
          stamp = "PAYMENT VERIFIED";
          stampColor = "#15803D";
        } else if (orderSt === "shipped") {
          stamp = "DISPATCHED";
          stampColor = "#0284C7";
        } else if (orderSt === "delivered") {
          stamp = "DELIVERED";
          stampColor = "#15803D";
        } else {
          // Status is still pending verification
          stamp = "PENDING VERIFICATION";
          stampColor = "#B45309";
        }
      } else {
        if (orderSt === "confirmed") {
          stamp = "CONFIRMED";
          stampColor = "#15803D";
        } else if (orderSt === "shipped") {
          stamp = "DISPATCHED";
          stampColor = "#0284C7";
        } else {
          stamp = "PENDING";
          stampColor = "#B45309";
        }
      }

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

      // Heading Right Column (ORDER RECEIPT vs INVOICE)
      doc.font(F.bold).fontSize(isReceipt ? 18 : 20).fillColor(COLOR_PRIMARY)
         .text(docHeading, MARGIN, hY, { width: CONTENT_W, align: "right", characterSpacing: 1.2 });

      // Meta Data Right Column
      const metaRows: [string, string][] = isReceipt
        ? [
            ["Receipt Ref",  `#${data.orderNumber}`],
            ["Order Date",   data.orderDate],
            ["Payment Type", paymentLabel(data.paymentMethod)],
            ["Currency",     data.currency || "PKR"],
          ]
        : [
            ["Invoice No.",  data.invoiceNumber],
            ["Invoice Date", data.invoiceDate],
            ["Order Ref",    `#${data.orderNumber}`],
            ["Currency",     data.currency || "PKR"],
          ];

      let mY = hY + 28;
      const lblW = 90;
      const valW = 140;
      const valX = PAGE_W - MARGIN - valW;
      const lblX = valX - lblW - 8;

      metaRows.forEach(([lbl, val]) => {
        doc.font(F.regular).fontSize(8).fillColor(COLOR_MUTED);
        doc.text(lbl, lblX, mY, { width: lblW, align: "right" });

        doc.font(F.monoBold).fontSize(8).fillColor(COLOR_PRIMARY);
        const valH = doc.heightOfString(val, { width: valW, align: "right" });
        doc.text(val, valX, mY, { width: valW, align: "right" });

        mY += Math.max(13, valH + 3);
      });

      // Status Stamp Pill
      doc.font(F.bold).fontSize(7.5);
      const measuredStampW = doc.widthOfString(stamp, { characterSpacing: 0.8 });
      const sW = Math.max(105, measuredStampW + 20);
      const sX = PAGE_W - MARGIN - sW;
      mY += 6;
      doc.rect(sX, mY, sW, 16).strokeColor(stampColor).lineWidth(1).stroke();
      doc.font(F.bold).fontSize(7.5).fillColor(stampColor)
         .text(stamp, sX, mY + 4, { width: sW, align: "center", characterSpacing: 0.8 });

      // Divider Line - Safe offset below whichever header column is taller
      const leftColBottom = hY + 54 + companyLines.length * 11.5 + 10;
      const rightColBottom = mY + 22;
      const rY = Math.max(leftColBottom, rightColBottom);

      doc.moveTo(MARGIN, rY).lineTo(PAGE_W - MARGIN, rY)
         .lineWidth(1.5).strokeColor(COLOR_PRIMARY).stroke();

      // ── 2. ADDRESSES ──────────────────────────────────────────────────────────
      const aY = rY + 16;
      const cW = CONTENT_W / 2 - 14;

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
        let lY = y + 26;
        lines.forEach((l) => {
          const lH = doc.heightOfString(l, { width: cW });
          doc.text(l, x, lY, { width: cW });
          lY += Math.max(11.5, lH);
        });
        if (addr.phone) {
          doc.text(`Phone: ${addr.phone}`, x, lY + 2, { width: cW });
          lY += 12;
        }
        if (email) {
          doc.text(`Email: ${email}`, x, lY + 2, { width: cW });
        }
      }

      drawAddr(MARGIN, aY, "BILLING RECIPIENT", data.billTo, data.billTo.email);
      drawAddr(MARGIN + cW + 28, aY, "SHIPPING DESTINATION", data.shipTo);

      // ── 3. META HIGHLIGHT STRIP ───────────────────────────────────────────────
      const stY = aY + 86;
      doc.rect(MARGIN, stY, CONTENT_W, 26).fill(COLOR_BG_STRIP);
      doc.rect(MARGIN, stY, CONTENT_W, 26).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

      const stItems: [string, string][] = [
        ["ORDER NUMBER", `#${data.orderNumber}`],
        ["ORDER STATUS", (data.orderStatus || "pending").toUpperCase()],
        [
          "PAYMENT STATUS",
          isPaid
            ? "PAID"
            : isBankOrJazz
            ? (orderSt === "confirmed" || orderSt === "processing" ? "VERIFIED" : "PENDING VERIFICATION")
            : isCOD
            ? "CASH ON DELIVERY"
            : (data.paymentStatus || "unpaid").toUpperCase(),
        ],
      ];

      stItems.forEach(([lbl, val], i) => {
        const sx = MARGIN + i * (CONTENT_W / 3) + 10;
        doc.font(F.bold).fontSize(6.5).fillColor(COLOR_GOLD)
           .text(lbl, sx, stY + 5, { characterSpacing: 0.8 });
        doc.font(F.bold).fontSize(8).fillColor(COLOR_PRIMARY)
           .text(val, sx, stY + 14, { width: CONTENT_W / 3 - 16, lineBreak: false });
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
      let rowY = thL + 6;

      data.items.forEach((item, idx) => {
        const isLast  = idx === data.items.length - 1;
        const variant = item.variantAttributes && Object.keys(item.variantAttributes).length > 0
          ? Object.entries(item.variantAttributes)
              .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
              .join("  |  ")
          : null;

        doc.font(F.bold).fontSize(8);
        const nameH = doc.heightOfString(item.name, { width: COL_ITEM_W - 8 });
        
        doc.font(F.regular).fontSize(7);
        const varH = variant ? doc.heightOfString(variant, { width: COL_ITEM_W - 8 }) : 0;
        
        const rowH = Math.max(22, nameH + (variant ? varH + 3 : 0) + 6);
        const numY = rowY + (rowH - 8) / 2;

        // Item Name
        doc.font(F.bold).fontSize(8).fillColor(COLOR_PRIMARY)
           .text(item.name, MARGIN, rowY + 3, { width: COL_ITEM_W - 8 });
        
        // Variant attributes
        if (variant) {
          doc.font(F.regular).fontSize(7).fillColor(COLOR_MUTED)
             .text(variant, MARGIN, rowY + 3 + nameH + 1, { width: COL_ITEM_W - 8 });
        }

        // Numerical columns
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
        rowY += 3;
      });

      // ── 6. TOTALS BREAKDOWN ───────────────────────────────────────────────────
      rowY += 8;

      const totRows: [string, string][] = [
        ["Subtotal", money(data.pricing.subtotal, data.currency)],
        ...(data.pricing.discountAmount > 0
          ? [["Promotion Discount", `-${money(data.pricing.discountAmount, data.currency)}`] as [string, string]]
          : []),
        ["Estimated Delivery", data.pricing.shippingCost === 0 ? "FREE" : money(data.pricing.shippingCost || 0, data.currency)],
      ];

      totRows.forEach(([lbl, val]) => {
        doc.moveTo(TOT_X, rowY).lineTo(PAGE_W - MARGIN, rowY)
           .lineWidth(0.5).strokeColor(COLOR_BORDER).stroke();
        rowY += 4;
        doc.font(F.regular).fontSize(8).fillColor(COLOR_MUTED)
           .text(lbl, TOT_X, rowY, { width: TOT_LBL_W });
        doc.font(F.mono).fontSize(8).fillColor(COLOR_TEXT)
           .text(val, TOT_X + TOT_LBL_W, rowY, { width: TOT_VAL_W, align: "right" });
        rowY += 14;
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
           `Talal Wooden Lamps · Handcrafted with natural materials · Concierge: ${data.company.email}`,
           MARGIN, fY + 8,
           { width: CONTENT_W - 140 }
         );
      doc.font(F.bold).fontSize(7).fillColor(COLOR_GOLD)
         .text(isReceipt ? `ORDER RECEIPT #${data.orderNumber}` : `DOCUMENT ${data.invoiceNumber}`, MARGIN, fY + 8,
               { width: CONTENT_W, align: "right", characterSpacing: 0.5 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}