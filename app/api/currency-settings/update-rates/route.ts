// app/api/currency-settings/update-rates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import CurrencySettings from "../../../models/CurrencySettings";
import User from "../../../models/User";

export async function POST(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const settings = await (CurrencySettings as any).findOne({
      baseCurrency: "USD",
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Currency settings not found" },
        { status: 404 },
      );
    }

    if (!settings.apiEnabled || !settings.apiKey) {
      return NextResponse.json(
        { error: "API is not enabled or API key is missing" },
        { status: 400 },
      );
    }

    // Fetch rates from ExchangeRate-API
    const apiUrl = `https://v6.exchangerate-api.com/v6/${settings.apiKey}/latest/USD`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rates from API" },
        { status: 500 },
      );
    }

    const data = await response.json();

    if (data.result !== "success") {
      return NextResponse.json(
        { error: `API Error: ${data["error-type"] || "Unknown error"}` },
        { status: 400 },
      );
    }

    // Filter to only supported currencies
    const newRates: { [key: string]: number } = {};
    settings.supportedCurrencies.forEach((currency) => {
      if (data.conversion_rates[currency]) {
        newRates[currency] = data.conversion_rates[currency];
      }
    });

    // Update settings
    settings.exchangeRates = new Map(Object.entries(newRates));
    settings.lastUpdated = new Date();

    // Add to history
    if (!settings.exchangeRateHistory) {
      settings.exchangeRateHistory = [];
    }
    settings.exchangeRateHistory.push({
      date: new Date(),
      rates: newRates,
      source: "api",
    } as any);

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Exchange rates updated successfully",
      rates: newRates,
      lastUpdated: settings.lastUpdated,
    });
  } catch (error: any) {
    console.error("Exchange rate update failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update exchange rates" },
      { status: 500 },
    );
  }
}
