/**
 * app/api/cj/credentials/route.ts
 *
 * Admin-only CJ Dropshipping credentials management.
 * Mirrors app/api/aliexpress/credentials/route.ts exactly.
 *
 * GET    — returns masked credential status (never exposes raw secrets)
 * POST   — save new credentials (encrypts sensitive fields before storing)
 * DELETE — deactivate credentials
 */

import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import CJCredentials from "../../../models/CJCredentials";
import { invalidateCJTokenCache } from "../../../../lib/cj/auth";

// ── GET — return current credential status ────────────────────────────────────
export async function GET(request: NextRequest) {
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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const cred = await (CJCredentials as any)
      .findOne({ is_active: true })
      .sort({ created_at: -1 })
      .select("api_key is_active created_at updated_at");

    if (!cred) {
      return NextResponse.json({ credentials: null });
    }

    const maskedApiKey = cred.api_key
      ? `${cred.api_key.substring(0, 6)}${"*".repeat(Math.max(0, cred.api_key.length - 6))}`
      : null;

    return NextResponse.json({
      credentials: {
        _id: cred._id,
        api_key_masked: maskedApiKey,
        is_active: cred.is_active,
        created_at: cred.created_at,
        updated_at: cred.updated_at,
      },
    });
  } catch (error: any) {
    console.error("[CJ Credentials GET] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}

// ── POST — save new credentials ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { api_key } = body;

    if (!api_key) {
      return NextResponse.json(
        { error: "api_key is required" },
        { status: 400 }
      );
    }

    await (CJCredentials as any).updateMany(
      { is_active: true },
      { $set: { is_active: false, updated_at: new Date() } }
    );

    const newCred = new CJCredentials({
      api_key,
      is_active: true,
      created_by: adminUser._id,
    });

    await newCred.save();

    // Invalidate token cache so next request fetches fresh token with new key
    invalidateCJTokenCache();

    console.log(`[CJ Credentials] New credentials saved by ${adminUser.email}`);

    return NextResponse.json({
      success: true,
      message: "CJ credentials saved successfully",
    });
  } catch (error: any) {
    console.error("[CJ Credentials POST] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save credentials" },
      { status: 500 }
    );
  }
}

// ── DELETE — deactivate credentials ──────────────────────────────────────────
export async function DELETE(request: NextRequest) {
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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await (CJCredentials as any).updateMany(
      { is_active: true },
      { $set: { is_active: false, updated_at: new Date() } }
    );

    invalidateCJTokenCache();

    return NextResponse.json({
      success: true,
      message: "CJ credentials deactivated",
    });
  } catch (error: any) {
    console.error("[CJ Credentials DELETE] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deactivate credentials" },
      { status: 500 }
    );
  }
}