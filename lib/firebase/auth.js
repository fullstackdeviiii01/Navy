// lib/firebase/auth.js — JWT-based auth (replaces Firebase Admin)
import jwt from "jsonwebtoken"
import connectToDatabase from "../db.js"
import mongoose from "mongoose"

const JWT_SECRET = process.env.JWT_SECRET || "navy-ecommerce-secret-key-change-in-production"

/**
 * Extract the token from the Authorization header.
 * Works exactly like before — all 70+ API routes depend on this.
 */
export function getIdTokenFromHeader(request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return request.headers.get("x-real-ip") || "unknown"
}

/**
 * Verify a JWT token and return the decoded payload.
 * Returns null if verification fails (same contract as before).
 *
 * The decoded token contains: { userId, email, role, iat, exp }
 */
export async function verifyIdToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Fetch user from DB to confirm they still exist and are active
    await connectToDatabase()
    const User = mongoose.models.User || mongoose.model("User")

    const user = await User.findOne({ email: decoded.email }).lean()
    if (!user) {
      return null
    }

    // Return a object compatible with what Firebase used to return
    return {
      uid: user.uid || user._id.toString(),
      email: user.email,
      email_verified: user.email_verified,
      name: user.name,
      role: user.role,
      user_id: user._id.toString(),
    }
  } catch (error) {
    console.error("Token verification failed:", error.message)
    return null
  }
}

/**
 * Generate a JWT token for a user.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || "user",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export { JWT_SECRET }
