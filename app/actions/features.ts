"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { ID, Query, Permission, Role } from "node-appwrite";
import { simulateFeatureImpact } from "@/lib/ai/pipelines/feature-simulator";
import { getEvaluation } from "./ideas";
import type { StoredFeatureSimulation } from "@/lib/ai/types";

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
function toPlainSimulation(doc: any): StoredFeatureSimulation {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    ideaVersionId: doc.ideaVersionId,
    proposedFeature: doc.proposedFeature,
    featureSummary: doc.featureSummary,
    scoreDeltas:
      typeof doc.scoreDeltas === "string"
        ? JSON.parse(doc.scoreDeltas)
        : doc.scoreDeltas,
    riskShifts:
      typeof doc.riskShifts === "string"
        ? JSON.parse(doc.riskShifts)
        : doc.riskShifts,
    netScoreChange: doc.netScoreChange,
    projectedTotalScore: doc.projectedTotalScore,
    strategicImpact: doc.strategicImpact,
    recommendation: doc.recommendation,
    recommendationRationale: doc.recommendationRationale,
  };
}

// ──────────────────────────────────────────────
// Simulate Feature — runs AI pipeline + persists result
// ──────────────────────────────────────────────
export async function simulateFeature(
  ideaVersionId: string,
  ideaText: string,
  targetUser: string,
  problem: string,
  proposedFeature: string
): Promise<StoredFeatureSimulation> {
  const { databases, user } = await getAuthenticatedClient();

  // 1. Fetch current evaluation (required input)
  const evaluation = await getEvaluation(ideaVersionId);
  if (!evaluation) {
    throw new Error(
      "No evaluation found for this version. Run evaluation first."
    );
  }

  // 2. Run the feature simulation pipeline
  const simulation = await simulateFeatureImpact({
    ideaText,
    targetUser,
    problem,
    proposedFeature,
    evaluation,
  });

  // 3. Persist to Appwrite
  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.FEATURE_SIMULATIONS,
    ID.unique(),
    {
      ideaVersionId,
      proposedFeature,
      featureSummary: simulation.feature_summary,
      scoreDeltas: JSON.stringify(simulation.score_deltas),
      riskShifts: JSON.stringify(simulation.risk_shifts),
      netScoreChange: Math.round(simulation.net_score_change),
      projectedTotalScore: Math.round(simulation.projected_total_score),
      strategicImpact: simulation.strategic_impact,
      recommendation: simulation.recommendation,
      recommendationRationale: simulation.recommendation_rationale,
      rawAiResponse: JSON.stringify(simulation),
    },
    [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ]
  );

  return toPlainSimulation(doc);
}

// ──────────────────────────────────────────────
// Get all feature simulations for a version
// ──────────────────────────────────────────────
export async function getFeatureSimulations(
  ideaVersionId: string
): Promise<StoredFeatureSimulation[]> {
  try {
    const { databases } = await getAuthenticatedClient();
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FEATURE_SIMULATIONS,
      [
        Query.equal("ideaVersionId", ideaVersionId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ]
    );
    return result.documents.map(toPlainSimulation);
  } catch {
    return [];
  }
}
