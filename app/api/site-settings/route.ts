import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import SiteSettings from "../../models/SiteSettings";
import User from "../../models/User";

async function getGlobalSettings() {
  let settings = await (SiteSettings as any).findOne({ is_global_settings: true });

  if (!settings) {
    settings = await (SiteSettings as any).create({
      is_global_settings: true
    });
  }

  return settings;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const settingsType = url.searchParams.get("type");

    if (settingsType === 'company') {
      const settings = await getGlobalSettings();
      return NextResponse.json({
        company_info: settings.company_info || {}
      });
    }

    return NextResponse.json({ error: "Invalid type parameter. Use ?type=company" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/site-settings: Fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { updateType, ...data } = body;

    if (updateType !== 'company') {
      return NextResponse.json({ error: "Invalid updateType. Use updateType: 'company'" }, { status: 400 });
    }

    const settings = await getGlobalSettings();

    if (data.company_info) {
      settings.company_info = data.company_info;
    }

    settings.updated_by = adminUser._id;
    settings.updated_at = new Date();
    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        _id: settings._id,
        updated_at: settings.updated_at
      }
    });
  } catch (error) {
    console.error("PUT /api/site-settings: Update failed:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
