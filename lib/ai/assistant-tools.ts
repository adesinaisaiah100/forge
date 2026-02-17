import { tool } from "ai";
import { z } from "zod";
import { ID, Permission, Query, Role } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/config";
import { getAssistantIdeaState } from "@/lib/ai/assistant-data";
import { generateEvaluation } from "@/lib/ai/orchestrator";
import { simulateFeatureImpact } from "@/lib/ai/pipelines/feature-simulator";

const updatableIdeaFields = [
  "idea",
  "targetUser",
  "problem",
  "alternatives",
  "timing",
  "founderFit",
  "stage",
] as const;

type UpdateableField = (typeof updatableIdeaFields)[number];

interface AssistantToolsConfig {
  session: string;
  ideaId: string;
}

function buildDiffSummary(args: {
  previousTotalScore: number | null;
  nextTotalScore: number;
  previousVerdict: "GO" | "REFINE" | "KILL" | null;
  nextVerdict: "GO" | "REFINE" | "KILL";
  strongestGainDimension: string | null;
  strongestGainDelta: number | null;
  weakestDropDimension: string | null;
  weakestDropDelta: number | null;
}): string {
  const scoreShift =
    args.previousTotalScore == null
      ? `Score established at ${args.nextTotalScore}`
      : `Score ${args.previousTotalScore} → ${args.nextTotalScore}`;

  const verdictShift =
    args.previousVerdict == null
      ? `Verdict set to ${args.nextVerdict}`
      : `Verdict ${args.previousVerdict} → ${args.nextVerdict}`;

  const gain =
    args.strongestGainDimension && args.strongestGainDelta != null
      ? `Top gain: ${args.strongestGainDimension} (+${args.strongestGainDelta}).`
      : "No positive dimension movement.";

  const drop =
    args.weakestDropDimension && args.weakestDropDelta != null
      ? `Main drop: ${args.weakestDropDimension} (${args.weakestDropDelta}).`
      : "No dimension regressed.";

  return `${scoreShift}. ${verdictShift}. ${gain} ${drop}`;
}

