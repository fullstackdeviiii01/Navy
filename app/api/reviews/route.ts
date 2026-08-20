// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import { getSessionIdFromRequest } from "../../../lib/auth/session";
import connectDB from "../../../lib/db";
import Review from "../../models/Review";
import Order from "../../models/Order";
import User from "../../models/User";

// GET - Fetch reviews (public for products, admin for all, user for own)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const productId = url.searchParams.get("product_id");
    const isAdmin = url.searchParams.get("admin") === "true";
    const myReviews = url.searchParams.get("my_reviews") === "true";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search");
    const verifiedOnly = url.searchParams.get("verified_only") === "true";
    const withImages = url.searchParams.get("with_images") === "true";
    const minRating = url.searchParams.get("min_rating");

    // Admin or user own reviews require authentication
    if (isAdmin || myReviews) {
      const token = getIdTokenFromHeader(request);
      if (!token) {
        return NextResponse.json(
          { error: "No token provided" },
          { status: 401 },
        );
      }

      const decodedToken = await verifyIdToken(token);
      if (!decodedToken) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const user = await (User as any).findOne({ uid: decodedToken.uid });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Admin reviews
      if (isAdmin) {
        if (user.role !== "admin") {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const query: any = {};

        if (status === "pending") {
          query.is_approved = false;
        } else if (status === "approved") {
          query.is_approved = true;
        }

        if (search) {
          query.$or = [
            { title: { $regex: search, $options: "i" } },
            { comment: { $regex: search, $options: "i" } },
          ];
        }

        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
          Review.find(query)
            .populate("user_id", "name email avatar_url")
            .populate("product_id", "name images")
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Review.countDocuments(query),
        ]);

        return NextResponse.json({
          reviews,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
      }

      // User's own reviews
      if (myReviews) {
        const query: any = { user_id: user._id };

        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
          Review.find(query)
            .populate("product_id", "name images")
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Review.countDocuments(query),
        ]);

        return NextResponse.json({
          reviews,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
      }
    }

    // Public product reviews
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const query: any = {
      product_id: productId,
      is_approved: true,
    };

    if (verifiedOnly) {
      query.verified_purchase = true;
    }

    if (withImages) {
      query["images.0"] = { $exists: true };
    }

    const withVideos = url.searchParams.get("with_videos") === "true";
    if (withVideos) {
      query["videos.0"] = { $exists: true };
    }

    if (minRating) {
      query.rating = { $gte: parseInt(minRating) };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};

    // Custom sort for helpful
    if (sortBy === "helpful") {
      sort.helpful_count = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("user_id", "name avatar_url")
        .select("+videos")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Reviews fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      product_id,
      rating,
      title,
      comment,
      detailed_ratings,
      images,
      videos,
    } = body;

    // Validation
    if (!product_id || !rating || !title || !comment || !detailed_ratings) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate detailed ratings
    const { quality, durability, matches_description } = detailed_ratings;
    if (!quality || !durability || !matches_description) {
      return NextResponse.json(
        { error: "All detailed ratings are required" },
        { status: 400 },
      );
    }

    if (
      quality < 1 ||
      quality > 5 ||
      durability < 1 ||
      durability > 5 ||
      matches_description < 1 ||
      matches_description > 5
    ) {
      return NextResponse.json(
        { error: "All detailed ratings must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate images (max 5)
    if (images && images.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 images allowed" },
        { status: 400 },
      );
    }

    // Validate videos (max 2)
    if (videos && videos.length > 2) {
      return NextResponse.json(
        { error: "Maximum 2 videos allowed" },
        { status: 400 },
      );
    }

    const token = getIdTokenFromHeader(request);
    let user = null;
    let sessionId = null;
    let guestEmail = null;
    let order = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    if (user) {
      // Logged-in user
      const existingReview = await Review.findOne({
        user_id: user._id,
        product_id,
      });

      if (existingReview) {
        return NextResponse.json(
          {
            error: existingReview.is_approved
              ? "You have already reviewed this product"
              : "You already have a pending review for this product. Please wait for approval.",
          },
          { status: 400 },
        );
      }

      order = await Order.findOne({
        user_id: user._id,
        status: "delivered",
        "items.product_id": product_id,
      });

      if (!order) {
        return NextResponse.json(
          { error: "You can only review products you have purchased" },
          { status: 403 },
        );
      }

      const review = new Review({
        user_id: user._id,
        product_id,
        order_id: order._id,
        rating,
        title,
        comment,
        detailed_ratings: {
          quality,
          durability,
          matches_description,
        },
        images: images || [],
        videos: videos || [],
        verified_purchase: true,
        is_approved: false,
        helpful_votes: {
          helpful_user_ids: [],
          helpful_guest_sessions: [],
          not_helpful_user_ids: [],
          not_helpful_guest_sessions: [],
        },
        helpful_count: 0,
        not_helpful_count: 0,
      });

      await review.save();

      return NextResponse.json({
        success: true,
        message:
          "Review submitted successfully. It will be published after approval.",
        review,
      });
    } else {
      // Guest user
      sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json(
          { error: "Please sign in to write a review" },
          { status: 401 },
        );
      }

      order = await Order.findOne({
        session_id: sessionId,
        order_type: "guest",
        status: "delivered",
        "items.product_id": product_id,
      });

      if (!order) {
        return NextResponse.json(
          {
            error:
              "You can only review products you have purchased and received",
          },
          { status: 403 },
        );
      }

      guestEmail = order.guest_info?.email;
      if (!guestEmail) {
        return NextResponse.json(
          { error: "Unable to verify your purchase" },
          { status: 400 },
        );
      }

      const existingReview = await Review.findOne({
        guest_email: guestEmail.toLowerCase().trim(),
        product_id,
      });

      if (existingReview) {
        return NextResponse.json(
          {
            error: existingReview.is_approved
              ? "You have already reviewed this product"
              : "You already have a pending review for this product. Please wait for approval.",
          },
          { status: 400 },
        );
      }

      const review = new Review({
        guest_email: guestEmail.toLowerCase().trim(),
        guest_name: order.guest_info.name,
        product_id,
        order_id: order._id,
        rating,
        title,
        comment,
        detailed_ratings: {
          quality,
          durability,
          matches_description,
        },
        images: images || [],
        videos: videos || [],
        verified_purchase: true,
        is_approved: false,
        helpful_votes: {
          helpful_user_ids: [],
          helpful_guest_sessions: [],
          not_helpful_user_ids: [],
          not_helpful_guest_sessions: [],
        },
        helpful_count: 0,
        not_helpful_count: 0,
      });

      await review.save();

      return NextResponse.json({
        success: true,
        message:
          "Review submitted successfully. It will be published after approval.",
        review,
      });
    }
  } catch (error: any) {
    console.error("Review creation failed:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}
