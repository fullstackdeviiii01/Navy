// app/api/users/route.ts
import { NextResponse } from "next/server"
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/firebase/auth"
import connectDB from "../../../lib/db"
import User from "../../models/User"

export async function GET(request) {
  try {
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

    // Get all users with selected fields
    const users = await User.find(
      {},
      {
        uid: 1,
        email: 1,
        name: 1,
        role: 1,
        is_active: 1,
        is_banned: 1,
        order_count: 1,
        total_spent: 1,
        customer_since: 1,
        last_login_at: 1,
        cart: 1,
        wishlist: 1,
        addresses: 1,
        login_history: 1,
      },
    ).sort({ created_at: -1 })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Users fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
