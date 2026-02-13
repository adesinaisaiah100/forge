"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface IdeaInput {
  idea: string;
  targetUser: string;
  problem: string;
  alternatives: string;
  timing: string;
  founderFit: string;
  stage: string;
}

export interface IdeaDocument extends IdeaInput {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
}

// ──────────────────────────────────────────────
// Submit Idea — saves the onboarding form to Appwrite DB
// Called when user clicks "Finish" on the onboarding form.
// ──────────────────────────────────────────────
export async function submitIdea(input: IdeaInput): Promise<IdeaDocument> {
  const cookieStore = await cookies();
  const session = cookieStore.get("forge-session");

  if (!session?.value) {
    throw new Error("Not authenticated");
  }

  const { account, databases } = createSessionClient(session.value);
  const user = await account.get();

  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.IDEAS,
    ID.unique(),
    {
      userId: user.$id,
      idea: input.idea,
      targetUser: input.targetUser,
      problem: input.problem,
      alternatives: input.alternatives,
      timing: input.timing,
      founderFit: input.founderFit || "",
      stage: input.stage,
    }
  );

  return doc as unknown as IdeaDocument;
}

// ──────────────────────────────────────────────
// Get Idea — fetches the user's latest idea from DB
// Used on dashboard/AI pages to restore context after refresh.
// ──────────────────────────────────────────────
export async function getUserIdea(): Promise<IdeaDocument | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("forge-session");

  if (!session?.value) {
    return null;
  }

  try {
    const { account, databases } = createSessionClient(session.value);
    const user = await account.get();

    const { Query } = await import("node-appwrite");

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.IDEAS,
      [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    );

    if (result.documents.length === 0) return null;

    return result.documents[0] as unknown as IdeaDocument;
  } catch {
    return null;
  }
}
