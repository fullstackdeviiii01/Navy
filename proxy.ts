import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add pathname to headers for server-side access
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Only protect /account routes
  if (pathname.startsWith("/account")) {
    try {
      // Check for Firebase auth token in cookies
      const sessionCookie = request.cookies.get("__session");

      // If no session cookie, redirect to sign-in
      if (!sessionCookie) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      // For additional security, we could verify the session here
      // but for simplicity, we'll rely on client-side auth state
      // and API route protection
    } catch (error) {
      console.error("Middleware auth check failed:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};