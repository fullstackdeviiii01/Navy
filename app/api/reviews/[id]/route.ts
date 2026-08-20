// // app/api/reviews/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Review from "../../../models/Review";
import User from "../../../models/User";
import { deleteReviewMedia } from "../../../../lib/media-deletion/reviewFileUtils";


// PUT - Update a review (user edits own OR admin approves/rejects)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await (User as any).findOne({ email: decodedToken.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const body = await request.json();
    const { rating, title, comment, detailed_ratings, images, is_approved } = body;

    // Admin approval/rejection
    if (is_approved !== undefined && user.role === "admin") {
      review.is_approved = is_approved;
      await review.save();

      return NextResponse.json({
        success: true,
        message: `Review ${is_approved ? "approved" : "rejected"} successfully`,
        review,
      });
    }

    // User editing own review
    if (review.user_id?.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    // Validate ratings
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (detailed_ratings) {
      const { quality, durability, matches_description } = detailed_ratings;
      if (quality < 1 || quality > 5 || durability < 1 || durability > 5 || matches_description < 1 || matches_description > 5) {
        return NextResponse.json(
          { error: "All detailed ratings must be between 1 and 5" },
          { status: 400 }
        );
      }
    }

    // Validate images
    if (images && images.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 images allowed" },
        { status: 400 }
      );
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (detailed_ratings !== undefined) review.detailed_ratings = detailed_ratings;
    if (images !== undefined) review.images = images;
    
    // Reset approval status when edited
    review.is_approved = false;

    await review.save();

    return NextResponse.json({
      success: true,
      message: "Review updated successfully. It will be published after re-approval.",
      review,
    });
  } catch (error) {
    console.error("Review update failed:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}
// DELETE - Delete a review (user deletes own OR admin deletes any)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await (User as any).findOne({ email: decodedToken.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if user owns this review or is admin
    if (review.user_id?.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Extract media URLs before deletion
    const imageUrls = review.images?.map((img: any) => img.url) || [];
    const videoUrls = review.videos?.map((video: any) => video.url) || [];

    // Delete review from database
    await Review.findByIdAndDelete(id);

    // Delete associated media files
    const mediaResults = await deleteReviewMedia(imageUrls, videoUrls);
    
    console.log(`Deleted ${mediaResults.totalDeleted} review media files, ${mediaResults.totalFailed} failed`);

    return NextResponse.json({
      success: true,
      message: "Review and associated media deleted successfully",
      deletedMedia: mediaResults,
    });
  } catch (error) {
    console.error("Review deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}