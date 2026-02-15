"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { ID, Query, Permission, Role } from "node-appwrite";
import type {
  IdeaIntake,
  IdeaDocument,
  IdeaVersion,
  StoredEvaluation,
  StoredMVPPlan,
  StoredFeatureSimulation,
  IdeaWithVersions,
} from "@/lib/ai/types";
import type { CompleteEvaluation } from "@/lib/ai/types";

// ──────────────────────────────────────────────
// Helpers — strip Appwrite class instances to plain serializable objects
// ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainIdeaDoc(doc: any): IdeaDocument {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    userId: doc.userId,
    title: doc.title ?? doc.idea?.substring(0, 60) ?? "Untitled",
    idea: doc.idea,
    targetUser: doc.targetUser,
    problem: doc.problem,
    alternatives: doc.alternatives,
    timing: doc.timing,
    founderFit: doc.founderFit,
    stage: doc.stage,
    currentVersionId: doc.currentVersionId ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainVersion(doc: any): IdeaVersion {
  let featureList: string[] = [];
  try {
    featureList = doc.featureList ? JSON.parse(doc.featureList) : [];
  } catch {
    featureList = [];
  }
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    ideaId: doc.ideaId,
    versionNumber: doc.versionNumber,
    baseIdeaText: doc.baseIdeaText,
    featureList,
    parentVersionId: doc.parentVersionId ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainEvaluation(doc: any): StoredEvaluation {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    ideaVersionId: doc.ideaVersionId,
    totalScore: doc.totalScore,
    verdict: doc.verdict,
    confidence: doc.confidence,
    scoreBreakdown: typeof doc.scoreBreakdown === "string" ? JSON.parse(doc.scoreBreakdown) : doc.scoreBreakdown,
    riskProfile: typeof doc.riskProfile === "string" ? JSON.parse(doc.riskProfile) : doc.riskProfile,
    competitiveLandscape: typeof doc.competitiveLandscape === "string" ? JSON.parse(doc.competitiveLandscape) : doc.competitiveLandscape,
    strategicAnalysis: typeof doc.strategicAnalysis === "string" ? JSON.parse(doc.strategicAnalysis) : doc.strategicAnalysis,
    executiveSummary: doc.executiveSummary,
    recommendedNextSteps: typeof doc.recommendedNextSteps === "string" ? JSON.parse(doc.recommendedNextSteps) : doc.recommendedNextSteps,
    rawAiResponse: doc.rawAiResponse ? (typeof doc.rawAiResponse === "string" ? JSON.parse(doc.rawAiResponse) : doc.rawAiResponse) : null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainMVPPlan(doc: any): StoredMVPPlan {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    ideaVersionId: doc.ideaVersionId,
    coreHypothesis: doc.coreHypothesis,
    killCondition: doc.killCondition,
    leanExperiment: typeof doc.leanExperiment === "string" ? JSON.parse(doc.leanExperiment) : doc.leanExperiment,
    featurePrioritization: typeof doc.featurePrioritization === "string" ? JSON.parse(doc.featurePrioritization) : doc.featurePrioritization,
    whatToIgnore: typeof doc.whatToIgnore === "string" ? JSON.parse(doc.whatToIgnore) : doc.whatToIgnore,
    buildOrder: typeof doc.buildOrder === "string" ? JSON.parse(doc.buildOrder) : doc.buildOrder,
    estimatedTimeline: doc.estimatedTimeline,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainFeatureSimulation(doc: any): StoredFeatureSimulation {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    ideaVersionId: doc.ideaVersionId,
    proposedFeature: doc.proposedFeature,
    featureSummary: doc.featureSummary,
    scoreDeltas: typeof doc.scoreDeltas === "string" ? JSON.parse(doc.scoreDeltas) : doc.scoreDeltas,
    riskShifts: typeof doc.riskShifts === "string" ? JSON.parse(doc.riskShifts) : doc.riskShifts,
    netScoreChange: doc.netScoreChange,
    projectedTotalScore: doc.projectedTotalScore,
    strategicImpact: doc.strategicImpact,
    recommendation: doc.recommendation,
    recommendationRationale: doc.recommendationRationale,
  };
}

// ──────────────────────────────────────────────
// Auth helper
// ──────────────────────────────────────────────
async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get("forge-session");
  if (!session?.value) throw new Error("Not authenticated");
  const client = createSessionClient(session.value);
  const user = await client.account.get();
  return { ...client, user };
}

// ──────────────────────────────────────────────
// Submit Idea — creates idea + V1 version
// Called when user finishes onboarding.
// ──────────────────────────────────────────────
export async function submitIdea(input: IdeaIntake & { title?: string }): Promise<IdeaDocument> {
  const { databases, user } = await getAuthenticatedClient();

  // 1. Create the idea document
  const title = input.title || input.idea.substring(0, 60);
  const ideaDoc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.IDEAS,
    ID.unique(),
    {
      userId: user.$id,
      title,
      idea: input.idea,
      targetUser: input.targetUser,
      problem: input.problem,
      alternatives: input.alternatives,
      timing: input.timing,
      founderFit: input.founderFit || "",
      stage: input.stage,
    },
    [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ]
  );

  // 2. Create V1 version
  const versionDoc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.IDEA_VERSIONS,
    ID.unique(),
    {
      ideaId: ideaDoc.$id,
      versionNumber: 1,
      baseIdeaText: input.idea,
      featureList: JSON.stringify([]),
      parentVersionId: null,
    },
    [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ]
  );

  // 3. Link version back to idea
  await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.IDEAS,
    ideaDoc.$id,
    { currentVersionId: versionDoc.$id }
  );

  return toPlainIdeaDoc({ ...ideaDoc, currentVersionId: versionDoc.$id });
}

