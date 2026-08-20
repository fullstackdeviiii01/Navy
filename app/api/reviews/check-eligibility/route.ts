// // app/api/reviews/check-eligibility/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../lib/auth/session";
import connectDB from "../../../../lib/db";
import Review from "../../../models/Review";
import Order from "../../../models/Order";
import User from "../../../models/User";

// GET - Check if user can review a product
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

    const token = getIdTokenFromHeader(request);
    let user = null;
    let sessionId = null;
    let guestEmail = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
      }
    }

    if (user) {
      // Logged-in user - Check if user already reviewed this product (ANY status)
      const existingReview = await Review.findOne({
        user_id: user._id,
        product_id: productId,
      });

      if (existingReview) {
        const statusMessage = existingReview.is_approved
          ? "You have already reviewed this product"
          : "You have a pending review for this product. Please wait for approval.";

        return NextResponse.json({
          canReview: false,
          reason: "already_reviewed",
          message: statusMessage,
          existingReview,
        });
      }

      // Check if user purchased this product AND order is delivered AND payment is paid
      const order = await Order.findOne({
        user_id: user._id,
        status: "delivered",
        payment_status: "paid",
        "items.product_id": productId,
      });

      if (!order) {
        return NextResponse.json({
          canReview: false,
          reason: "not_purchased",
          message: "You can only review products after your order has been delivered and payment is confirmed",
        });
      }

      return NextResponse.json({
        canReview: true,
        orderId: order._id,
        message: "You can review this product",
      });
    } else {
      // Guest user
      sessionId = getSessionIdFromRequest(request);
      if (!sessionId) {
        return NextResponse.json({
          canReview: false,
          reason: "not_authenticated",
          message: "Please sign in to write a review",
        });
      }

      // Check if guest has delivered order with this product AND payment is paid
      const order = await Order.findOne({
        session_id: sessionId,
        order_type: "guest",
        status: "delivered",
        payment_status: "paid",
        "items.product_id": productId,
      });

      if (!order) {
        return NextResponse.json({
          canReview: false,
          reason: "not_purchased",
          message: "You can only review products after your order has been delivered and payment is confirmed",
        });
      }

      guestEmail = order.guest_info?.email;
      if (!guestEmail) {
        return NextResponse.json({
          canReview: false,
          reason: "invalid_order",
          message: "Unable to verify your purchase",
        });
      }

      // Check if guest already reviewed this product (ANY status)
      const existingReview = await Review.findOne({
        guest_email: guestEmail.toLowerCase().trim(),
        product_id: productId,
      });

      if (existingReview) {
        const statusMessage = existingReview.is_approved
          ? "You have already reviewed this product"
          : "You have a pending review for this product. Please wait for approval.";

        return NextResponse.json({
          canReview: false,
          reason: "already_reviewed",
          message: statusMessage,
          existingReview,
        });
      }

      return NextResponse.json({
        canReview: true,
        orderId: order._id,
        message: "You can review this product",
      });
    }
  } catch (error) {
    console.error("Review eligibility check failed:", error);
    return NextResponse.json(
      { error: "Failed to check review eligibility" },
      { status: 500 }
    );
  }
}