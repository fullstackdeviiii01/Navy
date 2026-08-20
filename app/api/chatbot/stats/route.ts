// app/api/chatbot/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import ChatbotQA from "../../../models/ChatbotQA";
import User from "../../../models/User";

export async function GET(request: NextRequest) {
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

    const [total, visible, topQuestions] = await Promise.all([
      ChatbotQA.countDocuments(),
      ChatbotQA.countDocuments({ is_visible: true }),
      ChatbotQA.find({ click_count: { $gt: 0 } })
        .sort({ click_count: -1 })
        .limit(5)
        .select("question click_count"),
    ]);

    return NextResponse.json({
      stats: {
        total_questions: total,
        visible_questions: visible,
        top_questions: topQuestions,
      },
    });
  } catch (error) {
    console.error("Chatbot stats fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}