"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { ID, Query, Permission, Role } from "node-appwrite";
import { generateMVPPlan } from "@/lib/ai/pipelines/mvp-generator";
import { getEvaluation } from "./ideas";
import type { StoredMVPPlan } from "@/lib/ai/types";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get("forge-session");
  if (!session?.value) throw new Error("Not authenticated");
  const client = createSessionClient(session.value);
  const user = await client.account.get();
  return { ...client, user };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainMVPPlan(doc: any): StoredMVPPlan {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    ideaVersionId: doc.ideaVersionId,
    coreHypothesis: doc.coreHypothesis,
    killCondition: doc.killCondition,
    leanExperiment:
      typeof doc.leanExperiment === "string"
        ? JSON.parse(doc.leanExperiment)
        : doc.leanExperiment,
    featurePrioritization:
      typeof doc.featurePrioritization === "string"
        ? JSON.parse(doc.featurePrioritization)
        : doc.featurePrioritization,
    whatToIgnore:
      typeof doc.whatToIgnore === "string"
        ? JSON.parse(doc.whatToIgnore)
        : doc.whatToIgnore,
    buildOrder:
      typeof doc.buildOrder === "string"
        ? JSON.parse(doc.buildOrder)
        : doc.buildOrder,
    estimatedTimeline: doc.estimatedTimeline,
  };
}

// ──────────────────────────────────────────────
// Generate MVP Plan — runs AI pipeline + persists result
// ──────────────────────────────────────────────
export async function createMVPPlan(
  ideaVersionId: string,
  ideaText: string,
  targetUser: string,
  problem: string
): Promise<StoredMVPPlan> {
  const { databases, user } = await getAuthenticatedClient();

  // 1. Fetch the evaluation for this version (required input for MVP generator)
  const evaluation = await getEvaluation(ideaVersionId);
  if (!evaluation) {
    throw new Error(
      "No evaluation found for this version. Run evaluation first."
    );
  }

  // 2. Run the MVP generator pipeline
  const mvpPlan = await generateMVPPlan({
    ideaText,
    targetUser,
    problem,
    evaluation,
  });

  // 3. Persist to Appwrite
  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.MVP_PLANS,
    ID.unique(),
    {
      ideaVersionId,
      coreHypothesis: mvpPlan.core_hypothesis,
      killCondition: mvpPlan.kill_condition,
      leanExperiment: JSON.stringify(mvpPlan.lean_experiment),
      featurePrioritization: JSON.stringify(mvpPlan.feature_prioritization),
      whatToIgnore: JSON.stringify(mvpPlan.what_to_ignore),
      buildOrder: JSON.stringify(mvpPlan.build_order),
      estimatedTimeline: mvpPlan.estimated_timeline,
      rawAiResponse: JSON.stringify(mvpPlan),
    },
    [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ]
  );

  return toPlainMVPPlan(doc);
}

// ──────────────────────────────────────────────
// Get existing MVP plan for a version
// ──────────────────────────────────────────────
export async function getMVPPlan(
  ideaVersionId: string
): Promise<StoredMVPPlan | null> {
  try {
    const { databases } = await getAuthenticatedClient();
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MVP_PLANS,
      [
        Query.equal("ideaVersionId", ideaVersionId),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    );
    if (result.documents.length === 0) return null;
    return toPlainMVPPlan(result.documents[0]);
  } catch {
    return null;
  }
}
