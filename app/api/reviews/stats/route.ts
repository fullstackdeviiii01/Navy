// app/api/reviews/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "../../../../lib/db";
import Review from "../../../models/Review";

// GET - Get review statistics for a product
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const productId = url.searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(productId);

    // Overall rating stats
    const stats = await Review.aggregate([
      {
        $match: {
          product_id: objectId,
          is_approved: true,
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    // Detailed ratings stats
    const detailedStats = await Review.aggregate([
      {
        $match: {
          product_id: objectId,
          is_approved: true,
        },
      },
      {
        $group: {
          _id: null,
          avgQuality: { $avg: "$detailed_ratings.quality" },
          avgDurability: { $avg: "$detailed_ratings.durability" },
          avgMatchesDescription: { $avg: "$detailed_ratings.matches_description" },
        },
      },
    ]);

    // Calculate distribution
    const distribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalReviews = 0;
    let totalRating = 0;

    stats.forEach((stat) => {
      distribution[stat._id] = stat.count;
      totalReviews += stat.count;
      totalRating += stat._id * stat.count;
    });

    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Calculate percentages
    const percentages: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    Object.keys(distribution).forEach((key) => {
      const rating = Number(key);
      percentages[rating] = totalReviews > 0 ? (distribution[rating] / totalReviews) * 100 : 0;
    });

    // Count reviews with images
    const reviewsWithImages = await Review.countDocuments({
      product_id: objectId,
      is_approved: true,
      "images.0": { $exists: true },
    });

    // Count reviews with videos
    const reviewsWithVideos = await Review.countDocuments({
      product_id: objectId,
      is_approved: true,
      "videos.0": { $exists: true },
    });

    // Count verified purchases
    const verifiedPurchases = await Review.countDocuments({
      product_id: objectId,
      is_approved: true,
      verified_purchase: true,
    });

    return NextResponse.json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      distribution,
      percentages,
      detailedRatings: detailedStats.length > 0 ? {
        quality: Math.round(detailedStats[0].avgQuality * 10) / 10,
        durability: Math.round(detailedStats[0].avgDurability * 10) / 10,
        matches_description: Math.round(detailedStats[0].avgMatchesDescription * 10) / 10,
      } : null,
      reviewsWithImages,
      reviewsWithVideos,
      verifiedPurchases,
    });
  } catch (error) {
    console.error("Review stats fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch review stats" },
      { status: 500 }
    );
  }
}