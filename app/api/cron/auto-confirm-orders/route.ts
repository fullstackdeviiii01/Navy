import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Orders require explicit admin review & confirmation
  return NextResponse.json({
    success: true,
    message: "Auto-confirmation is disabled. Orders must be confirmed by admin after verifying payment/details.",
  });
}
