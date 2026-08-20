import { NextResponse } from "next/server"
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth.js"

export async function GET(request) {
  try {
    const token = getIdTokenFromHeader(request)

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const decoded = await verifyIdToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      email_verified: decoded.email_verified,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    )
  }
}
