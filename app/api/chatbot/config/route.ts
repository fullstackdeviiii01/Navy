// app/api/chatbot/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import ChatbotConfig from "../../../models/ChatbotConfig";
import User from "../../../models/User";

// GET - public: get active config
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let config = await ChatbotConfig.findOne().lean();

    // Create default config if none exists
    if (!config) {
      config = await ChatbotConfig.create({});
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Chatbot config fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

// PUT - admin: update config
export async function PUT(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const decoded = await verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await (User as any).findOne({ uid: decoded.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Upsert config (only one document)
    const config = await ChatbotConfig.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Chatbot config update failed:", error);
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}