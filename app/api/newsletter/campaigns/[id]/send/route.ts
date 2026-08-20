// app/api/newsletter/campaigns/[id]/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import NewsletterCampaign from "../../../../../models/NewsletterCampaign";
import NewsletterSubscriber from "../../../../../models/NewsletterSubscriber";
import User from "../../../../../models/User";
import { EmailService } from "../../../../../../lib/services/emailService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const campaign = await NewsletterCampaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.status === "sent") {
      return NextResponse.json(
        { error: "Campaign already sent" },
        { status: 400 }
      );
    }

    const subscribers = await NewsletterSubscriber.find({
      is_active: true,
    }).lean();

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers" },
        { status: 400 }
      );
    }

    let sentCount = 0;

    for (const subscriber of subscribers) {
      try {
        await (EmailService as any).sendNewsletterEmail(
          subscriber.email,
          campaign.subject,
          campaign.content
        );
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
      }
    }

    campaign.status = "sent";
    campaign.sent_at = new Date();
    campaign.recipients_count = sentCount;
    await campaign.save();

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${sentCount} subscribers`,
      campaign,
    });
  } catch (error) {
    console.error("Campaign send failed:", error);
    return NextResponse.json(
      { error: "Failed to send campaign" },
      { status: 500 }
    );
  }
}