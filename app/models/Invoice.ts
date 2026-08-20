// app/models/Invoice.ts
import mongoose, { Schema, Document } from "mongoose";
import "./Order";
import "./User";

export interface IInvoice extends Document {
  invoice_number: string;       // INV-2026-00001
  order_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId | null;
  guest_email?: string;         // for guest orders
  status: "draft" | "issued" | "void";
  currency: string;             // locked at order currency
  issued_at?: Date;
  voided_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoice_number: {
      type: String,
      unique: true,
      index: true,
    },
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // one invoice per order
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    guest_email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "issued", "void"],
      default: "draft",
      index: true,
    },
    currency: {
      type: String,
      required: true,
      default: "PKR",
    },
    issued_at: { type: Date },
    voided_at: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Auto-generate sequential invoice number before saving
// Format: INV-YYYY-00001
InvoiceSchema.pre("save", async function (next) {
  if (!this.invoice_number) {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Find the highest invoice number for this year
    const last = await (mongoose.models.Invoice as mongoose.Model<IInvoice>)
      .findOne({ invoice_number: { $regex: `^${prefix}` } })
      .sort({ invoice_number: -1 })
      .lean();

    let nextSeq = 1;
    if (last?.invoice_number) {
      const parts = last.invoice_number.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    this.invoice_number = `${prefix}${String(nextSeq).padStart(5, "0")}`;
  }
  next();
});

export default (mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema)) as mongoose.Model<IInvoice>;