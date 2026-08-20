// app/api/users/activities/route.ts
import { NextResponse } from "next/server"
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth"
import connectDB from "../../../../lib/db"
import User from "../../../models/User"

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

    const url = new URL(request.url)
    const days = Number.parseInt(url.searchParams.get("days") || "7")
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    // Get recent login activities from user login_history
    const usersWithRecentLogins = await User.find(
      {
        "login_history.at": { $gte: dateThreshold },
      },
      {
        email: 1,
        name: 1,
        login_history: 1,
      },
    )

    const loginActivities = []
    usersWithRecentLogins.forEach((user) => {
      const recentLogins = user.login_history.filter((login) => new Date(login.at) >= dateThreshold)
      recentLogins.forEach((login) => {
        loginActivities.push({
          _id: user._id,
          email: user.email,
          name: user.name,
          login_at: login.at,
          ip: login.ip,
          method: login.method,
        })
      })
    })

    // Sort by most recent first
    loginActivities.sort((a, b) => new Date(b.login_at).getTime() - new Date(a.login_at).getTime())

    // Mock user activities (in a real app, you'd have an activities collection)
    const userActivities = [
      {
        _id: "1",
        email: "user@example.com",
        name: "John Doe",
        activity_type: "signup",
        activity_date: new Date().toISOString(),
        details: "New user registration",
      },
      {
        _id: "2",
        email: "admin@example.com",
        name: "Admin User",
        activity_type: "order",
        activity_date: new Date(Date.now() - 3600000).toISOString(),
        details: "Completed order #1234",
      },
    ]

    return NextResponse.json({
      loginActivities: loginActivities.slice(0, 100), // Limit to 100 recent activities
      userActivities,
    })
  } catch (error) {
    console.error("Activities fetch failed:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
