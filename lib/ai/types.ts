import { EvaluationResult, IdeaAnalysis, MarketAnalysis, TimingAnalysis } from "./schemas";

// ──────────────────────────────────────────────
// Core idea input — what the user fills in during onboarding
// ──────────────────────────────────────────────
export interface IdeaIntake {
  idea: string;
  targetUser: string;
  problem: string;
  alternatives: string;
  timing: string;
  founderFit: string;
  stage: string;
}

// ──────────────────────────────────────────────
// Persisted idea document (Appwrite `ideas` collection)
// ──────────────────────────────────────────────
export interface IdeaDocument extends IdeaIntake {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  title: string;
  currentVersionId?: string;
}

// ──────────────────────────────────────────────
// Persisted idea version (Appwrite `idea_versions` collection)
// ──────────────────────────────────────────────
export interface IdeaVersion {
  $id: string;
  $createdAt: string;
  ideaId: string;
  versionNumber: number;
  baseIdeaText: string;
  featureList: string[]; // Stored as JSON string in Appwrite, parsed on read
  parentVersionId: string | null;
}

// ──────────────────────────────────────────────
// Persisted evaluation (Appwrite `evaluations` collection)
// ──────────────────────────────────────────────
export interface StoredEvaluation {
  $id: string;
  $createdAt: string;
  ideaVersionId: string;
  totalScore: number;
  verdict: "GO" | "REFINE" | "KILL";
  confidence: number;
  scoreBreakdown: EvaluationResult["score_breakdown"];
  riskProfile: EvaluationResult["risk_profile"];
  competitiveLandscape: EvaluationResult["competitive_landscape"];
  strategicAnalysis: EvaluationResult["strategic_analysis"];
  competitorProfiles?: CompetitorProfile[];
  executiveSummary: string;
  recommendedNextSteps: string[];
  rawAiResponse?: CompleteEvaluation | null;
}

export interface CompetitorProfile {
  name: string;
  url: string | null;
  description: string;
  stage: "Startup" | "Growth" | "Enterprise" | "Dead";
  estimatedSize: string;
  fundingInfo: string | null;
  keyStrengths: string[];
  keyWeaknesses: string[];
  howYouDiffer: string;
  threatLevel: "low" | "medium" | "high";
}

// ──────────────────────────────────────────────
// Full evaluation result from the AI pipeline
// ──────────────────────────────────────────────
export interface CompleteEvaluation extends EvaluationResult {
  raw_reports: {
    idea: IdeaAnalysis;
    market: MarketAnalysis;
    timing: TimingAnalysis;
  };
}

// ──────────────────────────────────────────────
// Persisted MVP plan (Appwrite `mvp_plans` collection)
// ──────────────────────────────────────────────
export interface StoredMVPPlan {
  $id: string;
  $createdAt: string;
  ideaVersionId: string;
  coreHypothesis: string;
  killCondition: string;
  leanExperiment: {
    description: string;
    duration: string;
    success_metric: string;
    failure_metric: string;
  };
  featurePrioritization: {
    feature: string;
    priority: "Must Have" | "Should Have" | "Nice to Have" | "Ignore";
    rationale: string;
    effort_estimate: "Hours" | "Days" | "Weeks";
  }[];
  whatToIgnore: string[];
  buildOrder: {
    step: number;
    action: string;
    rationale: string;
  }[];
  estimatedTimeline: string;
  featureStatuses?: Record<string, "pending" | "completed">;
}

export interface ChatSession {
  $id: string;
  $createdAt: string;
  ideaId: string;
  ideaVersionId: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
}

export interface ChatMessage {
  $id: string;
  $createdAt: string;
  sessionId: string;
  ideaId: string;
  ideaVersionId: string;
  role: "user" | "assistant";
  content: string;
  toolCalls: string | null;
  toolResults: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Persisted feature simulation (Appwrite `feature_simulations` collection)
// ──────────────────────────────────────────────
export interface StoredFeatureSimulation {
  $id: string;
  $createdAt: string;
  ideaVersionId: string;
  proposedFeature: string;
  featureSummary: string;
  scoreDeltas: {
    problem_strength: { before: number; after: number; delta: number; reasoning: string };
    market_opportunity: { before: number; after: number; delta: number; reasoning: string };
    differentiation_strength: { before: number; after: number; delta: number; reasoning: string };
    timing_readiness: { before: number; after: number; delta: number; reasoning: string };
    founder_leverage: { before: number; after: number; delta: number; reasoning: string };
    execution_feasibility: { before: number; after: number; delta: number; reasoning: string };
  };
  riskShifts: {
    market_risk: { before: string; after: string; reasoning: string };
    execution_risk: { before: string; after: string; reasoning: string };
    timing_risk: { before: string; after: string; reasoning: string };
    technical_risk: { before: string; after: string; reasoning: string };
  };
  netScoreChange: number;
  projectedTotalScore: number;
  strategicImpact: string;
  recommendation: "Add" | "Skip" | "Needs Research";
  recommendationRationale: string;
}

// ──────────────────────────────────────────────
// Idea with all loaded relationships
// ──────────────────────────────────────────────
export interface IdeaWithVersions extends IdeaDocument {
  versions: IdeaVersion[];
  currentVersion: IdeaVersion | null;
  currentEvaluation: StoredEvaluation | null;
  currentMVPPlan: StoredMVPPlan | null;
  featureSimulations: StoredFeatureSimulation[];
}
