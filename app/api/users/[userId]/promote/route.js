// app/api/users/[userId]/promote/route.js
import { NextResponse } from "next/server"
import { getIdTokenFromHeader, verifyIdToken } from "../../../../../lib/firebase/auth"
import connectDB from "../../../../../lib/db"
import User from "../../../../models/User"

export async function POST(request, { params }) {
  try {
    const { userId } = await params

    const token = getIdTokenFromHeader(request)

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decodedToken = await verifyIdToken(token)

    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Check if user is admin
    const adminUser = await User.findOne({ uid: decodedToken.uid })
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Find and promote user
    const userToPromote = await User.findById(userId)
    if (!userToPromote) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (userToPromote.role === "admin") {
      return NextResponse.json({ error: "User is already an admin" }, { status: 400 })
    }

    userToPromote.role = "admin"
    await userToPromote.save()

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully",
    })
  } catch (error) {
    console.error("User promotion failed:", error)
    return NextResponse.json({ error: "Failed to promote user" }, { status: 500 })
  }
}
