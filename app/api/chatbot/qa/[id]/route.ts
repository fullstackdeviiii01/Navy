// app/api/chatbot/qa/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import connectDB from "../../../../../lib/db";
import ChatbotQA from "../../../../models/ChatbotQA";
import User from "../../../../models/User";

async function verifyAdmin(request: NextRequest) {
  const token = getIdTokenFromHeader(request);
  if (!token) return null;
  const decoded = await verifyIdToken(token);
  if (!decoded) return null;
  await connectDB();
  const user = await (User as any).findOne({ uid: decoded.uid });
  if (!user || user.role !== "admin") return null;
  return user;
}

// GET single QA (admin + public answer fetch)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get("admin") === "true";

    const qa = isAdmin
      ? await ChatbotQA.findById(id)
      : await ChatbotQA.findOne({ _id: id, is_visible: true });

    if (!qa) {
      return NextResponse.json({ error: "Q&A not found" }, { status: 404 });
    }

    // Increment click count for public access (answer fetch)
    if (!isAdmin) {
      await ChatbotQA.findByIdAndUpdate(id, { $inc: { click_count: 1 } });
    }

    return NextResponse.json({ qa });
  } catch (error) {
    console.error("Chatbot QA fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch Q&A" }, { status: 500 });
  }
}

// PUT - admin: update QA
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const qa = await ChatbotQA.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!qa) {
      return NextResponse.json({ error: "Q&A not found" }, { status: 404 });
    }

    return NextResponse.json({ qa });
  } catch (error) {
    console.error("Chatbot QA update failed:", error);
    return NextResponse.json({ error: "Failed to update Q&A" }, { status: 500 });
  }
}

// DELETE - admin: delete QA
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const qa = await ChatbotQA.findByIdAndDelete(id);

    if (!qa) {
      return NextResponse.json({ error: "Q&A not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Q&A deleted" });
  } catch (error) {
    console.error("Chatbot QA delete failed:", error);
    return NextResponse.json({ error: "Failed to delete Q&A" }, { status: 500 });
  }
}