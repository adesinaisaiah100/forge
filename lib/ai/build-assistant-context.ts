import type { AssistantIdeaState } from "@/lib/ai/assistant-data";
import { evaluatorWeights } from "@/lib/ai/weights";

const dimensionLabelMap = {
  problem_strength: "Problem Strength",
  market_opportunity: "Market Opportunity",
  differentiation_strength: "Differentiation",
  timing_readiness: "Timing Readiness",
  founder_leverage: "Founder Leverage",
  execution_feasibility: "Execution Feasibility",
} as const;

const riskLabelMap = {
  market_risk: "Market",
  execution_risk: "Execution",
  timing_risk: "Timing",
  technical_risk: "Technical",
} as const;

export function buildAssistantContext(state: AssistantIdeaState): string {
  const { idea, currentVersion, evaluation, mvpPlan } = state;

  if (!evaluation) {
    return [
      `IDEA: ${idea.title}`,
      `STAGE: ${idea.stage} | VERSION: ${currentVersion?.versionNumber ?? 1}`,
      "SCORE: Not evaluated yet",
      "",
      `TARGET USER: ${idea.targetUser}`,
      `PROBLEM: ${idea.problem}`,
      `IDEA: ${idea.idea}`,
    ].join("\n");
  }

  const dimensionEntries = Object.entries(evaluation.scoreBreakdown).map(
    ([key, value]) => {
      const label =
        dimensionLabelMap[key as keyof typeof dimensionLabelMap] ?? key;
      const weight =
        evaluatorWeights[key as keyof typeof evaluatorWeights] != null
          ? `${Math.round(
              evaluatorWeights[key as keyof typeof evaluatorWeights] * 100
            )}%`
          : "n/a";

      return {
        key,
        label,
        score: value.score,
        weight,
      };
    }
  );

  const sortedDimensions = [...dimensionEntries].sort((a, b) => a.score - b.score);
  const weakestDimension = sortedDimensions[0];
  const strongestDimension = sortedDimensions[sortedDimensions.length - 1];

  const riskEntries = Object.entries(evaluation.riskProfile).map(([key, value]) => ({
    key,
    label: riskLabelMap[key as keyof typeof riskLabelMap] ?? key,
    level: value.level,
    score: value.score,
    reason: value.reason,
  }));

  const topRisk = [...riskEntries].sort((a, b) => b.score - a.score)[0];

  const completedTasks = Object.values(mvpPlan?.featureStatuses ?? {}).filter(
    (status) => status === "completed"
  ).length;
  const totalTasks = (mvpPlan?.featurePrioritization?.length ?? 0) +
    (mvpPlan?.buildOrder?.length ?? 0);

  const mvpStatus = !mvpPlan
    ? "Not generated"
    : `Generated (${completedTasks}/${Math.max(totalTasks, 1)} tasks complete)`;

  return [
    `IDEA: ${idea.title}`,
    `STAGE: ${idea.stage} | VERSION: ${currentVersion?.versionNumber ?? 1}`,
    `SCORE: ${evaluation.totalScore}/100 | VERDICT: ${evaluation.verdict} | CONFIDENCE: ${evaluation.confidence}%`,
    "",
    "DIMENSIONS:",
    ...dimensionEntries.map(
      (entry) => `  ${entry.label}: ${entry.score} (weight ${entry.weight})`
    ),
    "",
    `WEAKEST: ${weakestDimension.label} (${weakestDimension.score})`,
    `STRONGEST: ${strongestDimension.label} (${strongestDimension.score})`,
    "",
    `RISKS: ${riskEntries
      .map((risk) => `${risk.label} ${risk.level}`)
      .join(" | ")}`,
    `TOP RISK: ${topRisk.label} — ${topRisk.reason}`,
    "",
    `MVP STATUS: ${mvpStatus}`,
    "LAST VERSION CHANGE: Version managed via re-evaluation workflow",
    "",
    `TARGET USER: ${idea.targetUser}`,
    `PROBLEM: ${idea.problem}`,
    `IDEA: ${idea.idea}`,
  ].join("\n");
}
