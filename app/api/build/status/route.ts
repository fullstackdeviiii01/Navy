import { NextResponse } from "next/server";
import { readFileSync } from "fs";

const STATUS_FILE = "/tmp/ecomm-build-status.json";

export async function GET() {
  console.log("[Build Status] GET request received.");

  try {
    const raw = readFileSync(STATUS_FILE, "utf-8");
    console.log("[Build Status] Raw file content:", raw);

    const parsed = JSON.parse(raw);
    console.log("[Build Status] Parsed status:", parsed);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.warn("[Build Status] Could not read status file (may not exist yet):", err.message);
    return NextResponse.json({ status: "idle" });
  }
}