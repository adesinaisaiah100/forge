import { generateText, Output } from 'ai';
import { groq } from '@ai-sdk/groq';
import { evaluatorWeights } from '../weights';
import { aggregatorRawSchema, IdeaAnalysis, MarketAnalysis, TimingAnalysis, EvaluationResult, RawAggregatorOutput } from '../schemas';
import { IdeaIntake } from '../types';

interface AggregatorInput {
  idea: IdeaIntake;
  ideaAnalysis: IdeaAnalysis;
  marketAnalysis: MarketAnalysis;
  timingAnalysis: TimingAnalysis;
}

// --- Helper: Confidence Calculation ---
function calculateConfidence(input: IdeaIntake, breakdown: RawAggregatorOutput['score_breakdown']): number {
  // 1. Input Completeness (Simple length heuristic)
  const fields = [input.idea, input.problem, input.targetUser, input.alternatives || "", input.timing || "", input.stage || ""];
  const avgLength = fields.reduce((sum, f) => sum + f.length, 0) / fields.length;
  // If avg length > 50 chars, full points. clamps 0-100.
  const completenessScore = Math.min(100, Math.max(0, (avgLength / 50) * 100));

  // 2. Agent Agreement (Variance between key dimensions)
  // Low variance = High agreement/consistency
  const keyScores = [
    breakdown.problem_strength.score,
    breakdown.market_opportunity.score,
    breakdown.differentiation_strength.score
  ];
  const mean = keyScores.reduce((a, b) => a + b, 0) / keyScores.length;
  const variance = keyScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / keyScores.length;
  // Variance typically ranges 0-2500. Map to 0-100 agreement score.
  // 0 variance -> 100 score. 400 variance (e.g. 70, 90, 50) -> 60ish score?
  // Let's optimize: Max expected variance is around 2500 (0, 0, 100?). 
  // Let's be generous: variance of 100 (diff of 10) is fine.
  const agreementScore = Math.max(0, 100 - (variance / 10)); // Heuristic

  // 3. Differentiation Clarity
  // Uses the direct differentiation score as a proxy for "clarity of value"
  const clarityScore = breakdown.differentiation_strength.score;

  // Weighted Sum
  const rawConfidence = 
    (completenessScore * 0.4) +
    (agreementScore * 0.4) +
    (clarityScore * 0.2);

  return Math.round(Math.min(100, Math.max(0, rawConfidence)));
}

// --- Helper: Verdict Derivation ---
function deriveVerdict(
  score: number, 
  breakdown: RawAggregatorOutput['score_breakdown'], 
  riskProfile: RawAggregatorOutput['risk_profile']
): "GO" | "REFINE" | "KILL" {
  
  // 1. Hard Overrides
  if (breakdown.problem_strength.score < 40) return "KILL";
  if (riskProfile.market_risk.level === "critical") return "KILL";

  // 2. Score Bands
  if (score >= 80) {
    // 3. Risk Adjustment for High Scores
    if (breakdown.differentiation_strength.score < 55) {
      return "REFINE"; // Good idea, but weak moat
    }
    if (riskProfile.market_risk.level === "high") {
      return "REFINE"; // Risky bet
    }
    return "GO";
  }

  if (score >= 60) return "REFINE";

  return "KILL";
}

export const aggregateAnalysis = async ({ idea, ideaAnalysis, marketAnalysis, timingAnalysis }: AggregatorInput): Promise<EvaluationResult> => { // Explicit return type
  const result = await generateText({
    model: groq('openai/gpt-oss-120b'), // Strongest model for synthesis
    output: Output.object({ schema: aggregatorRawSchema }),
    system: `You are the Lead Partner / Investment Committee at a top-tier VC firm.
    Your goal is to synthesize reports from your specialized analysts into a final, quantified investment memo.
    
    PHILOSOPHY:
    - You are a strategic diagnostic system, not a helpful AI assistant.
    - Prioritize weaknesses over strengths. Identify structural fragility.
    - No vague encouragement. Be decisive. Surface kill signals early.
    - If something is broken, say it plainly. If something is strong, quantify why.
    
    CRITICAL SCORING RULES:
    - You must assign numerical scores (0-100) for each dimension.
    - Scores below 50 indicate weakness.
    - Scores 50–70 indicate moderate viability.
    - Scores 70–85 indicate strong potential.
    - Scores above 85 should be rare and only used when exceptional.
    - Do not inflate scores.
    - Be internally consistent.
    
    You will receive:
    1. The core Idea
    2. Idea Agent Report (Strategy & Tech)
    3. Market Agent Report (Competition & Saturation)
    4. Timing Agent Report (Macro Trends)
    
    Synthesize these into a cohesive narrative. Do not just repeat their points—weigh them.
    
    You must generate a score for 'execution_feasibility' based on the suggested tech stack and product complexity found in Report 1.
    
    Generate the "risk_profile" based on the contradictions or weaknesses in the reports.
    
    For recommended_next_steps: be concrete and actionable. No generic advice like "do market research". Specify exactly what to validate, build, or kill.`,
    prompt: `
    ORIGINAL IDEA: 
    ${JSON.stringify(idea, null, 2)}
    
    --- REPORT 1: STRATEGY & TECH ---
    ${JSON.stringify(ideaAnalysis, null, 2)}
    
    --- REPORT 2: MARKET & COMPETITION ---
    ${JSON.stringify(marketAnalysis, null, 2)}
    
    --- REPORT 3: TIMING & WHY NOW ---
    ${JSON.stringify(timingAnalysis, null, 2)}
    
    Produce the final Investment Memorandum components.`,
  });

  if (!result.output) {
      throw new Error("Failed to generate aggregated analysis");
  }

  const raw = result.output;

  // --- Backend Math Calculation ---
  const breakdown = raw.score_breakdown;
  
  const totalScore = 
    breakdown.problem_strength.score * evaluatorWeights.problem_strength +
    breakdown.market_opportunity.score * evaluatorWeights.market_opportunity +
    breakdown.differentiation_strength.score * evaluatorWeights.differentiation_strength +
    breakdown.timing_readiness.score * evaluatorWeights.timing_readiness +
    breakdown.founder_leverage.score * evaluatorWeights.founder_leverage +
    breakdown.execution_feasibility.score * evaluatorWeights.execution_feasibility;

  // Normalize total score
  const weightSum = Object.values(evaluatorWeights).reduce((a, b) => a + b, 0);
  const normalizedScore = Math.round(totalScore / weightSum);

  // Confidence Calculation
  const finalConfidence = calculateConfidence(idea, breakdown);

  // Derive Verdict
  const verdict = deriveVerdict(normalizedScore, breakdown, raw.risk_profile);

  // Construct Final Object
  return {
    overall_assessment: {
      total_score: normalizedScore,
      verdict: verdict,
      confidence_level: finalConfidence,
      summary: raw.executive_summary,
    },
    ...raw, // Spreads score_breakdown, risk_profile, etc.
  };
};
