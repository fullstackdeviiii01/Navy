import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFileSync } from "fs";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";

const STATUS_FILE = "/tmp/ecomm-build-status.json";

function writeStatus(status: "building" | "done" | "failed") {
  try {
    writeFileSync(STATUS_FILE, JSON.stringify({ status, at: Date.now() }));
  } catch (err: any) {
    console.error("[Build Trigger] Failed to write status file:", err.message);
  }
}

export async function POST(request: NextRequest) {

  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      console.warn("[Build Trigger] No token in request headers.");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      console.warn("[Build Trigger] Token verification failed.");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }


    await connectDB();

    const adminUser = await (User as any).findOne({ email: decodedToken.email });

    if (!adminUser) {
      console.warn("[Build Trigger] No user found for UID:", decodedToken.uid);
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    if (adminUser.role !== "admin") {
      console.warn("[Build Trigger] User is not admin. Role:", adminUser.role);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    writeStatus("building");

    const SCRIPT = "/home/sysfoc/build-ecomm.sh";

    // Fire and forget — do NOT await
    exec(SCRIPT, (error, stdout, stderr) => {
      if (error) {
        console.error("[Build Trigger] Script execution error:", error.message);
        console.error("[Build Trigger] stderr:", stderr);
        writeStatus("failed");
      } else {
        if (stderr) console.warn("[Build Trigger] stderr (non-fatal):", stderr);
        // Status is already written as 'done' by the shell script itself
      }
    });

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