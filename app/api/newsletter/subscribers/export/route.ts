// app/api/newsletter/subscribers/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import connectDB from "../../../../../lib/db";
import NewsletterSubscriber from "../../../../models/NewsletterSubscriber";
import User from "../../../../models/User";

export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token)
      return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();

    const user = await (User as any).findOne({ uid: decodedToken.uid });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const query: any = {};
    if (status === "active") query.is_active = true;
    if (status === "inactive") query.is_active = false;

    const subscribers = await NewsletterSubscriber.find(query)
      .sort({ created_at: -1 })
      .lean();

    const csv = [
      ["Email", "Name", "Status", "Source", "Subscribed At", "Unsubscribed At"].join(","),
      ...subscribers.map((sub: any) =>
        [
          sub.email,
          sub.name || "",
          sub.is_active ? "Active" : "Inactive",
          sub.source,
          new Date(sub.subscribed_at).toISOString(),
          sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toISOString() : "",
        ].join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}