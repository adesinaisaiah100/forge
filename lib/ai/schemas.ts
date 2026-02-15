import { z } from "zod";

// --- Agent 1: Idea Intelligence ---
export const ideaAnalysisSchema = z.object({
  category: z.string().describe("The best-fit product category (e.g., SaaS, Marketplace, Consumer App)"),
  industry_vertical: z.string().describe("The primary industry (e.g., Fintech, Health, EdTech)"),
  core_value_prop: z.string().describe("A clean, one-sentence value proposition"),
  suggested_tech_stack: z.array(z.string()).describe("List of recommended technologies"),
  monetization_models: z.array(z.string()).describe("List of potential revenue models"),
});

export type IdeaAnalysis = z.infer<typeof ideaAnalysisSchema>;

// --- Agent 2: Market Validation ---
export const marketAnalysisSchema = z.object({
  problem_severity: z.enum(["Low (Nice to have)", "Medium (Frustrating)", "High (Burning pain)"]).describe("How painful is the problem for the user?"),
  market_saturation: z.enum(["Blue Ocean", "Competitive", "Oversaturated"]).describe("How crowded is the market?"),
  existing_alternatives: z.array(
    z.object({
      name: z.string(),
      weakness: z.string(),
    })
  ).describe("List of main competitors and their specific weaknesses"),
  differentiation_potential: z.enum(["Hard", "Moderate", "Easy"]).describe("How hard is it to stand out?"),
});

export type MarketAnalysis = z.infer<typeof marketAnalysisSchema>;

// --- Agent 3: Timing & Leverage ---
export const timingAnalysisSchema = z.object({
  macro_tailwinds: z.array(z.string()).describe("External forces helping this idea (e.g. AI adoption)"),
  macro_headwinds: z.array(z.string()).describe("External forces hurting this idea (e.g. Regulation)"),
  founder_market_fit: z.enum(["Strong", "Neutral", "Weak"]).describe("How well suited the founder is for this"),
  why_now_verdict: z.enum(["Too Early", "Perfect Timing", "Too Late", "Unknown"]).describe("Is this the right time?"),
});

export type TimingAnalysis = z.infer<typeof timingAnalysisSchema>;

// --- Agent 4: The Aggregator (Final Output) ---

const scoreComponentSchema = z.object({
  score: z.number().min(0).max(100).describe("0-100 score"),
  insight: z.string().describe("Brief explanation of the score"),
});

const riskComponentSchema = z.object({
  level: z.enum(["low", "medium", "high", "critical"]),
  score: z.number().min(0).max(100).describe("Risk score (higher is riskier)"),
  reason: z.string().describe("Justification for the risk level"),
});

export const aggregatorRawSchema = z.object({
  score_breakdown: z.object({
    problem_strength: scoreComponentSchema,
    market_opportunity: scoreComponentSchema,
    differentiation_strength: scoreComponentSchema,
    timing_readiness: scoreComponentSchema,
    founder_leverage: scoreComponentSchema,
    execution_feasibility: scoreComponentSchema,
  }),
  risk_profile: z.object({
    market_risk: riskComponentSchema,
    execution_risk: riskComponentSchema,
    timing_risk: riskComponentSchema,
    technical_risk: riskComponentSchema,
  }),
  competitive_landscape: z.object({
    saturation_level: z.enum(["low", "medium", "high", "extreme"]),
    differentiation_difficulty: z.enum(["easy", "moderate", "hard", "nigh-impossible"]),
    positioning_gap: z.string().describe("Where this product should fit vs competitors"),
  }),
  strategic_analysis: z.object({
    primary_strengths: z.array(z.string()),
    key_weaknesses: z.array(z.string()),
  }),
  recommended_next_steps: z.array(z.string()).describe("Actionable list of what to do next"),
  executive_summary: z.string().describe("Executive summary of the evaluation"),
  confidence_level: z.number().min(0).max(100).describe("Confidence in this assessment (0-100)"),
});

export const evaluationResultSchema = z.object({
  overall_assessment: z.object({
    total_score: z.number().min(0).max(100).describe("Final weighted score"),
    verdict: z.enum(["GO", "REFINE", "KILL"]).describe("Final recommendation"),
    confidence_level: z.number().min(0).max(100).describe("Confidence in this assessment"),
    summary: z.string().describe("Executive summary of the evaluation"),
  }),
  score_breakdown: z.object({
    problem_strength: scoreComponentSchema,
    market_opportunity: scoreComponentSchema,
    differentiation_strength: scoreComponentSchema,
    timing_readiness: scoreComponentSchema,
    founder_leverage: scoreComponentSchema,
    execution_feasibility: scoreComponentSchema,
  }),
  risk_profile: z.object({
    market_risk: riskComponentSchema,
    execution_risk: riskComponentSchema,
    timing_risk: riskComponentSchema,
    technical_risk: riskComponentSchema,
  }),
  competitive_landscape: z.object({
    saturation_level: z.enum(["low", "medium", "high", "extreme"]),
    differentiation_difficulty: z.enum(["easy", "moderate", "hard", "nigh-impossible"]),
    positioning_gap: z.string().describe("Where this product should fit vs competitors"),
  }),
  strategic_analysis: z.object({
    primary_strengths: z.array(z.string()),
    key_weaknesses: z.array(z.string()),
  }),
  recommended_next_steps: z.array(z.string()).describe("Actionable list of what to do next"),
});

