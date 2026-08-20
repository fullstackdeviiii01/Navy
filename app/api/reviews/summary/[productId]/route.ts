// app/api/reviews/summary/[productId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../lib/db";
import ProductReviewSummary from "../../../../models/ProductReviewSummary";
import AISettings from "../../../../models/AISettings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectDB();

    const { productId } = await params;

    // Check if AI feature is active
    const aiSettings = await AISettings.findOne({ feature_type: "review_summary" });

    if (!aiSettings || !aiSettings.is_active) {
      return NextResponse.json({
        hasSummary: false,
        message: "AI summaries are currently unavailable",
      });
    }

    // Fetch summary
    const summary = await ProductReviewSummary.findOne({
      product_id: productId,
      is_active: true,
    }).lean();

    if (!summary) {
      return NextResponse.json({
        hasSummary: false,
        message: "No summary available for this product",
      });
    }

    return NextResponse.json({
      hasSummary: true,
      summary: {
        text: summary.summary,
        total_reviews: summary.total_reviews_analyzed,
        average_rating: summary.average_rating,
        generated_at: summary.generated_at,
      },
    });
  } catch (error) {
    console.error("Failed to fetch summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}