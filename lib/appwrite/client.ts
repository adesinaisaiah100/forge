import { Client, Account, Databases, Storage, Avatars, Teams } from "appwrite";

/**
 * Appwrite Client SDK — runs in the BROWSER only.
 * Used in "use client" components for:
 * - OAuth redirects (account.createOAuth2Session)
 * - Realtime subscriptions
 * - Client-side file uploads
 *
 * For server-side operations, use lib/appwrite/server.ts instead.
 */

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const teams = new Teams(client);

export { client };
export { ID, Query, Permission, Role, OAuthProvider } from "appwrite";
