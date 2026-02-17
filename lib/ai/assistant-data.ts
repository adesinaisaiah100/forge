import { Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/config";
import type {
  IdeaDocument,
  IdeaVersion,
  StoredEvaluation,
  StoredMVPPlan,
} from "@/lib/ai/types";

export interface AssistantIdeaState {
  idea: IdeaDocument;
  currentVersion: IdeaVersion | null;
  evaluation: StoredEvaluation | null;
  mvpPlan: StoredMVPPlan | null;
}

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
    diffSummary: doc.diffSummary ?? null,
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
    scoreBreakdown:
      typeof doc.scoreBreakdown === "string"
        ? JSON.parse(doc.scoreBreakdown)
        : doc.scoreBreakdown,
    riskProfile:
      typeof doc.riskProfile === "string"
        ? JSON.parse(doc.riskProfile)
        : doc.riskProfile,
    competitiveLandscape:
      typeof doc.competitiveLandscape === "string"
        ? JSON.parse(doc.competitiveLandscape)
        : doc.competitiveLandscape,
    strategicAnalysis:
      typeof doc.strategicAnalysis === "string"
        ? JSON.parse(doc.strategicAnalysis)
        : doc.strategicAnalysis,
    competitorProfiles: doc.competitorProfiles
      ? typeof doc.competitorProfiles === "string"
        ? JSON.parse(doc.competitorProfiles)
        : doc.competitorProfiles
      : undefined,
    executiveSummary: doc.executiveSummary,
    recommendedNextSteps:
      typeof doc.recommendedNextSteps === "string"
        ? JSON.parse(doc.recommendedNextSteps)
        : doc.recommendedNextSteps,
    rawAiResponse: doc.rawAiResponse
      ? typeof doc.rawAiResponse === "string"
        ? JSON.parse(doc.rawAiResponse)
        : doc.rawAiResponse
      : null,
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
    featureStatuses: doc.featureStatuses
      ? typeof doc.featureStatuses === "string"
        ? JSON.parse(doc.featureStatuses)
        : doc.featureStatuses
      : {},
  };
}

export async function getAssistantIdeaState(
  session: string,
  ideaId: string
): Promise<AssistantIdeaState> {
  const client = createSessionClient(session);
  const ideaDoc = await client.databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.IDEAS,
    ideaId
  );
  const idea = toPlainIdeaDoc(ideaDoc);

  const versionsResult = await client.databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.IDEA_VERSIONS,
    [
      Query.equal("ideaId", ideaId),
      Query.orderAsc("versionNumber"),
      Query.limit(100),
    ]
  );

  const versions = versionsResult.documents.map(toPlainVersion);
  const currentVersion = idea.currentVersionId
    ? versions.find((version) => version.$id === idea.currentVersionId) ??
      versions[versions.length - 1] ??
      null
    : versions[versions.length - 1] ?? null;

  if (!currentVersion) {
    return {
      idea,
      currentVersion: null,
      evaluation: null,
      mvpPlan: null,
    };
  }

  const [evaluationResult, mvpResult] = await Promise.all([
    client.databases.listDocuments(DATABASE_ID, COLLECTIONS.EVALUATIONS, [
      Query.equal("ideaVersionId", currentVersion.$id),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]),
    client.databases.listDocuments(DATABASE_ID, COLLECTIONS.MVP_PLANS, [
      Query.equal("ideaVersionId", currentVersion.$id),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]),
  ]);

  const evaluation =
    evaluationResult.documents.length > 0
      ? toPlainEvaluation(evaluationResult.documents[0])
      : null;
  const mvpPlan =
    mvpResult.documents.length > 0 ? toPlainMVPPlan(mvpResult.documents[0]) : null;

  return {
    idea,
    currentVersion,
    evaluation,
    mvpPlan,
  };
}
