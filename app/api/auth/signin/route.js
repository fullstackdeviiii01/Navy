import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "../../../../lib/db.js"
import mongoose from "mongoose"
import { generateToken, getClientIp } from "../../../../lib/auth.js"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const User = mongoose.models.User || mongoose.model("User")

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check if user has a password (might be a migrated account without password)
    if (!user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check ban status
    if (user.is_banned) {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      )
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Update login history
    const loginIp = getClientIp(request)
    user.last_login_at = new Date()
    user.last_login_ip = loginIp
    user.login_history.push({
      at: new Date(),
      ip: loginIp,
      method: "password",
    })
    await user.save()

    // Generate JWT
    const token = generateToken(user)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json(
      { error: "Failed to sign in" },
      { status: 500 }
    )
  }
}
