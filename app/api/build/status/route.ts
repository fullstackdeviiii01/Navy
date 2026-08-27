import { NextResponse } from "next/server";
import { readFileSync } from "fs";

const STATUS_FILE = "/tmp/ecomm-build-status.json";

export async function GET() {

  try {
    const raw = readFileSync(STATUS_FILE, "utf-8");

    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.warn("[Build Status] Could not read status file (may not exist yet):", err.message);
    return NextResponse.json({ status: "idle" });
  }
}