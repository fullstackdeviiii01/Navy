// app/api/currency-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/firebase/auth";
import connectDB from "../../../lib/db";
import CurrencySettings from "../../models/CurrencySettings";
import User from "../../models/User";

// GET - Fetch currency settings (public access for rates, admin for config)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const settings = await (CurrencySettings as any).findOne({
      baseCurrency: "PKR",
    });

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await (CurrencySettings as any).create({
        baseCurrency: "PKR",
        supportedCurrencies: ["PKR"],
        exchangeRates: new Map([
          ["PKR", 1],
        ]),
        lastUpdated: new Date(),
        apiEnabled: false,
        autoUpdate: false,
      });

      return NextResponse.json({
        baseCurrency: defaultSettings.baseCurrency,
        supportedCurrencies: defaultSettings.supportedCurrencies,
        exchangeRates: Object.fromEntries(defaultSettings.exchangeRates),
        lastUpdated: defaultSettings.lastUpdated,
      });
    }

    // Check if request is from admin (for full config)
    const token = getIdTokenFromHeader(request);
    let isAdmin = false;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        const user = await (User as any).findOne({ uid: decodedToken.uid });
        isAdmin = user?.role === "admin";
      }
    }

    // Return full config for admin, public rates for others
    if (isAdmin) {
      return NextResponse.json({
        baseCurrency: settings.baseCurrency,
        supportedCurrencies: settings.supportedCurrencies,
        exchangeRates: Object.fromEntries(settings.exchangeRates),
        lastUpdated: settings.lastUpdated,
        apiKey: settings.apiKey,
        apiEnabled: settings.apiEnabled,
        autoUpdate: settings.autoUpdate,
        updateFrequency: settings.updateFrequency,
        history: settings.exchangeRateHistory.slice(-7), // Last 7 days
      });
    } else {
      return NextResponse.json({
        baseCurrency: settings.baseCurrency,
        supportedCurrencies: settings.supportedCurrencies,
        exchangeRates: Object.fromEntries(settings.exchangeRates),
        lastUpdated: settings.lastUpdated,
      });
    }
  } catch (error) {
    console.error("Currency settings fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch currency settings" },
      { status: 500 },
    );
  }
}

// PUT - Update currency settings (admin only)
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      supportedCurrencies,
      apiKey,
      apiEnabled,
      autoUpdate,
      updateFrequency,
      manualRates,
    } = body;

    let settings = await (CurrencySettings as any).findOne({
      baseCurrency: "PKR",
    });

    if (!settings) {
      settings = new CurrencySettings({
        baseCurrency: "PKR",
      });
    }

    // Update settings
    if (supportedCurrencies) settings.supportedCurrencies = supportedCurrencies;
    if (apiKey !== undefined) settings.apiKey = apiKey;
    if (apiEnabled !== undefined) settings.apiEnabled = apiEnabled;
    if (autoUpdate !== undefined) settings.autoUpdate = autoUpdate;
    if (updateFrequency) settings.updateFrequency = updateFrequency;

    // Update manual rates if provided
    if (manualRates) {
      settings.exchangeRates = new Map(Object.entries(manualRates));
      settings.lastUpdated = new Date();

      // Add to history
      if (!settings.exchangeRateHistory) {
        settings.exchangeRateHistory = [];
      }
      settings.exchangeRateHistory.push({
        date: new Date(),
        rates: manualRates,
        source: "manual",
      } as any);
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Currency settings updated successfully",
      settings: {
        baseCurrency: settings.baseCurrency,
        supportedCurrencies: settings.supportedCurrencies,
        exchangeRates: Object.fromEntries(settings.exchangeRates),
        lastUpdated: settings.lastUpdated,
        apiEnabled: settings.apiEnabled,
        autoUpdate: settings.autoUpdate,
      },
    });
  } catch (error) {
    console.error("Currency settings update failed:", error);
    return NextResponse.json(
      { error: "Failed to update currency settings" },
      { status: 500 },
    );
  }
}
