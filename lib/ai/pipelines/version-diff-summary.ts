import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

interface DiffSummaryInput {
  previousTotalScore: number | null;
  nextTotalScore: number;
  previousVerdict: "GO" | "REFINE" | "KILL" | null;
  nextVerdict: "GO" | "REFINE" | "KILL";
  scoreDiff: Array<{
    dimension: string;
    previousScore: number | null;
    nextScore: number;
    delta: number | null;
  }>;
  previousRiskProfile:
    | Record<string, { level: string; score: number; reason: string }>
    | null;
  nextRiskProfile: Record<string, { level: string; score: number; reason: string }>;
}

const diffSummarySchema = z.object({
  summary: z
    .string()
    .min(10)
    .max(260)
    .describe(
      "A concise two-sentence summary of the most important score and risk shifts between versions."
    ),
});

function fallbackSummary(input: DiffSummaryInput): string {
  const scoreShift =
    input.previousTotalScore == null
      ? `Score established at ${input.nextTotalScore}.`
      : `Score ${input.previousTotalScore} → ${input.nextTotalScore}.`;

  const verdictShift =
    input.previousVerdict == null
      ? `Verdict set to ${input.nextVerdict}.`
      : `Verdict ${input.previousVerdict} → ${input.nextVerdict}.`;

  const bestGain = input.scoreDiff
    .filter((entry) => entry.delta != null && entry.delta > 0)
    .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0))[0];

  const worstDrop = input.scoreDiff
    .filter((entry) => entry.delta != null && entry.delta < 0)
    .sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0))[0];

  const movement = bestGain
    ? `Largest gain was ${bestGain.dimension.replace(/_/g, " ")} (+${bestGain.delta}).`
    : worstDrop
    ? `Biggest drop was ${worstDrop.dimension.replace(/_/g, " ")} (${worstDrop.delta}).`
    : "Dimension scores were largely stable.";

  return `${scoreShift} ${verdictShift} ${movement}`;
}

export async function generateVersionDiffSummary(
  input: DiffSummaryInput
): Promise<string> {
  try {
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      temperature: 0,
      output: Output.object({ schema: diffSummarySchema }),
      system:
        "You write concise evolution summaries for startup idea versions. Keep it to exactly two sentences, plain language, and include score/verdict movement plus one key strategic shift.",
      prompt: [
        `Previous score: ${input.previousTotalScore ?? "N/A"}`,
        `New score: ${input.nextTotalScore}`,
        `Previous verdict: ${input.previousVerdict ?? "N/A"}`,
        `New verdict: ${input.nextVerdict}`,
        `Score diffs by dimension: ${JSON.stringify(input.scoreDiff)}`,
        `Previous risk profile: ${JSON.stringify(input.previousRiskProfile ?? {})}`,
        `New risk profile: ${JSON.stringify(input.nextRiskProfile)}`,
      ].join("\n"),
    });

    return result.output?.summary?.trim() || fallbackSummary(input);
  } catch {
    return fallbackSummary(input);
  }
}
