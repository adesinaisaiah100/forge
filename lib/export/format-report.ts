import type {
  CompetitorProfile,
  CompleteEvaluation,
  StoredFeatureSimulation,
  StoredMVPPlan,
} from "@/lib/ai/types";

export interface ReportPayload {
  ideaTitle: string;
  stage: string;
  versionNumber: number;
  generatedAt: string;
  ideaIntake: {
    idea: string;
    targetUser: string;
    problem: string;
    alternatives: string;
    timing: string;
    founderFit: string;
    stage: string;
  };
  evaluation: CompleteEvaluation;
  competitorProfiles: CompetitorProfile[];
  mvpPlan: StoredMVPPlan | null;
  featureSimulations: StoredFeatureSimulation[];
}

export function formatAsJSON(payload: ReportPayload) {
  return {
    report: {
      ideaTitle: payload.ideaTitle,
      stage: payload.stage,
      versionNumber: payload.versionNumber,
      generatedAt: payload.generatedAt,
    },
    evaluation: payload.evaluation,
    competitorProfiles: payload.competitorProfiles,
    mvpPlan: payload.mvpPlan,
    featureSimulations: payload.featureSimulations,
    ideaIntake: payload.ideaIntake,
  };
}

function formatDimensionRows(payload: ReportPayload): string {
  const dimensions = payload.evaluation.score_breakdown;
  const rows: Array<{ label: string; score: number; insight: string; weight: string }> = [
    {
      label: "Problem Strength",
      score: dimensions.problem_strength.score,
      insight: dimensions.problem_strength.insight,
      weight: "25%",
    },
    {
      label: "Market Opportunity",
      score: dimensions.market_opportunity.score,
      insight: dimensions.market_opportunity.insight,
      weight: "20%",
    },
    {
      label: "Differentiation Strength",
      score: dimensions.differentiation_strength.score,
      insight: dimensions.differentiation_strength.insight,
      weight: "20%",
    },
    {
      label: "Timing Readiness",
      score: dimensions.timing_readiness.score,
      insight: dimensions.timing_readiness.insight,
      weight: "15%",
    },
    {
      label: "Founder Leverage",
      score: dimensions.founder_leverage.score,
      insight: dimensions.founder_leverage.insight,
      weight: "10%",
    },
    {
      label: "Execution Feasibility",
      score: dimensions.execution_feasibility.score,
      insight: dimensions.execution_feasibility.insight,
      weight: "10%",
    },
  ];

  return rows
    .map((row) => `- **${row.label}**: ${row.score}/100 (Weight ${row.weight}) — ${row.insight}`)
    .join("\n");
}

export function formatAsMarkdown(payload: ReportPayload): string {
  const verdict = payload.evaluation.overall_assessment.verdict;
  const reportDate = new Date(payload.generatedAt).toLocaleString();

  const riskRows = Object.entries(payload.evaluation.risk_profile)
    .map(([key, value]) => {
      const label = key.replace(/_/g, " ");
      return `- **${label}**: ${value.level.toUpperCase()} (${value.score}/100) — ${value.reason}`;
    })
    .join("\n");

  const competitorRows = payload.competitorProfiles.length
    ? payload.competitorProfiles
        .map(
          (competitor) =>
            `- **${competitor.name}** (${competitor.stage}, ${competitor.threatLevel} threat): ${competitor.description}\n  - Differentiation: ${competitor.howYouDiffer}`
        )
        .join("\n")
    : "- No structured competitor profiles available.";

  const nextSteps = payload.evaluation.recommended_next_steps
    .map((step) => `- ${step}`)
    .join("\n");

  const mvpSection = payload.mvpPlan
    ? [
        "## MVP Plan",
        `- **Core Hypothesis**: ${payload.mvpPlan.coreHypothesis}`,
        `- **Kill Condition**: ${payload.mvpPlan.killCondition}`,
        `- **Estimated Timeline**: ${payload.mvpPlan.estimatedTimeline}`,
        "- **Build Order**:",
        ...payload.mvpPlan.buildOrder.map(
          (step) => `  - ${step.step}. ${step.action} — ${step.rationale}`
        ),
      ].join("\n")
    : "## MVP Plan\n- MVP plan not generated yet.";

  const simulationSection = payload.featureSimulations.length
    ? [
        "## Feature Lab Results",
        ...payload.featureSimulations.slice(0, 10).map(
          (simulation, index) =>
            `${index + 1}. **${simulation.proposedFeature}**\n   - Recommendation: ${simulation.recommendation}\n   - Net score impact: ${simulation.netScoreChange}\n   - Rationale: ${simulation.recommendationRationale}`
        ),
      ].join("\n")
    : "## Feature Lab Results\n- No simulations saved yet.";

  return [
    `# Forge Report — ${payload.ideaTitle}`,
    `Generated: ${reportDate}`,
    `Version: V${payload.versionNumber}`,
    "",
    "## Cover",
    `- **Stage**: ${payload.stage}`,
    `- **Forge Score**: ${payload.evaluation.overall_assessment.total_score}/100`,
    `- **Verdict**: ${verdict}`,
    "",
    "## Executive Summary",
    payload.evaluation.overall_assessment.summary,
    "",
    "## Score Breakdown",
    formatDimensionRows(payload),
    "",
    "## Risk Profile",
    riskRows,
    "",
    "## Competitive Landscape",
    competitorRows,
    "",
    "## Strategic Analysis",
    `- **Primary Strengths**: ${payload.evaluation.strategic_analysis.primary_strengths.join(", ")}`,
    `- **Key Weaknesses**: ${payload.evaluation.strategic_analysis.key_weaknesses.join(", ")}`,
    "",
    "## Recommended Next Steps",
    nextSteps,
    "",
    mvpSection,
    "",
    simulationSection,
    "",
    "## Appendix: Raw Intake",
    `- **Idea**: ${payload.ideaIntake.idea}`,
    `- **Target User**: ${payload.ideaIntake.targetUser}`,
    `- **Problem**: ${payload.ideaIntake.problem}`,
    `- **Alternatives**: ${payload.ideaIntake.alternatives}`,
    `- **Timing**: ${payload.ideaIntake.timing}`,
    `- **Founder Fit**: ${payload.ideaIntake.founderFit}`,
    `- **Stage**: ${payload.ideaIntake.stage}`,
  ].join("\n");
}