export function createAssistantTools(config: AssistantToolsConfig) {
  return {
    re_evaluate_idea: tool({
      description:
        "Run a full re-evaluation after idea refinements and create a new version with score delta.",
      inputSchema: z.object({
        updates: z
          .object({
            idea: z.string().optional(),
            targetUser: z.string().optional(),
            problem: z.string().optional(),
            alternatives: z.string().optional(),
            timing: z.string().optional(),
            founderFit: z.string().optional(),
            stage: z.string().optional(),
          })
          .optional(),
      }),
      execute: async ({ updates }) => {
        const client = createSessionClient(config.session);
        const user = await client.account.get();
        const state = await getAssistantIdeaState(config.session, config.ideaId);

        if (!state.currentVersion) {
          throw new Error("No current idea version found for re-evaluation.");
        }

        const mergedIdea = {
          idea: updates?.idea ?? state.idea.idea,
          targetUser: updates?.targetUser ?? state.idea.targetUser,
          problem: updates?.problem ?? state.idea.problem,
          alternatives: updates?.alternatives ?? state.idea.alternatives,
          timing: updates?.timing ?? state.idea.timing,
          founderFit: updates?.founderFit ?? state.idea.founderFit,
          stage: updates?.stage ?? state.idea.stage,
        };

        const versionsResult = await client.databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.IDEA_VERSIONS,
          [
            Query.equal("ideaId", config.ideaId),
            Query.orderDesc("versionNumber"),
            Query.limit(1),
          ]
        );

        const latestVersion = versionsResult.documents[0];
        const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

        const newVersion = await client.databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.IDEA_VERSIONS,
          ID.unique(),
          {
            ideaId: config.ideaId,
            versionNumber: nextVersionNumber,
            baseIdeaText: mergedIdea.idea,
            featureList: JSON.stringify(state.currentVersion.featureList ?? []),
            parentVersionId: state.currentVersion.$id,
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        const evaluation = await generateEvaluation(mergedIdea);

        await client.databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.EVALUATIONS,
          ID.unique(),
          {
            ideaVersionId: newVersion.$id,
            totalScore: evaluation.overall_assessment.total_score,
            verdict: evaluation.overall_assessment.verdict,
            confidence: evaluation.overall_assessment.confidence_level,
            scoreBreakdown: JSON.stringify(evaluation.score_breakdown),
            riskProfile: JSON.stringify(evaluation.risk_profile),
            competitiveLandscape: JSON.stringify(evaluation.competitive_landscape),
            strategicAnalysis: JSON.stringify(evaluation.strategic_analysis),
            executiveSummary: evaluation.overall_assessment.summary,
            recommendedNextSteps: JSON.stringify(evaluation.recommended_next_steps),
            rawAiResponse: JSON.stringify(evaluation),
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        await client.databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.IDEAS,
          config.ideaId,
          {
            ...mergedIdea,
            currentVersionId: newVersion.$id,
          }
        );

        const previousScores = state.evaluation?.scoreBreakdown;
        const nextScores = evaluation.score_breakdown;

        const dimensions = Object.keys(nextScores) as Array<keyof typeof nextScores>;
        const scoreDiff = dimensions.map((dimensionKey) => {
          const previousScore = previousScores?.[dimensionKey]?.score ?? null;
          const nextScore = nextScores[dimensionKey].score;
          return {
            dimension: dimensionKey,
            previousScore,
            nextScore,
            delta:
              previousScore == null ? null : Math.round((nextScore - previousScore) * 10) / 10,
          };
        });

        const positiveDeltas = scoreDiff
          .filter((entry) => entry.delta != null && entry.delta > 0)
          .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));

        const negativeDeltas = scoreDiff
          .filter((entry) => entry.delta != null && entry.delta < 0)
          .sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0));

        const diffSummary = buildDiffSummary({
          previousTotalScore: state.evaluation?.totalScore ?? null,
          nextTotalScore: evaluation.overall_assessment.total_score,
          previousVerdict: state.evaluation?.verdict ?? null,
          nextVerdict: evaluation.overall_assessment.verdict,
          strongestGainDimension: positiveDeltas[0]?.dimension ?? null,
          strongestGainDelta: positiveDeltas[0]?.delta ?? null,
          weakestDropDimension: negativeDeltas[0]?.dimension ?? null,
          weakestDropDelta: negativeDeltas[0]?.delta ?? null,
        });

        try {
          await client.databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.IDEA_VERSIONS,
            newVersion.$id,
            {
              diffSummary,
            }
          );
        } catch {
        }

        return {
          versionId: newVersion.$id,
          versionNumber: nextVersionNumber,
          totalScore: evaluation.overall_assessment.total_score,
          verdict: evaluation.overall_assessment.verdict,
          confidence: evaluation.overall_assessment.confidence_level,
          diffSummary,
          scoreDiff,
        };
      },
    }),

    refine_feature: tool({
      description:
        "Simulate adding a feature and return projected score/risk changes using the Feature Lab pipeline.",
      inputSchema: z.object({
        proposedFeature: z
          .string()
          .min(3)
          .describe("The feature idea to simulate, in plain language."),
      }),
      execute: async ({ proposedFeature }) => {
        const client = createSessionClient(config.session);
        const user = await client.account.get();
        const state = await getAssistantIdeaState(config.session, config.ideaId);

        if (!state.currentVersion || !state.evaluation) {
          throw new Error(
            "A current version with evaluation is required before running feature refinement."
          );
        }

        const simulation = await simulateFeatureImpact({
          ideaText: state.idea.idea,
          targetUser: state.idea.targetUser,
          problem: state.idea.problem,
          proposedFeature,
          evaluation: state.evaluation,
        });

        await client.databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.FEATURE_SIMULATIONS,
          ID.unique(),
          {
            ideaVersionId: state.currentVersion.$id,
            proposedFeature,
            featureSummary: simulation.feature_summary,
            scoreDeltas: JSON.stringify(simulation.score_deltas),
            riskShifts: JSON.stringify(simulation.risk_shifts),
            netScoreChange: Math.round(simulation.net_score_change),
            projectedTotalScore: Math.round(simulation.projected_total_score),
            strategicImpact: simulation.strategic_impact,
            recommendation: simulation.recommendation,
            recommendationRationale: simulation.recommendation_rationale,
            rawAiResponse: JSON.stringify(simulation),
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        return {
          featureSummary: simulation.feature_summary,
          projectedTotalScore: Math.round(simulation.projected_total_score),
          netScoreChange: Math.round(simulation.net_score_change),
          recommendation: simulation.recommendation,
          recommendationRationale: simulation.recommendation_rationale,
          strategicImpact: simulation.strategic_impact,
        };
      },
    }),

    update_idea_field: tool({
      description:
        "Update one editable idea field (without triggering re-evaluation).",
      inputSchema: z.object({
        field: z.enum(updatableIdeaFields),
        value: z.string().min(1),
      }),
      execute: async ({ field, value }) => {
        const client = createSessionClient(config.session);
        const state = await getAssistantIdeaState(config.session, config.ideaId);

        const nextValue = value.trim();
        if (!nextValue) {
          throw new Error("Updated value cannot be empty.");
        }

        const updatePayload: Record<UpdateableField, string> = {
          idea: state.idea.idea,
          targetUser: state.idea.targetUser,
          problem: state.idea.problem,
          alternatives: state.idea.alternatives,
          timing: state.idea.timing,
          founderFit: state.idea.founderFit,
          stage: state.idea.stage,
        };

        updatePayload[field] = nextValue;

        await client.databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.IDEAS,
          config.ideaId,
          updatePayload
        );

        return {
          field,
          value: nextValue,
          message:
            "Idea field updated successfully. Re-run re_evaluate_idea when you want updated scoring.",
        };
      },
    }),
  };
}
