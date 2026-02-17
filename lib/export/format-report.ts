import type { EvaluationResult } from "@/lib/ai/schemas";
import type { StoredFeatureSimulation, StoredMVPPlan } from "@/lib/ai/types";

interface FormatInput {
  ideaTitle: string;
  idea: {
    idea: string;
    targetUser: string;
    problem: string;
    alternatives: string;
    timing: string;
    founderFit: string;
    stage: string;
  };
  evaluation: EvaluationResult;
  mvpPlan: StoredMVPPlan | null;
  featureSimulations: StoredFeatureSimulation[];
}

export function formatAsMarkdown(input: FormatInput): string {
  const lines: string[] = [];

  lines.push(`# Forge Report — ${input.ideaTitle}`);
  lines.push("");
  lines.push(`- Stage: ${input.idea.stage}`);
  lines.push(`- Forge Score: ${input.evaluation.overall_assessment.total_score}`);
  lines.push(`- Verdict: ${input.evaluation.overall_assessment.verdict}`);
  lines.push("");

  lines.push("## Executive Summary");
  lines.push(input.evaluation.overall_assessment.summary);
  lines.push("");

  lines.push("## Score Breakdown");
  for (const [dimension, value] of Object.entries(input.evaluation.score_breakdown)) {
    lines.push(`- **${dimension.replace(/_/g, " ")}**: ${value.score} — ${value.insight}`);
  }
  lines.push("");

  lines.push("## Risk Profile");
  for (const [risk, value] of Object.entries(input.evaluation.risk_profile)) {
    lines.push(`- **${risk.replace(/_/g, " ")}**: ${value.level} (${value.score}) — ${value.reason}`);
  }
  lines.push("");

  lines.push("## Recommended Next Steps");
  input.evaluation.recommended_next_steps.forEach((step, index) => {
    lines.push(`${index + 1}. ${step}`);
  });
  lines.push("");

  if (input.mvpPlan) {
    lines.push("## MVP Plan");
    lines.push(`- Core Hypothesis: ${input.mvpPlan.coreHypothesis}`);
    lines.push(`- Kill Condition: ${input.mvpPlan.killCondition}`);
    lines.push(`- Estimated Timeline: ${input.mvpPlan.estimatedTimeline}`);
    lines.push("");

    lines.push("### Feature Prioritization");
    input.mvpPlan.featurePrioritization.forEach((feature) => {
      lines.push(
        `- ${feature.feature} (${feature.priority}, ${feature.effort_estimate}) — ${feature.rationale}`
      );
    });
    lines.push("");

    lines.push("### Build Order");
    input.mvpPlan.buildOrder.forEach((step) => {
      lines.push(`${step.step}. ${step.action} — ${step.rationale}`);
    });
    lines.push("");
  }

  if (input.featureSimulations.length > 0) {
    lines.push("## Feature Lab Results");
    input.featureSimulations.slice(0, 10).forEach((simulation, index) => {
      lines.push(
        `${index + 1}. ${simulation.proposedFeature} — ${simulation.recommendation} (Δ ${simulation.netScoreChange}, projected ${simulation.projectedTotalScore})`
      );
      lines.push(`   ${simulation.recommendationRationale}`);
    });
    lines.push("");
  }

  lines.push("## Raw Intake");
  lines.push(`- Idea: ${input.idea.idea}`);
  lines.push(`- Target User: ${input.idea.targetUser}`);
  lines.push(`- Problem: ${input.idea.problem}`);
  lines.push(`- Alternatives: ${input.idea.alternatives}`);
  lines.push(`- Timing: ${input.idea.timing}`);
  lines.push(`- Founder Fit: ${input.idea.founderFit}`);

  return lines.join("\n");
}

export function formatAsJSON(input: FormatInput) {
  return {
    meta: {
      title: input.ideaTitle,
      stage: input.idea.stage,
      generatedAt: new Date().toISOString(),
    },
    idea: input.idea,
    evaluation: input.evaluation,
    mvpPlan: input.mvpPlan,
    featureSimulations: input.featureSimulations,
  };
}
