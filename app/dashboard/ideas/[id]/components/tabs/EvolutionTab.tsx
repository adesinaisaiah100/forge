"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, GitCommitHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IdeaVersion, StoredEvaluation } from "@/lib/ai/types";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  versions: IdeaVersion[];
  evaluations: StoredEvaluation[];
  currentVersionId: string | null;
}

interface EvolutionEntry {
  version: IdeaVersion;
  evaluation: StoredEvaluation;
  previousEvaluation: StoredEvaluation | null;
}

const dimensionMeta: Array<{
  key: keyof StoredEvaluation["scoreBreakdown"];
  label: string;
}> = [
  { key: "problem_strength", label: "Problem Strength" },
  { key: "market_opportunity", label: "Market Opportunity" },
  { key: "differentiation_strength", label: "Differentiation" },
  { key: "timing_readiness", label: "Timing Readiness" },
  { key: "founder_leverage", label: "Founder Leverage" },
  { key: "execution_feasibility", label: "Execution Feasibility" },
];

function getVerdictClass(verdict: StoredEvaluation["verdict"]): string {
  if (verdict === "GO") return "bg-emerald-100 text-emerald-700";
  if (verdict === "REFINE") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function getRiskShiftText(
  current: StoredEvaluation["riskProfile"],
  previous: StoredEvaluation["riskProfile"] | null
): string {
  if (!previous) return "First measured version";

  const keys: Array<keyof StoredEvaluation["riskProfile"]> = [
    "market_risk",
    "execution_risk",
    "timing_risk",
    "technical_risk",
  ];

  const changed = keys.find((key) => current[key].level !== previous[key].level);
  if (!changed) return "Risk profile unchanged";

  const label = changed.replace(/_/g, " ");
  return `${label}: ${previous[changed].level} → ${current[changed].level}`;
}

export function EvolutionTab({ versions, evaluations, currentVersionId }: Props) {
  const evaluationByVersion = useMemo(() => {
    return new Map(evaluations.map((evaluation) => [evaluation.ideaVersionId, evaluation]));
  }, [evaluations]);

  const entries = useMemo<EvolutionEntry[]>(() => {
    const ordered = [...versions]
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map((version) => {
        const evaluation = evaluationByVersion.get(version.$id);
        if (!evaluation) return null;

        const previousVersion = versions.find(
          (candidate) => candidate.versionNumber === version.versionNumber - 1
        );
        const previousEvaluation = previousVersion
          ? evaluationByVersion.get(previousVersion.$id) ?? null
          : null;

        return {
          version,
          evaluation,
          previousEvaluation,
        };
      })
      .filter((entry): entry is EvolutionEntry => entry !== null);

    return ordered;
  }, [evaluationByVersion, versions]);

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    currentVersionId ?? entries[0]?.version.$id ?? null
  );

  const chartData = useMemo(
    () =>
      [...entries]
        .reverse()
        .map((entry) => ({
          version: `V${entry.version.versionNumber}`,
          totalScore: entry.evaluation.totalScore,
        })),
    [entries]
  );

  const improvementStreak = useMemo(() => {
    const chronological = [...entries].reverse();
    if (chronological.length < 2) return 0;

    let streak = 0;
    for (let index = chronological.length - 1; index > 0; index -= 1) {
      const current = chronological[index];
      const previous = chronological[index - 1];
      if (current.evaluation.totalScore > previous.evaluation.totalScore) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  const biggestGain = useMemo(() => {
    let best: { label: string; delta: number } | null = null;

    for (const { key, label } of dimensionMeta) {
      const earliest = [...entries].reverse()[0]?.evaluation.scoreBreakdown[key].score;
      const latest = entries[0]?.evaluation.scoreBreakdown[key].score;

      if (earliest == null || latest == null) continue;

      const delta = latest - earliest;
      if (best == null || delta > best.delta) {
        best = { label, delta };
      }
    }

    return best;
  }, [entries]);

  const selectedEntry =
    entries.find((entry) => entry.version.$id === selectedVersionId) ?? entries[0] ?? null;

  if (entries.length === 0) {
    return (
      <div className="flex h-[55vh] items-center justify-center rounded-3xl border border-slate-200 bg-white text-center">
        <div>
          <p className="text-sm font-semibold text-slate-900">No evolution data yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Create a new version from AI Assistant re-evaluation to populate your timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Score Evolution
            </p>
            <h3 className="text-lg font-bold text-slate-900">Forge Score Over Time</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
              {improvementStreak} consecutive improvements
            </span>
            {biggestGain ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                Biggest gain: {biggestGain.label} {biggestGain.delta >= 0 ? `+${biggestGain.delta}` : biggestGain.delta}
              </span>
            ) : null}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="version" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                cursor={{ stroke: "#e2e8f0" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Line
                type="monotone"
                dataKey="totalScore"
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0f172a" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Version Timeline</h3>
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const next = entries[index + 1];
            const delta = next ? entry.evaluation.totalScore - next.evaluation.totalScore : 0;
            const isSelected = selectedEntry?.version.$id === entry.version.$id;

            return (
              <button
                key={entry.version.$id}
                type="button"
                onClick={() => setSelectedVersionId(entry.version.$id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-75">
                      Version {entry.version.versionNumber}
                    </p>
                    <p className="mt-1 text-xl font-bold">{entry.evaluation.totalScore}</p>
                  </div>

                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      isSelected
                        ? "bg-white/15 text-white"
                        : getVerdictClass(entry.evaluation.verdict)
                    )}
                  >
                    {entry.evaluation.verdict}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <GitCommitHorizontal className="h-3.5 w-3.5" />
                  <span>
                    {delta > 0 ? `+${delta}` : delta} vs previous version
                  </span>
                </div>

                {next && (
                  <div
                    className={cn(
                      "mt-3 h-1 w-full rounded",
                      delta > 0
                        ? "bg-emerald-200"
                        : delta < 0
                        ? "bg-rose-200"
                        : "bg-slate-200"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Selected Snapshot
            </p>
            <h3 className="text-lg font-bold text-slate-900">
              Version {selectedEntry.version.versionNumber} • Score {selectedEntry.evaluation.totalScore}
            </h3>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold uppercase",
              getVerdictClass(selectedEntry.evaluation.verdict)
            )}
          >
            {selectedEntry.evaluation.verdict}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {getRiskShiftText(
            selectedEntry.evaluation.riskProfile,
            selectedEntry.previousEvaluation?.riskProfile ?? null
          )}
        </div>

        <div className="space-y-2">
          {dimensionMeta.map(({ key, label }) => {
            const nextScore = selectedEntry.evaluation.scoreBreakdown[key].score;
            const prevScore = selectedEntry.previousEvaluation?.scoreBreakdown[key].score ?? null;
            const delta = prevScore == null ? null : nextScore - prevScore;

            return (
              <div key={key} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-slate-700">{label}</span>
                  <span className="font-semibold text-slate-900">{nextScore}</span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-slate-900"
                    style={{ width: `${Math.max(0, Math.min(100, nextScore))}%` }}
                  />
                </div>

                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  {delta == null ? (
                    <span>First measured value</span>
                  ) : delta >= 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">+{delta}</span>
                      <span>vs previous</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-3 w-3 text-rose-600" />
                      <span className="text-rose-700">{delta}</span>
                      <span>vs previous</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </div>
  );
}
