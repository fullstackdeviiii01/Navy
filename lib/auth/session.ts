// lib/auth/session.ts
import { v4 as uuidv4 } from "uuid";
import { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "guest_session_id";
const SESSION_EXPIRY_DAYS = 90;

export function generateSessionId(): string {
  return uuidv4();
}

export function getSessionIdFromRequest(request: NextRequest): string | null {
  const cookieVal = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookieVal) return cookieVal;

  const headerVal = request.headers.get("x-session-id");
  if (headerVal) return headerVal;

  return null;
}

export function createSessionCookie(sessionId: string): string {
  const maxAge = SESSION_EXPIRY_DAYS * 24 * 60 * 60; // 90 days in seconds
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";
  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlag = isProduction ? "Secure; " : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0`;
}

export function getOrCreateSessionId(request: NextRequest): {
  sessionId: string;
  isNew: boolean;
} {
  const existingSessionId = getSessionIdFromRequest(request);

  if (existingSessionId) {
    return { sessionId: existingSessionId, isNew: false };
  }

  return { sessionId: generateSessionId(), isNew: true };
}