// lib/auth.js — JWT-based authentication
import jwt from "jsonwebtoken"
import connectToDatabase from "./db.js"
import mongoose from "mongoose"
import User from "../app/models/User.js"

const JWT_SECRET = process.env.JWT_SECRET || "navy-ecommerce-secret-key-change-in-production"

/**
 * Extract the token from the Authorization header or session cookie.
 */
export function getIdTokenFromHeader(request) {
  const authHeader = request.headers?.get?.("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  if (request.cookies && typeof request.cookies.get === "function") {
    const sessionCookie = request.cookies.get("__session");
    if (sessionCookie?.value) return sessionCookie.value;
  }
  return null;
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
 * Verify a JWT token and return user info from DB.
 */
export async function verifyIdToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    await connectToDatabase()

    const user = await User.findOne({ email: decoded.email }).lean()
    if (!user) {
      return null
    }

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
