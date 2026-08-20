import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "../../../../lib/db.js"
import mongoose from "mongoose"
import { generateToken, getClientIp } from "../../../../lib/auth.js"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const User = mongoose.models.User || mongoose.model("User")

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      signup_method: "email",
      email_verified: false,
      signup_ip: getClientIp(request),
    })

    await user.save()

    // Generate JWT
    const token = generateToken(user)

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
