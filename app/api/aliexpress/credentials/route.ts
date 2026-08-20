// app/api/aliexpress-credentials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import AliexpressCredentials from "../../../models/AliexpressCredentials";
import User from "../../../models/User";
import { encrypt, decrypt } from "../../../../lib/crypto/credentials";

// GET — return current credentials (app_key visible, secrets masked)
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

    const cred = await (AliexpressCredentials as any)
      .findOne({ is_active: true })
      .sort({ created_at: -1 });

    if (!cred) {
      return NextResponse.json({ configured: false, credentials: null });
    }

    // Return masked values — never expose raw secrets
    return NextResponse.json({
      configured: true,
      credentials: {
        _id: cred._id,
        app_key: cred.app_key,
        app_secret: "••••••••",
        access_token: "••••••••",
        refresh_token: "••••••••",
        token_expiry: cred.token_expiry,
        is_active: cred.is_active,
        updated_at: cred.updated_at,
      },
    });
  } catch (error: any) {
    console.error("[AliExpress Credentials GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}

// POST — create or replace credentials
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
    const { app_key, app_secret, access_token, refresh_token, token_expiry } =
      body;

    if (!app_key || !app_secret || !access_token || !refresh_token) {
      return NextResponse.json(
        {
          error:
            "app_key, app_secret, access_token, and refresh_token are all required",
        },
        { status: 400 }
      );
    }

    // Deactivate all existing credentials
    await (AliexpressCredentials as any).updateMany(
      {},
      { is_active: false, updated_by: adminUser._id }
    );

    // Create new encrypted record
    const cred = new AliexpressCredentials({
      app_key: app_key.trim(),
      app_secret: encrypt(app_secret.trim()),
      access_token: encrypt(access_token.trim()),
      refresh_token: encrypt(refresh_token.trim()),
      token_expiry: token_expiry ? new Date(token_expiry) : undefined,
      is_active: true,
      created_by: adminUser._id,
    });

    await cred.save();

    return NextResponse.json({
      success: true,
      message: "AliExpress credentials saved successfully",
    });
  } catch (error: any) {
    console.error("[AliExpress Credentials POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to save credentials" },
      { status: 500 }
    );
  }
}

// DELETE — deactivate credentials
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

    await (AliexpressCredentials as any).updateMany(
      { is_active: true },
      { is_active: false, updated_by: adminUser._id }
    );

    return NextResponse.json({
      success: true,
      message: "AliExpress credentials deactivated",
    });
  } catch (error: any) {
    console.error("[AliExpress Credentials DELETE]", error);
    return NextResponse.json(
      { error: error.message || "Failed to deactivate credentials" },
      { status: 500 }
    );
  }
}