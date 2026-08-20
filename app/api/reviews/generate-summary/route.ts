// app/api/reviews/generate-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getIdTokenFromHeader,
  verifyIdToken,
} from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import Review from "../../../models/Review";
import AISettings from "../../../models/AISettings";
import ProductReviewSummary from "../../../models/ProductReviewSummary";
import User from "../../../models/User";
import axios from "axios";

export async function POST(request: NextRequest) {
  console.log("\n========================================");
  console.log("[generate-summary] POST request received");
  console.log("[generate-summary] Timestamp:", new Date().toISOString());
  console.log("========================================\n");

  try {
    // ─── AUTH ───────────────────────────────────────────────
    console.log("[AUTH] Extracting token from header...");
    const token = getIdTokenFromHeader(request);

    if (!token) {
      console.log("[AUTH] ❌ No token found in request header");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    console.log("[AUTH] ✓ Token found");

    console.log("[AUTH] Verifying token with Firebase...");
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      console.log("[AUTH] ❌ Token verification failed");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    console.log("[AUTH] ✓ Token verified. UID:", decodedToken.uid);

    // ─── DB ─────────────────────────────────────────────────
    console.log("\n[DB] Connecting to database...");
    await connectDB();
    console.log("[DB] ✓ Connected");

    // ─── USER ───────────────────────────────────────────────
    console.log("\n[USER] Looking up user with UID:", decodedToken.uid);
    const user = await (User as any).findOne({ uid: decodedToken.uid });

    if (!user) {
      console.log("[USER] ❌ User not found in DB");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("[USER] ✓ User found:", {
      id: user._id,
      role: user.role,
      email: user.email,
    });

    if (user.role !== "admin") {
      console.log("[USER] ❌ User is not admin. Role:", user.role);
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }
    console.log("[USER] ✓ Admin access confirmed");

    // ─── REQUEST BODY ────────────────────────────────────────
    console.log("\n[REQUEST] Parsing request body...");
    const body = await request.json();
    console.log("[REQUEST] Body received:", JSON.stringify(body, null, 2));

    const { product_id } = body;

    if (!product_id) {
      console.log("[REQUEST] ❌ product_id is missing");
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }
    console.log("[REQUEST] ✓ product_id:", product_id);

    // ─── AI SETTINGS ─────────────────────────────────────────
    console.log("\n[AI SETTINGS] Fetching AI settings from DB...");
    const aiSettings = await AISettings.findOne({
      feature_type: "review_summary",
    });

    if (!aiSettings) {
      console.log("[AI SETTINGS] ❌ No AI settings found in DB");
      return NextResponse.json(
        { error: "AI feature is not configured or not active" },
        { status: 400 },
      );
    }

    console.log("[AI SETTINGS] ✓ Settings found:");
    console.log("  - feature_type:", aiSettings.feature_type);
    console.log("  - is_active:", aiSettings.is_active);
    console.log("  - selected_model:", aiSettings.selected_model);
    console.log("  - max_tokens:", aiSettings.max_tokens);
    console.log("  - temperature:", aiSettings.temperature);
    console.log("  - api_key present:", !!aiSettings.openrouter_api_key);
    console.log(
      "  - api_key length:",
      aiSettings.openrouter_api_key?.length || 0,
    );
    console.log(
      "  - api_key preview:",
      aiSettings.openrouter_api_key
        ? `${aiSettings.openrouter_api_key.substring(0, 10)}...${aiSettings.openrouter_api_key.slice(-4)}`
        : "MISSING",
    );
    console.log(
      "  - api_key starts with sk-or-v1:",
      aiSettings.openrouter_api_key?.startsWith("sk-or-v1-"),
    );
    console.log(
      "  - api_key is masked (BAD):",
      aiSettings.openrouter_api_key?.startsWith("sk-..."),
    );

    if (!aiSettings.is_active) {
      console.log("[AI SETTINGS] ❌ AI feature is not active");
      return NextResponse.json(
        { error: "AI feature is not configured or not active" },
        { status: 400 },
      );
    }

    if (!aiSettings.openrouter_api_key) {
      console.log("[AI SETTINGS] ❌ API key is empty");
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 400 },
      );
    }

    if (aiSettings.openrouter_api_key.startsWith("sk-...")) {
      console.log("[AI SETTINGS] ❌ API key is masked — not a real key!");
      return NextResponse.json(
        {
          error:
            "OpenRouter API key is invalid (masked key stored). Please re-enter your real API key in AI Settings.",
        },
        { status: 400 },
      );
    }

    // ─── REVIEWS ─────────────────────────────────────────────
    console.log(
      "\n[REVIEWS] Fetching approved reviews for product:",
      product_id,
    );
    const reviews = await Review.find({
      product_id,
      is_approved: true,
    })
      .select("rating title comment detailed_ratings")
      .lean();

    console.log("[REVIEWS] ✓ Found", reviews.length, "approved reviews");

    if (reviews.length === 0) {
      console.log("[REVIEWS] ❌ No approved reviews found");
      return NextResponse.json(
        { error: "No approved reviews found for this product" },
        { status: 404 },
      );
    }

    // ─── PROMPT ──────────────────────────────────────────────
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    console.log("\n[PROMPT] Average rating:", avgRating.toFixed(2));

    const reviewTexts = reviews.map((review) => {
      const detailedRatings = review.detailed_ratings
        ? `Quality: ${review.detailed_ratings.quality}/5, Durability: ${review.detailed_ratings.durability}/5, Matches Description: ${review.detailed_ratings.matches_description}/5`
        : "";
      return `Rating: ${review.rating}/5. ${review.title}. ${review.comment}${detailedRatings ? ` - ${detailedRatings}` : ""}`;
    });

    const prompt = `Analyze these customer reviews and respond with ONLY the summary text. No intro, no outro, no "here is the summary", no extra sentences. Just the summary itself in 3-4 lines.

Reviews (${reviews.length} total, average rating: ${avgRating.toFixed(1)}/5):

${reviewTexts.join("\n\n")}

Rules:
- Output ONLY the summary paragraph
- Do NOT start with "Here is", "Based on", "The reviews", or any intro phrase
- Do NOT add any closing sentence
- Just the clean summary, nothing else.`;
    console.log("[PROMPT] Prompt length (chars):", prompt.length);
    console.log(
      "[PROMPT] Estimated prompt tokens:",
      Math.ceil(prompt.length / 4),
    );

    // ─── OPENROUTER REQUEST ──────────────────────────────────
    console.log("\n[OPENROUTER] Preparing API request...");
    console.log(
      "[OPENROUTER] Endpoint: https://openrouter.ai/api/v1/chat/completions",
    );
    console.log("[OPENROUTER] Model:", aiSettings.selected_model);
    console.log("[OPENROUTER] Max tokens:", aiSettings.max_tokens);
    console.log("[OPENROUTER] Temperature:", aiSettings.temperature);

    const origin = request.headers.get("origin") || "https://yourdomain.com";
    console.log("[OPENROUTER] HTTP-Referer:", origin);

    const requestPayload = {
      model: aiSettings.selected_model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: aiSettings.temperature,
      max_tokens: aiSettings.max_tokens,
    };

    console.log("[OPENROUTER] Request payload (without prompt):", {
      model: requestPayload.model,
      temperature: requestPayload.temperature,
      max_tokens: requestPayload.max_tokens,
      messages_count: requestPayload.messages.length,
    });

    console.log("[OPENROUTER] Making API call now...");
    const startTime = Date.now();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      requestPayload,
      {
        headers: {
          Authorization: `Bearer ${aiSettings.openrouter_api_key}`,
          "HTTP-Referer": origin,
          "X-Title": "Review Summary Generator",
          "Content-Type": "application/json",
        },
      },
    );

    const elapsed = Date.now() - startTime;
    console.log(`[OPENROUTER] ✓ Response received in ${elapsed}ms`);
    console.log("[OPENROUTER] Response status:", response.status);
    console.log(
      "[OPENROUTER] Response headers:",
      JSON.stringify(response.headers, null, 2),
    );
    console.log(
      "[OPENROUTER] Full response data:",
      JSON.stringify(response.data, null, 2),
    );

    const choice = response.data.choices?.[0];
    if (!choice) {
      console.log("[OPENROUTER] ❌ No choices in response");
      console.log(
        "[OPENROUTER] Full response:",
        JSON.stringify(response.data, null, 2),
      );
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 },
      );
    }

    console.log("[OPENROUTER] Finish reason:", choice.finish_reason);
    console.log(
      "[OPENROUTER] Usage:",
      JSON.stringify(response.data.usage, null, 2),
    );

    const summary = choice.message.content.trim();
    console.log("[OPENROUTER] ✓ Summary length:", summary.length, "chars");
    console.log("[OPENROUTER] Summary preview:", summary.substring(0, 150));

    // ─── SAVE SUMMARY ────────────────────────────────────────
    console.log("\n[DB] Saving summary to DB for product:", product_id);
    let productSummary = await ProductReviewSummary.findOne({ product_id });

    if (productSummary) {
      console.log("[DB] Existing summary found, updating...");
      productSummary.summary = summary;
      productSummary.total_reviews_analyzed = reviews.length;
      productSummary.average_rating = avgRating;
      productSummary.generated_at = new Date();
      productSummary.generated_by = user._id;
      productSummary.model_used = aiSettings.selected_model;
      productSummary.is_active = true;
      await productSummary.save();
    } else {
      console.log("[DB] No existing summary, creating new record...");
      productSummary = new ProductReviewSummary({
        product_id,
        summary,
        total_reviews_analyzed: reviews.length,
        average_rating: avgRating,
        generated_by: user._id,
        model_used: aiSettings.selected_model,
        is_active: true,
      });
      await productSummary.save();
    }
    console.log("[DB] ✓ Summary saved. ID:", productSummary._id);

    console.log("\n[generate-summary] ✅ SUCCESS - returning response");
    console.log("========================================\n");

    return NextResponse.json({
      success: true,
      message: "Review summary generated successfully",
      summary: {
        text: summary,
        total_reviews: reviews.length,
        average_rating: avgRating,
        generated_at: productSummary.generated_at,
        model_used: aiSettings.selected_model,
      },
    });
  } catch (error: any) {
    console.log("\n[generate-summary] ❌ ERROR CAUGHT");
    console.log("========================================");
    console.error("[ERROR] Message:", error.message);
    console.error("[ERROR] Name:", error.name);
    console.error("[ERROR] Code:", error.code);

    if (error.isAxiosError) {
      console.error("\n[AXIOS ERROR] This is an Axios error");
      console.error("[AXIOS ERROR] Status:", error.response?.status);
      console.error("[AXIOS ERROR] Status Text:", error.response?.statusText);
      console.error(
        "[AXIOS ERROR] Response Headers:",
        JSON.stringify(error.response?.headers, null, 2),
      );
      console.error(
        "[AXIOS ERROR] Response Data:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error("[AXIOS ERROR] Request URL:", error.config?.url);
      console.error("[AXIOS ERROR] Request Method:", error.config?.method);
      console.error("[AXIOS ERROR] Request Headers (sanitized):", {
        ...error.config?.headers,
        Authorization: error.config?.headers?.Authorization
          ? `Bearer ${error.config.headers.Authorization.substring(7, 17)}...`
          : "MISSING",
      });

      const status = error.response?.status;
      const errorData = error.response?.data;

      if (status === 401) {
        console.error("[AXIOS ERROR] → 401: Invalid or missing API key");
        return NextResponse.json(
          {
            error:
              "Invalid OpenRouter API key. Please update your key in AI Settings.",
          },
          { status: 400 },
        );
      }

      if (status === 402) {
        console.error("[AXIOS ERROR] → 402: Insufficient credits");
        return NextResponse.json(
          {
            error:
              "Insufficient OpenRouter credits. Please add credits at openrouter.ai/credits.",
          },
          { status: 400 },
        );
      }

      if (status === 429) {
        console.error("[AXIOS ERROR] → 429: Rate limit or quota exceeded");
        console.error(
          "[AXIOS ERROR] 429 full detail:",
          JSON.stringify(errorData, null, 2),
        );
        return NextResponse.json(
          {
            error: `Rate limit exceeded: ${
              errorData?.error?.message ||
              "Too many requests. Try again later or switch to a different model."
            }`,
          },
          { status: 429 },
        );
      }

      if (status === 503 || status === 502) {
        console.error("[AXIOS ERROR] → 502/503: Model unavailable");
        return NextResponse.json(
          {
            error:
              "The selected AI model is currently unavailable. Please try a different model.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error:
            errorData?.error?.message ||
            `OpenRouter error (${status}): Failed to generate summary`,
        },
        { status: 500 },
      );
    }

    console.error("\n[NON-AXIOS ERROR]");
    console.error("[ERROR] Stack:", error.stack);

    return NextResponse.json(
      { error: error.message || "Failed to generate summary" },
      { status: 500 },
    );
  }
}
