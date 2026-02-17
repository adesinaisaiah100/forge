"use server";

import { cookies } from "next/headers";
import { Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/config";

function createShareId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}

async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get("forge-session");
  if (!session?.value) throw new Error("Not authenticated");
  const client = createSessionClient(session.value);
  const user = await client.account.get();
  return { ...client, user };
}

export async function generateShareLink(ideaVersionId: string) {
  const { databases } = await getAuthenticatedClient();

  const evaluationResult = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.EVALUATIONS,
    [
      Query.equal("ideaVersionId", ideaVersionId),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]
  );

  if (evaluationResult.documents.length === 0) {
    throw new Error("No evaluation found for this version.");
  }

  const evaluation = evaluationResult.documents[0];
  const shareId = evaluation.shareId || createShareId();

  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.EVALUATIONS,
    evaluation.$id,
    {
      shareId,
      isPublic: true,
    }
  );

  return {
    shareId,
    isPublic: true,
    url: `/report/${shareId}`,
  };
}

export async function toggleShareLink(ideaVersionId: string, isPublic: boolean) {
  const { databases } = await getAuthenticatedClient();

  const evaluationResult = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.EVALUATIONS,
    [
      Query.equal("ideaVersionId", ideaVersionId),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]
  );

  if (evaluationResult.documents.length === 0) {
    throw new Error("No evaluation found for this version.");
  }

  const evaluation = evaluationResult.documents[0];

  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.EVALUATIONS,
    evaluation.$id,
    {
      isPublic,
    }
  );

  return {
    shareId: evaluation.shareId ?? null,
    isPublic,
    url: evaluation.shareId ? `/report/${evaluation.shareId}` : null,
  };
}

export async function getPublicReport(shareId: string) {
  const { databases } = createAdminClient();

  const evaluationResult = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.EVALUATIONS,
    [
      Query.equal("shareId", shareId),
      Query.equal("isPublic", true),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]
  );

  if (evaluationResult.documents.length === 0) {
    return null;
  }

  const evaluation = evaluationResult.documents[0];
  const versionResult = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.IDEA_VERSIONS,
    evaluation.ideaVersionId
  );
  const idea = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.IDEAS,
    versionResult.ideaId
  );

  const scoreBreakdown =
    typeof evaluation.scoreBreakdown === "string"
      ? JSON.parse(evaluation.scoreBreakdown)
      : evaluation.scoreBreakdown;

  const riskProfile =
    typeof evaluation.riskProfile === "string"
      ? JSON.parse(evaluation.riskProfile)
      : evaluation.riskProfile;

  const recommendedNextSteps =
    typeof evaluation.recommendedNextSteps === "string"
      ? JSON.parse(evaluation.recommendedNextSteps)
      : evaluation.recommendedNextSteps;

  return {
    shareId,
    title: idea.title,
    stage: idea.stage,
    totalScore: evaluation.totalScore,
    verdict: evaluation.verdict,
    executiveSummary: evaluation.executiveSummary,
    scoreBreakdown,
    riskProfile,
    recommendedNextSteps,
    createdAt: evaluation.$createdAt,
  };
}
