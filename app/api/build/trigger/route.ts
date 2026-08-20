import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFileSync } from "fs";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

const STATUS_FILE = "/tmp/ecomm-build-status.json";

function writeStatus(status: "building" | "done" | "failed") {
  try {
    writeFileSync(STATUS_FILE, JSON.stringify({ status, at: Date.now() }));
    console.log(`[Build Trigger] Status written: ${status}`);
  } catch (err: any) {
    console.error("[Build Trigger] Failed to write status file:", err.message);
  }
}

export async function POST(request: NextRequest) {
  console.log("[Build Trigger] POST request received.");

  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      console.warn("[Build Trigger] No token in request headers.");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    console.log("[Build Trigger] Verifying Firebase token...");
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      console.warn("[Build Trigger] Token verification failed.");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("[Build Trigger] Token verified. UID:", decodedToken.uid);

    await connectDB();
    console.log("[Build Trigger] DB connected. Looking up user...");

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });

    if (!adminUser) {
      console.warn("[Build Trigger] No user found for UID:", decodedToken.uid);
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    if (adminUser.role !== "admin") {
      console.warn("[Build Trigger] User is not admin. Role:", adminUser.role);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("[Build Trigger] Admin confirmed. Marking status as 'building'...");
    writeStatus("building");

    const SCRIPT = "/home/sysfoc/build-ecomm.sh";
    console.log("[Build Trigger] Executing script:", SCRIPT);

    // Fire and forget — do NOT await
    exec(SCRIPT, (error, stdout, stderr) => {
      if (error) {
        console.error("[Build Trigger] Script execution error:", error.message);
        console.error("[Build Trigger] stderr:", stderr);
        writeStatus("failed");
      } else {
        console.log("[Build Trigger] Script completed successfully.");
        console.log("[Build Trigger] stdout:", stdout);
        if (stderr) console.warn("[Build Trigger] stderr (non-fatal):", stderr);
        // Status is already written as 'done' by the shell script itself
      }
    });

    console.log("[Build Trigger] Script fired in background. Returning 200.");
    return NextResponse.json({ success: true, message: "Build started. Poll /api/build/status for updates." });

  } catch (error: any) {
    console.error("[Build Trigger] Unexpected error:", error.message, error.stack);
    writeStatus("failed");
    return NextResponse.json(
      { error: error.message || "Failed to trigger build" },
      { status: 500 }
    );
  }
}