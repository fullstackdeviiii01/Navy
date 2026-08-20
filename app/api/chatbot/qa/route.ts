// app/api/chatbot/qa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import ChatbotQA from "../../../models/ChatbotQA";
import User from "../../../models/User";

// GET - public: fetch visible QAs | admin: fetch all
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const isAdmin = url.searchParams.get("admin") === "true";
    const category = url.searchParams.get("category");

    if (isAdmin) {
      const token = getIdTokenFromHeader(request);
      if (!token) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 });
      }
      const decoded = await verifyIdToken(token);
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      const user = await (User as any).findOne({ uid: decoded.uid });
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const query: any = {};
      if (category && category !== "all") query.category = category;

      const qas = await ChatbotQA.find(query).sort({ sort_order: 1, created_at: -1 });
      return NextResponse.json({ qas });
    }

    // Public: only visible
    const query: any = { is_visible: true };
    if (category && category !== "all") query.category = category;

    const qas = await ChatbotQA.find(query)
      .sort({ sort_order: 1, created_at: -1 })
      .select("_id question category sort_order");

    return NextResponse.json({ qas });
  } catch (error) {
    console.error("Chatbot QA fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch Q&As" }, { status: 500 });
  }
}

// POST - admin only: create QA
export async function POST(request: NextRequest) {
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
    const { question, answer, category, is_visible, sort_order } = body;

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const qa = await ChatbotQA.create({
      question: question.trim(),
      answer,
      category: category?.trim() || "General",
      is_visible: is_visible ?? true,
      sort_order: sort_order ?? 0,
    });

    return NextResponse.json({ qa }, { status: 201 });
  } catch (error) {
    console.error("Chatbot QA create failed:", error);
    return NextResponse.json({ error: "Failed to create Q&A" }, { status: 500 });
  }
}