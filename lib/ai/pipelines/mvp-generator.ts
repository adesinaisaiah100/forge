import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { mvpPlanSchema, MVPPlan } from "../schemas";
import type { StoredEvaluation } from "../types";

/**
 * MVP Generator Pipeline
 *
 * Input:  Full evaluation + idea context
 * Output: Structured MVP plan focused on testing the highest-risk assumption
 *
 * This is NOT an autonomous agent — it's a single structured LLM call
 * that produces deterministic JSON via Zod schema validation.
 */

interface MVPGeneratorInput {
  ideaText: string;
  targetUser: string;
  problem: string;
  evaluation: StoredEvaluation;
}

/**
 * Identify the weakest scoring pillar from the evaluation breakdown.
 */
function findWeakestPillar(breakdown: StoredEvaluation["scoreBreakdown"]): {
  name: string;
  score: number;
  insight: string;
} {
  const pillars = Object.entries(breakdown) as [
    string,
    { score: number; insight: string }
  ][];

  const weakest = pillars.reduce((prev, current) =>
    current[1].score < prev[1].score ? current : prev
  );

  return {
    name: weakest[0].replace(/_/g, " "),
    score: weakest[1].score,
    insight: weakest[1].insight,
  };
}

/**
 * Identify the highest risk from the risk profile.
 */
function findHighestRisk(riskProfile: StoredEvaluation["riskProfile"]): {
  name: string;
  level: string;
  reason: string;
} {
  const riskLevels: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const risks = Object.entries(riskProfile) as [
    string,
    { level: string; score: number; reason: string }
  ][];

  const highest = risks.reduce((prev, current) =>
    (riskLevels[current[1].level] ?? 0) > (riskLevels[prev[1].level] ?? 0)
      ? current
      : prev
  );

  return {
    name: highest[0].replace(/_/g, " "),
    level: highest[1].level,
    reason: highest[1].reason,
  };
}

export async function generateMVPPlan(
  input: MVPGeneratorInput
): Promise<MVPPlan> {
  const weakestPillar = findWeakestPillar(input.evaluation.scoreBreakdown);
  const highestRisk = findHighestRisk(input.evaluation.riskProfile);

  const result = await generateText({
    model: groq("openai/gpt-oss-120b"),
    output: Output.object({ schema: mvpPlanSchema }),
    system: `You are a ruthless MVP architect. You design the leanest possible experiments that validate or kill startup ideas fast.

PHILOSOPHY:
- You are a strategic diagnostic system, not a helpful assistant.
- Design an MVP that tests the highest-risk assumption FIRST.
- Do NOT propose full product builds. Focus on falsifiability.
- Every feature must earn its place. Default to "Ignore" unless it directly validates the core hypothesis.
- Kill conditions must be measurable and specific — no vague metrics.
- Build order must be sequential and pragmatic.

CONTEXT:
- This idea scored ${input.evaluation.totalScore}/100 with verdict: ${input.evaluation.verdict}
- Weakest pillar: "${weakestPillar.name}" at ${weakestPillar.score}/100 — "${weakestPillar.insight}"
- Highest risk: "${highestRisk.name}" (${highestRisk.level}) — "${highestRisk.reason}"
- Target user: ${input.targetUser}
- Core problem: ${input.problem}

RULES:
- The core_hypothesis must directly address the weakest pillar or highest risk.
- The kill_condition must be a specific, measurable signal (numbers, percentages, timeframes).
- Feature prioritization: Maximum 8 features. At least 2 must be "Ignore".
- Build order: Maximum 6 steps. Each step must be completable in 1–3 days.
- what_to_ignore: List 3–5 things founders typically waste time on that are irrelevant for this MVP.
- Be brutally honest. If the idea is weak, the MVP should be designed to prove it fast.`,
    prompt: `Design a lean MVP plan for this startup idea:

IDEA: "${input.ideaText}"

FULL EVALUATION SUMMARY:
- Score: ${input.evaluation.totalScore}/100
- Verdict: ${input.evaluation.verdict}
- Confidence: ${input.evaluation.confidence}%
- Executive Summary: ${input.evaluation.executiveSummary}

SCORE BREAKDOWN:
${JSON.stringify(input.evaluation.scoreBreakdown, null, 2)}

RISK PROFILE:
${JSON.stringify(input.evaluation.riskProfile, null, 2)}

STRATEGIC ANALYSIS:
- Strengths: ${input.evaluation.strategicAnalysis.primary_strengths.join(", ")}
- Weaknesses: ${input.evaluation.strategicAnalysis.key_weaknesses.join(", ")}

Design the leanest possible MVP that validates or kills this idea.`,
  });

  if (!result.output) {
    throw new Error("Failed to generate MVP plan");
  }

  return result.output;
}
