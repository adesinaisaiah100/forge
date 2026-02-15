"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";

// ──────────────────────────────────────────────
// Cookie config
// ──────────────────────────────────────────────
const SESSION_COOKIE = "forge-session";
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days in seconds

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

async function resolveAppBaseUrl(): Promise<string> {
  const fallback = process.env.NEXT_PUBLIC_APP_URL;
  const headerStore = await headers();

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";

  if (host) {
    return normalizeBaseUrl(`${proto}://${host}`);
  }

  if (fallback) {
    return normalizeBaseUrl(fallback);
  }

  if (process.env.VERCEL_URL) {
    return normalizeBaseUrl(`https://${process.env.VERCEL_URL}`);
  }

  return "http://localhost:3000";
}

// ──────────────────────────────────────────────
// OAuth — Initiate login
// Called from the login page to redirect user to the OAuth provider
// ──────────────────────────────────────────────
export async function loginWithOAuth(provider: string) {
  const { account } = createAdminClient();
  const appBaseUrl = await resolveAppBaseUrl();

  // Map string to Appwrite OAuthProvider enum
  const providerMap: Record<string, OAuthProvider> = {
    google: OAuthProvider.Google,
    linkedin: OAuthProvider.Linkedin,
    github: OAuthProvider.Github,
    discord: OAuthProvider.Discord,
  };

  const oauthProvider = providerMap[provider];
  if (!oauthProvider) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  // Appwrite generates the OAuth URL — we redirect the user there
  const redirectUrl = await account.createOAuth2Token(
    oauthProvider,
    `${appBaseUrl}/api/oauth/callback`, // success URL
    `${appBaseUrl}/login?error=oauth_failed` // failure URL
  );

  redirect(redirectUrl);
}

// ──────────────────────────────────────────────
// Get current user — safe to call anywhere (returns null if not logged in)
// ──────────────────────────────────────────────
export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (!session?.value) return null;

  try {
    const { account } = createSessionClient(session.value);
    return await account.get();
  } catch {
    // Session expired or invalid — clean up the cookie
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }
}

// ──────────────────────────────────────────────
// Logout — destroys Appwrite session + clears cookie
// ──────────────────────────────────────────────
export async function logout() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);

  if (session?.value) {
    try {
      const { account } = createSessionClient(session.value);
      await account.deleteSession("current");
    } catch {
      // Session already expired — that's fine, just clear the cookie
    }
  }

  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}

// ──────────────────────────────────────────────
// Create session from OAuth callback
// Called by the /api/oauth/callback route after Appwrite returns userId + secret
// ──────────────────────────────────────────────
export async function createSessionFromOAuth(userId: string, secret: string) {
  const { account } = createAdminClient();

  // Exchange the OAuth token for a full session
  const session = await account.createSession(userId, secret);

  // Store session secret in an httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });

  return session;
}
