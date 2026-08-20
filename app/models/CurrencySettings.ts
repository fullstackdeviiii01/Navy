// app/models/CurrencySettings.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IExchangeRate {
  [currency: string]: number;
}

export interface IExchangeRateHistory {
  date: Date;
  rates: IExchangeRate;
  source: "api" | "manual";
}

export interface ICurrencySettingsDocument extends Document {
  baseCurrency: string;
  supportedCurrencies: string[];
  exchangeRates: Map<string, number>;
  lastUpdated: Date;
  apiKey: string;
  apiEnabled: boolean;
  autoUpdate: boolean;
  updateFrequency: "daily" | "weekly" | "manual";
  exchangeRateHistory: IExchangeRateHistory[];
  created_at: Date;
  updated_at: Date;
}

const ExchangeRateHistorySchema = new Schema({
  date: { type: Date, required: true },
  rates: { type: Map, of: Number, required: true },
  source: { type: String, enum: ["api", "manual"], required: true },
});

const CurrencySettingsSchema = new Schema(
  {
    baseCurrency: { type: String, default: "PKR", required: true },
    supportedCurrencies: {
      type: [String],
      default: ["PKR"],
      required: true,
    },
    exchangeRates: {
      type: Map,
      of: Number,
      default: new Map([
        ["PKR", 1],
      ]),
    },
    lastUpdated: { type: Date, default: Date.now },
    apiKey: { type: String, default: "" },
    apiEnabled: { type: Boolean, default: false },
    autoUpdate: { type: Boolean, default: false },
    updateFrequency: {
      type: String,
      enum: ["daily", "weekly", "manual"],
      default: "daily",
    },
    exchangeRateHistory: [ExchangeRateHistorySchema],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Ensure only one currency settings document
CurrencySettingsSchema.index({ baseCurrency: 1 }, { unique: true });

// Keep only last 30 days of history
CurrencySettingsSchema.pre("save", function (next) {
  if (this.exchangeRateHistory && this.exchangeRateHistory.length > 30) {
    this.exchangeRateHistory = this.exchangeRateHistory.slice(-30) as any;
  }
  next();
});

export default mongoose.models.CurrencySettings ||
  mongoose.model<ICurrencySettingsDocument>(
    "CurrencySettings",
    CurrencySettingsSchema
  );