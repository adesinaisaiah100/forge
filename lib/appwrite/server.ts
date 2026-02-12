import { Client, Account, Databases, Storage, Users, Teams } from "node-appwrite";

/**
 * Appwrite Server SDK — runs ONLY on the server (API routes, server actions, middleware).
 *
 * Two client types:
 * 1. Admin Client — uses API key, bypasses all permissions. For user management & admin ops.
 * 2. Session Client — uses a session secret (from cookie), acts on behalf of a specific user.
 */

// ──────────────────────────────────────────────
// Admin Client — bypasses permissions
// Use for: creating sessions, managing users, server-side data ops
// ──────────────────────────────────────────────
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get users() {
      return new Users(client);
    },
    get teams() {
      return new Teams(client);
    },
  };
}

// ──────────────────────────────────────────────
// Session Client — acts on behalf of a logged-in user
// Use for: reading user data, user-scoped operations
// ──────────────────────────────────────────────
export function createSessionClient(session: string) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setSession(session);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get teams() {
      return new Teams(client);
    },
  };
}
