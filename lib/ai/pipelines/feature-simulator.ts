import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { featureSimulationSchema, FeatureSimulation } from "../schemas";
import type { StoredEvaluation } from "../types";
import { evaluatorWeights } from "../weights";

/**
 * Feature Impact Simulation Pipeline
 *
 * Input:  Current evaluation + proposed feature description
 * Output: Per-pillar score deltas, risk shifts, net impact, recommendation
 *
 * Single structured LLM call with Zod validation.
 * Does NOT create a new version — purely hypothetical simulation.
 */

interface FeatureSimulatorInput {
  ideaText: string;
  targetUser: string;
  problem: string;
  proposedFeature: string;
  evaluation: StoredEvaluation;
}

/**
 * Format current scores as a readable string for the prompt.
 */
function formatCurrentScores(
  breakdown: StoredEvaluation["scoreBreakdown"]
): string {
  return Object.entries(breakdown)
    .map(
      ([key, val]) =>
        `  - ${key.replace(/_/g, " ")}: ${val.score}/100 ("${val.insight}")`
    )
    .join("\n");
}

/**
 * Format current risks as a readable string for the prompt.
 */
function formatCurrentRisks(
  riskProfile: StoredEvaluation["riskProfile"]
): string {
  return Object.entries(riskProfile)
    .map(
      ([key, val]) =>
        `  - ${key.replace(/_/g, " ")}: ${val.level} (score ${val.score}) — "${val.reason}"`
    )
    .join("\n");
}

/**
 * Format the weight distribution for context.
 */
function formatWeights(): string {
  return Object.entries(evaluatorWeights)
    .map(([key, weight]) => `  - ${key.replace(/_/g, " ")}: ${(weight * 100).toFixed(0)}%`)
    .join("\n");
}

export async function simulateFeatureImpact(
  input: FeatureSimulatorInput
): Promise<FeatureSimulation> {
  const currentScores = formatCurrentScores(input.evaluation.scoreBreakdown);
  const currentRisks = formatCurrentRisks(input.evaluation.riskProfile);
  const weights = formatWeights();

  const result = await generateText({
    model: groq("openai/gpt-oss-120b"),
    output: Output.object({ schema: featureSimulationSchema }),
    system: `You are a strategic feature impact analyst. You simulate how adding a proposed feature would change a startup idea's strategic profile.

PHILOSOPHY:
- You are a diagnostic system, not a cheerleader. Be honest about feature impact.
- Most features have MIXED effects — they improve some pillars while regressing others.
- Adding a feature ALWAYS increases execution complexity. Reflect this accurately.
- Score changes should be grounded and proportional. A single feature rarely moves a score by more than 10-15 points.
- If a feature is irrelevant to a pillar, the delta should be 0 with a clear "no material impact" reasoning.
- Risk shifts should be conservative — a single feature rarely changes risk levels by more than one step.

SCORING WEIGHTS (for net_score_change calculation):
${weights}

CURRENT EVALUATION:
- Total Score: ${input.evaluation.totalScore}/100
- Verdict: ${input.evaluation.verdict}
- Confidence: ${input.evaluation.confidence}%

CURRENT PILLAR SCORES:
${currentScores}

CURRENT RISK PROFILE:
${currentRisks}

RULES:
- The "before" values in score_deltas MUST exactly match the current scores listed above.
- The "before" values in risk_shifts MUST exactly match the current risk levels listed above.
- net_score_change must be the weighted sum of all pillar deltas using the weights above.
- projected_total_score = current total (${input.evaluation.totalScore}) + net_score_change.
- Be specific about HOW the feature affects each pillar. "May improve" is not acceptable — explain the causal mechanism.
- recommendation must be justified: "Add" only if net positive AND doesn't introduce critical new risks. "Skip" if net negative or adds disproportionate complexity. "Needs Research" if the impact depends on unknowns.`,
    prompt: `Simulate the impact of adding this feature to the startup idea:

IDEA: "${input.ideaText}"
TARGET USER: ${input.targetUser}
CORE PROBLEM: ${input.problem}

PROPOSED FEATURE: "${input.proposedFeature}"

Analyze how this feature would change each scoring pillar and risk dimension. Be precise with before/after scores and provide causal reasoning.`,
    temperature: 0.3,
  });

  if (!result.experimental_output) {
    throw new Error("Feature simulation failed — no structured output returned.");
  }

  return result.experimental_output;
}
