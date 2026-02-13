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
// Helper — strips Appwrite class instance down to a plain object.
// Server actions can only return plain serializable objects to
// client components; Appwrite SDK returns class instances.
// ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainIdeaDoc(doc: any): IdeaDocument {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    userId: doc.userId,
    idea: doc.idea,
    targetUser: doc.targetUser,
    problem: doc.problem,
    alternatives: doc.alternatives,
    timing: doc.timing,
    founderFit: doc.founderFit,
    stage: doc.stage,
  };
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

  return toPlainIdeaDoc(doc);
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

    return toPlainIdeaDoc(result.documents[0]);
  } catch {
    return null;
  }
}
