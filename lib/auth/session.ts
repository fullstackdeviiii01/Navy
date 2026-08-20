// lib/auth/session.ts - NEW FILE
import { v4 as uuidv4 } from "uuid";
import { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "guest_session_id";
const SESSION_EXPIRY_DAYS = 90;

export function generateSessionId(): string {
  return uuidv4();
}

export function getSessionIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
}

export function createSessionCookie(sessionId: string): string {
  const maxAge = SESSION_EXPIRY_DAYS * 24 * 60 * 60; // 90 days in seconds
  return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
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