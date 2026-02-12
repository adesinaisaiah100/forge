import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth Callback Route
 *
 * After a user authenticates with Google/LinkedIn/GitHub/Discord,
 * Appwrite redirects them here with `userId` and `secret` as URL params.
 *
 * This route:
 * 1. Extracts userId from the URL
 * 2. Creates an Appwrite session via Appwrite REST (admin)
 * 3. Sets the session cookie directly on the redirect response
 * 4. Redirects to /dashboard
 */

const SESSION_COOKIE = "forge-session";
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }

  try {
    // Use Appwrite REST directly to avoid SDK/Turbopack instanceof bug
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const apiKey = process.env.APPWRITE_API_KEY!;

    const res = await fetch(
      `${endpoint}/users/${userId}/sessions`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-appwrite-project": project,
          "x-appwrite-key": apiKey,
        },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Appwrite session create failed: ${res.status} ${body}`);
    }

    const session = (await res.json()) as { secret: string };

    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

    response.cookies.set(SESSION_COOKIE, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    return response;
  } catch (error: unknown) {
    const err = error as { message?: string; code?: number; type?: string };
    console.error("OAuth callback error:", {
      message: err?.message,
      code: err?.code,
      type: err?.type,
    });
    return NextResponse.redirect(
      new URL(`/login?error=session_failed&detail=${encodeURIComponent(err?.message || "unknown")}`, request.url)
    );
  }
}
