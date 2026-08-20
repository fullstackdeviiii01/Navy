// app/api/reviews/[id]/helpful/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth";
import { getSessionIdFromRequest } from "../../../../../lib/auth/session";
import connectDB from "../../../../../lib/db";
import Review from "../../../../models/Review";
import User from "../../../../models/User";

// POST - Mark review as helpful or not helpful
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { vote_type } = body; // "helpful" or "not_helpful"

    if (!vote_type || !["helpful", "not_helpful"].includes(vote_type)) {
      return NextResponse.json(
        { error: "Invalid vote type. Must be 'helpful' or 'not_helpful'" },
        { status: 400 }
      );
    }

    const token = getIdTokenFromHeader(request);
    const sessionId = getSessionIdFromRequest(request);
    
    if (!token && !sessionId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    let user = null;
    let userId = null;

    if (token) {
      const decodedToken = await verifyIdToken(token);
      if (decodedToken) {
        user = await (User as any).findOne({ uid: decodedToken.uid });
        if (user) {
          userId = user._id;
        }
      }
    }

    const { id } = await params;
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Initialize helpful_votes if not exists
    if (!review.helpful_votes) {
      review.helpful_votes = {
        helpful_user_ids: [],
        helpful_guest_sessions: [],
        not_helpful_user_ids: [],
        not_helpful_guest_sessions: [],
      };
    }

    let alreadyVoted = false;
    let previousVote = null;

    if (userId) {
      // Logged-in user
      const userIdStr = userId.toString();
      
      // Check if already voted helpful
      if (review.helpful_votes.helpful_user_ids.some((id: any) => id.toString() === userIdStr)) {
        alreadyVoted = true;
        previousVote = "helpful";
      }
      
      // Check if already voted not helpful
      if (review.helpful_votes.not_helpful_user_ids.some((id: any) => id.toString() === userIdStr)) {
        alreadyVoted = true;
        previousVote = "not_helpful";
      }

      if (alreadyVoted) {
        if (previousVote === vote_type) {
          // Remove vote (toggle off)
          if (vote_type === "helpful") {
            review.helpful_votes.helpful_user_ids = review.helpful_votes.helpful_user_ids.filter(
              (id: any) => id.toString() !== userIdStr
            );
            review.helpful_count = Math.max(0, review.helpful_count - 1);
          } else {
            review.helpful_votes.not_helpful_user_ids = review.helpful_votes.not_helpful_user_ids.filter(
              (id: any) => id.toString() !== userIdStr
            );
            review.not_helpful_count = Math.max(0, review.not_helpful_count - 1);
          }
        } else {
          // Switch vote
          if (previousVote === "helpful") {
            review.helpful_votes.helpful_user_ids = review.helpful_votes.helpful_user_ids.filter(
              (id: any) => id.toString() !== userIdStr
            );
            review.helpful_count = Math.max(0, review.helpful_count - 1);
            review.helpful_votes.not_helpful_user_ids.push(userId);
            review.not_helpful_count += 1;
          } else {
            review.helpful_votes.not_helpful_user_ids = review.helpful_votes.not_helpful_user_ids.filter(
              (id: any) => id.toString() !== userIdStr
            );
            review.not_helpful_count = Math.max(0, review.not_helpful_count - 1);
            review.helpful_votes.helpful_user_ids.push(userId);
            review.helpful_count += 1;
          }
        }
      } else {
        // New vote
        if (vote_type === "helpful") {
          review.helpful_votes.helpful_user_ids.push(userId);
          review.helpful_count += 1;
        } else {
          review.helpful_votes.not_helpful_user_ids.push(userId);
          review.not_helpful_count += 1;
        }
      }
    } else {
      // Guest user
      if (!sessionId) {
        return NextResponse.json(
          { error: "Session required" },
          { status: 401 }
        );
      }

      // Check if already voted helpful
      if (review.helpful_votes.helpful_guest_sessions.includes(sessionId)) {
        alreadyVoted = true;
        previousVote = "helpful";
      }
      
      // Check if already voted not helpful
      if (review.helpful_votes.not_helpful_guest_sessions.includes(sessionId)) {
        alreadyVoted = true;
        previousVote = "not_helpful";
      }

      if (alreadyVoted) {
        if (previousVote === vote_type) {
          // Remove vote (toggle off)
          if (vote_type === "helpful") {
            review.helpful_votes.helpful_guest_sessions = review.helpful_votes.helpful_guest_sessions.filter(
              (s: string) => s !== sessionId
            );
            review.helpful_count = Math.max(0, review.helpful_count - 1);
          } else {
            review.helpful_votes.not_helpful_guest_sessions = review.helpful_votes.not_helpful_guest_sessions.filter(
              (s: string) => s !== sessionId
            );
            review.not_helpful_count = Math.max(0, review.not_helpful_count - 1);
          }
        } else {
          // Switch vote
          if (previousVote === "helpful") {
            review.helpful_votes.helpful_guest_sessions = review.helpful_votes.helpful_guest_sessions.filter(
              (s: string) => s !== sessionId
            );
            review.helpful_count = Math.max(0, review.helpful_count - 1);
            review.helpful_votes.not_helpful_guest_sessions.push(sessionId);
            review.not_helpful_count += 1;
          } else {
            review.helpful_votes.not_helpful_guest_sessions = review.helpful_votes.not_helpful_guest_sessions.filter(
              (s: string) => s !== sessionId
            );
            review.not_helpful_count = Math.max(0, review.not_helpful_count - 1);
            review.helpful_votes.helpful_guest_sessions.push(sessionId);
            review.helpful_count += 1;
          }
        }
      } else {
        // New vote
        if (vote_type === "helpful") {
          review.helpful_votes.helpful_guest_sessions.push(sessionId);
          review.helpful_count += 1;
        } else {
          review.helpful_votes.not_helpful_guest_sessions.push(sessionId);
          review.not_helpful_count += 1;
        }
      }
    }

    await review.save();

    // Determine current vote status
    let currentVote = null;
    if (userId) {
      if (review.helpful_votes.helpful_user_ids.some((id: any) => id.toString() === userId.toString())) {
        currentVote = "helpful";
      } else if (review.helpful_votes.not_helpful_user_ids.some((id: any) => id.toString() === userId.toString())) {
        currentVote = "not_helpful";
      }
    } else if (sessionId) {
      if (review.helpful_votes.helpful_guest_sessions.includes(sessionId)) {
        currentVote = "helpful";
      } else if (review.helpful_votes.not_helpful_guest_sessions.includes(sessionId)) {
        currentVote = "not_helpful";
      }
    }

    return NextResponse.json({
      success: true,
      helpful_count: review.helpful_count,
      not_helpful_count: review.not_helpful_count,
      current_vote: currentVote,
    });
  } catch (error) {
    console.error("Helpful vote failed:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}