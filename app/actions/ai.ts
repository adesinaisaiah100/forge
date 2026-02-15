"use server";

import { generateEvaluation } from "@/lib/ai/orchestrator";
import type { IdeaIntake, CompleteEvaluation } from "@/lib/ai/types";

/**
 * Run the full AI evaluation pipeline.
 * Called by the idea detail page when no persisted evaluation exists.
 */
export async function runEvaluation(input: IdeaIntake): Promise<CompleteEvaluation> {
  const result = await generateEvaluation({
    idea: input.idea,
    targetUser: input.targetUser,
    problem: input.problem,
    alternatives: input.alternatives,
    timing: input.timing,
    founderFit: input.founderFit,
    stage: input.stage,
  });

  return result;
}
