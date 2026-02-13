/**
 * Appwrite Database & Collection IDs
 *
 * Central source of truth for all Appwrite resource IDs.
 * These must match what you create in the Appwrite Console.
 *
 * To set up:
 * 1. Go to Appwrite Console → Databases → Create Database → use ID "forge-db"
 * 2. Inside that database, create collection with ID "ideas"
 * 3. Add the attributes listed in the ideas server action
 */

export const DATABASE_ID = "forge-db";

export const COLLECTIONS = {
  IDEAS: "ideas",
} as const;