export type EvaluationResult = z.infer<typeof evaluationResultSchema>;
export type RawAggregatorOutput = z.infer<typeof aggregatorRawSchema>;

// --- MVP Generator Pipeline ---

export const mvpFeaturePrioritySchema = z.object({
  feature: z.string().describe("Name of the feature"),
  priority: z.enum(["Must Have", "Should Have", "Nice to Have", "Ignore"]).describe("MoSCoW priority"),
  rationale: z.string().describe("Why this priority level"),
  effort_estimate: z.enum(["Hours", "Days", "Weeks"]).describe("Rough build effort"),
});

export const mvpPlanSchema = z.object({
  core_hypothesis: z.string().describe("The single riskiest assumption this MVP must validate. One sentence."),
  kill_condition: z.string().describe("The specific measurable signal that means this idea should be abandoned. Be concrete — e.g., 'Less than 5% signup-to-activation rate after 500 visitors.'"),
  lean_experiment: z.object({
    description: z.string().describe("What to build — the minimal viable test"),
    duration: z.string().describe("How long the experiment should run (e.g., '2 weeks')"),
    success_metric: z.string().describe("The measurable outcome that indicates success"),
    failure_metric: z.string().describe("The measurable outcome that indicates failure"),
  }),
  feature_prioritization: z.array(mvpFeaturePrioritySchema).describe("Ordered list of features by priority"),
  what_to_ignore: z.array(z.string()).describe("Things founders typically waste time on that should be skipped for this MVP"),
  build_order: z.array(
    z.object({
      step: z.number().describe("Step number (1-based)"),
      action: z.string().describe("What to build or do in this step"),
      rationale: z.string().describe("Why this step comes at this point"),
    })
  ).describe("Ordered sequence of what to build first, second, third"),
  estimated_timeline: z.string().describe("Total estimated time to build and test this MVP (e.g., '3-4 weeks')"),
});

export type MVPPlan = z.infer<typeof mvpPlanSchema>;
export type MVPFeaturePriority = z.infer<typeof mvpFeaturePrioritySchema>;

// --- Feature Impact Simulation Pipeline ---

export const scoreDeltaSchema = z.object({
  before: z.number().min(0).max(100).describe("Current score for this pillar"),
  after: z.number().min(0).max(100).describe("Projected score if the feature is added"),
  delta: z.number().min(-100).max(100).describe("Change in score (after - before)"),
  reasoning: z.string().describe("Why this pillar is affected (or not) by the proposed feature"),
});

export const riskShiftSchema = z.object({
  before: z.enum(["low", "medium", "high", "critical"]),
  after: z.enum(["low", "medium", "high", "critical"]),
  reasoning: z.string().describe("How the feature changes this risk dimension"),
});

export const featureSimulationSchema = z.object({
  feature_summary: z.string().describe("One-sentence restatement of the proposed feature in clear product terms"),
  score_deltas: z.object({
    problem_strength: scoreDeltaSchema,
    market_opportunity: scoreDeltaSchema,
    differentiation_strength: scoreDeltaSchema,
    timing_readiness: scoreDeltaSchema,
    founder_leverage: scoreDeltaSchema,
    execution_feasibility: scoreDeltaSchema,
  }),
  risk_shifts: z.object({
    market_risk: riskShiftSchema,
    execution_risk: riskShiftSchema,
    timing_risk: riskShiftSchema,
    technical_risk: riskShiftSchema,
  }),
  net_score_change: z.number().min(-100).max(100).describe("Net weighted score change across all pillars"),
  projected_total_score: z.number().min(0).max(100).describe("What the total score would be with this feature"),
  strategic_impact: z.string().describe("2-3 sentence summary of overall strategic impact"),
  recommendation: z.enum(["Add", "Skip", "Needs Research"]).describe("Whether to add this feature, skip it, or research further"),
  recommendation_rationale: z.string().describe("Why this recommendation was made"),
});

export type FeatureSimulation = z.infer<typeof featureSimulationSchema>;
export type ScoreDelta = z.infer<typeof scoreDeltaSchema>;
export type RiskShift = z.infer<typeof riskShiftSchema>;
