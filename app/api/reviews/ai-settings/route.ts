// app/api/reviews/ai-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import AISettings from "../../../models/AISettings";
import User from "../../../models/User";

// GET - Fetch AI settings
export async function GET(request: NextRequest) {
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

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    let settings = await AISettings.findOne({ feature_type: "review_summary" });

    // Return empty settings if not configured yet
    if (!settings) {
      return NextResponse.json({
        settings: {
          feature_type: "review_summary",
          is_active: false,
          openrouter_api_key: "",
          selected_model: "google/gemma-3-27b-it:free",
          max_tokens: 500,
          temperature: 0.7,
        },
        isConfigured: false,
      });
    }

    // Never send the real API key to the frontend — just indicate if it's set
    return NextResponse.json({
      settings: {
        feature_type: settings.feature_type,
        is_active: settings.is_active,
        openrouter_api_key: "", // Always return empty — frontend clears the field
        selected_model: settings.selected_model,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
      },
      isConfigured: !!settings.openrouter_api_key,
    });
  } catch (error) {
    console.error("Failed to fetch AI settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI settings" },
      { status: 500 }
    );
  }
}

// POST - Create or update AI settings
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

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      openrouter_api_key,
      selected_model,
      max_tokens,
      temperature,
      is_active,
    } = body;

    // Validation
    if (!selected_model) {
      return NextResponse.json(
        { error: "Model selection is required" },
        { status: 400 }
      );
    }

    if (max_tokens < 100 || max_tokens > 2000) {
      return NextResponse.json(
        { error: "Max tokens must be between 100 and 2000" },
        { status: 400 }
      );
    }

    if (temperature < 0 || temperature > 2) {
      return NextResponse.json(
        { error: "Temperature must be between 0 and 2" },
        { status: 400 }
      );
    }

    let settings = await AISettings.findOne({ feature_type: "review_summary" });

    if (settings) {
      // Only update the API key if a real new key is provided (not empty, not masked)
      if (
        openrouter_api_key &&
        openrouter_api_key.trim() !== "" &&
        !openrouter_api_key.startsWith("sk-...")
      ) {
        settings.openrouter_api_key = openrouter_api_key.trim();
      } else if (!settings.openrouter_api_key) {
        // No existing key and no new key provided
        return NextResponse.json(
          { error: "API key is required" },
          { status: 400 }
        );
      }

      settings.selected_model = selected_model;
      settings.max_tokens = max_tokens;
      settings.temperature = temperature;
      settings.is_active = is_active !== undefined ? is_active : settings.is_active;
      await settings.save();
    } else {
      // Creating new settings — API key is required
      if (!openrouter_api_key || openrouter_api_key.trim() === "") {
        return NextResponse.json(
          { error: "API key is required" },
          { status: 400 }
        );
      }

      settings = new AISettings({
        feature_type: "review_summary",
        openrouter_api_key: openrouter_api_key.trim(),
        selected_model,
        max_tokens,
        temperature,
        is_active: is_active !== undefined ? is_active : false,
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      message: "AI settings saved successfully",
      settings: {
        is_active: settings.is_active,
        selected_model: settings.selected_model,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
      },
    });
  } catch (error) {
    console.error("Failed to save AI settings:", error);
    return NextResponse.json(
      { error: "Failed to save AI settings" },
      { status: 500 }
    );
  }
}

// PUT - Toggle AI feature active status
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

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { is_active } = body;

    const settings = await AISettings.findOne({ feature_type: "review_summary" });

    if (!settings) {
      return NextResponse.json(
        { error: "AI settings not configured. Please configure settings first." },
        { status: 400 }
      );
    }

    settings.is_active = is_active;
    await settings.save();

    return NextResponse.json({
      success: true,
      message: `AI feature ${is_active ? "activated" : "deactivated"} successfully`,
      is_active: settings.is_active,
    });
  } catch (error) {
    console.error("Failed to toggle AI feature:", error);
    return NextResponse.json(
      { error: "Failed to toggle AI feature" },
      { status: 500 }
    );
  }
}