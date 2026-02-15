import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware — Route Protection
 *
 * Runs BEFORE any page renders. Checks for the session cookie:
 * - Home route (/) → redirect to /dashboard if already logged in
 * - Protected routes (/dashboard/*, /onboarding) → redirect to /login if no session
 * - Auth routes (/login) → redirect to /dashboard if already logged in
 *
 * Note: This only checks if the cookie EXISTS, not if it's valid.
 * The actual session validation happens in getUser() when the page loads.
 * This is intentional — middleware should be fast, not make API calls.
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get("forge-session");
  const { pathname } = request.nextUrl;

  const isHomeRoute = pathname === "/";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAuthRoute = pathname === "/login";

  // Has session + visiting landing page → skip straight to dashboard
  if (isHomeRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // No session + trying to access protected route → go to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the intended destination so we can redirect after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has session + trying to access login → go to dashboard
  // (The OAuth callback already handles onboarding vs dashboard routing,
  //  so returning users who visit /login directly go to dashboard)
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/onboarding/:path*", "/login"],
};