// ──────────────────────────────────────────────
// Get all ideas for current user (dashboard listing)
// ──────────────────────────────────────────────
export async function getUserIdeas(): Promise<IdeaDocument[]> {
  const { databases, user } = await getAuthenticatedClient();

  const result = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.IDEAS,
    [
      Query.equal("userId", user.$id),
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ]
  );

  return result.documents.map(toPlainIdeaDoc);
}

// ──────────────────────────────────────────────
// Get single idea (backwards compat — returns latest)
// ──────────────────────────────────────────────
export async function getUserIdea(): Promise<IdeaDocument | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("forge-session");
  if (!session?.value) return null;

  try {
    const { databases, user } = await getAuthenticatedClient();
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

// ──────────────────────────────────────────────
// Get idea by ID with all versions and current evaluation
// ──────────────────────────────────────────────
export async function getIdeaWithVersions(ideaId: string): Promise<IdeaWithVersions | null> {
  try {
    const { databases } = await getAuthenticatedClient();

    // Fetch idea
    const ideaDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.IDEAS, ideaId);
    const idea = toPlainIdeaDoc(ideaDoc);

    // Fetch all versions
    const versionsResult = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.IDEA_VERSIONS,
      [
        Query.equal("ideaId", ideaId),
        Query.orderAsc("versionNumber"),
        Query.limit(100),
      ]
    );
    const versions = versionsResult.documents.map(toPlainVersion);

    // Find current version
    const currentVersion = idea.currentVersionId
      ? versions.find((v) => v.$id === idea.currentVersionId) ?? versions[versions.length - 1] ?? null
      : versions[versions.length - 1] ?? null;

    // Fetch evaluation for current version
    let currentEvaluation: StoredEvaluation | null = null;
    let currentMVPPlan: StoredMVPPlan | null = null;
    let featureSimulations: StoredFeatureSimulation[] = [];
    if (currentVersion) {
      const [evalResult, mvpResult, simResult] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.EVALUATIONS,
          [
            Query.equal("ideaVersionId", currentVersion.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]
        ),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.MVP_PLANS,
          [
            Query.equal("ideaVersionId", currentVersion.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]
        ),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FEATURE_SIMULATIONS,
          [
            Query.equal("ideaVersionId", currentVersion.$id),
            Query.orderDesc("$createdAt"),
            Query.limit(50),
          ]
        ),
      ]);
      if (evalResult.documents.length > 0) {
        currentEvaluation = toPlainEvaluation(evalResult.documents[0]);
      }
      if (mvpResult.documents.length > 0) {
        currentMVPPlan = toPlainMVPPlan(mvpResult.documents[0]);
      }
      featureSimulations = simResult.documents.map(toPlainFeatureSimulation);
    }

    return {
      ...idea,
      versions,
      currentVersion,
      currentEvaluation,
      currentMVPPlan,
      featureSimulations,
    };
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Save evaluation result to Appwrite
// ──────────────────────────────────────────────
export async function saveEvaluation(
  ideaVersionId: string,
  evaluation: CompleteEvaluation
): Promise<StoredEvaluation> {
  const { databases, user } = await getAuthenticatedClient();

  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.EVALUATIONS,
    ID.unique(),
    {
      ideaVersionId,
      totalScore: evaluation.overall_assessment.total_score,
      verdict: evaluation.overall_assessment.verdict,
      confidence: evaluation.overall_assessment.confidence_level,
      scoreBreakdown: JSON.stringify(evaluation.score_breakdown),
      riskProfile: JSON.stringify(evaluation.risk_profile),
      competitiveLandscape: JSON.stringify(evaluation.competitive_landscape),
      strategicAnalysis: JSON.stringify(evaluation.strategic_analysis),
      executiveSummary: evaluation.overall_assessment.summary,
      recommendedNextSteps: JSON.stringify(evaluation.recommended_next_steps),
      rawAiResponse: JSON.stringify(evaluation),
    },
    [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ]
  );

  return toPlainEvaluation(doc);
}

// ──────────────────────────────────────────────
// Get evaluation for a specific version (check if already evaluated)
// ──────────────────────────────────────────────
export async function getEvaluation(ideaVersionId: string): Promise<StoredEvaluation | null> {
  try {
    const { databases } = await getAuthenticatedClient();
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.EVALUATIONS,
      [
        Query.equal("ideaVersionId", ideaVersionId),
        Query.orderDesc("$createdAt"),
        Query.limit(1),
      ]
    );
    if (result.documents.length === 0) return null;
    return toPlainEvaluation(result.documents[0]);
  } catch {
    return null;
  }
}
