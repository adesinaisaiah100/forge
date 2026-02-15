import { runEvaluation } from "@/app/actions/ai";
import { getIdeaWithVersions, saveEvaluation } from "@/app/actions/ideas";
import { notFound } from "next/navigation";
import { IdeaWorkspace } from "./components/IdeaWorkspace";
import type { CompleteEvaluation } from "@/lib/ai/types";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Idea Workspace Page
 *
 * 1. Fetches the idea + versions + existing evaluation from Appwrite
 * 2. If no evaluation exists for the current version, runs the AI pipeline
 * 3. Persists the result so subsequent visits don't re-run the AI
 * 4. Passes everything to the IdeaWorkspace client component
 */
export default async function IdeaWorkspacePage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch idea with all relationships
  const ideaData = await getIdeaWithVersions(id);
  if (!ideaData) {
    notFound();
  }

  const { currentVersion, currentEvaluation } = ideaData;
  const isFirstRunEvaluation = !currentEvaluation;

  // 2. Determine if we need to run the AI pipeline
  let evaluation: CompleteEvaluation;

  if (currentEvaluation) {
    // Re-hydrate the stored evaluation from rawAiResponse (full AI output)
    // Falls back to reconstructing from individual fields if rawAiResponse is missing
    if (currentEvaluation.rawAiResponse) {
      evaluation = currentEvaluation.rawAiResponse;
    } else {
      evaluation = {
        overall_assessment: {
          total_score: currentEvaluation.totalScore,
          verdict: currentEvaluation.verdict,
          confidence_level: currentEvaluation.confidence,
          summary: currentEvaluation.executiveSummary,
        },
        score_breakdown: currentEvaluation.scoreBreakdown,
        risk_profile: currentEvaluation.riskProfile,
        competitive_landscape: currentEvaluation.competitiveLandscape,
        strategic_analysis: currentEvaluation.strategicAnalysis,
        recommended_next_steps: currentEvaluation.recommendedNextSteps,
        raw_reports: {
          idea: { category: "", industry_vertical: "", core_value_prop: "", suggested_tech_stack: [], monetization_models: [] },
          market: { problem_severity: "Medium (Frustrating)", market_saturation: "Competitive", existing_alternatives: [], differentiation_potential: "Moderate" },
          timing: { macro_tailwinds: [], macro_headwinds: [], founder_market_fit: "Neutral", why_now_verdict: "Unknown" },
        },
      };
    }
  } else {
    // 3. Run the full AI pipeline
    evaluation = await runEvaluation({
      idea: ideaData.idea,
      targetUser: ideaData.targetUser,
      problem: ideaData.problem,
      alternatives: ideaData.alternatives,
      timing: ideaData.timing,
      founderFit: ideaData.founderFit,
      stage: ideaData.stage,
    });

    // 4. Persist the evaluation
    if (currentVersion) {
      await saveEvaluation(currentVersion.$id, evaluation);
    }
  }

  return (
    <IdeaWorkspace
      idea={ideaData}
      evaluation={evaluation}
      versions={ideaData.versions}
      currentVersion={currentVersion}
      mvpPlan={ideaData.currentMVPPlan}
      featureSimulations={ideaData.featureSimulations}
      isFirstRunEvaluation={isFirstRunEvaluation}
    />
  );
}
