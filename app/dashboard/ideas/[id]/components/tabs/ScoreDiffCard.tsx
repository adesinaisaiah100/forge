"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreDiffItem {
  dimension: string;
  previousScore: number | null;
  nextScore: number;
  delta: number | null;
}

interface Props {
  totalScore: number;
  verdict: string;
  scoreDiff: ScoreDiffItem[];
}

function toTitle(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ScoreDiffCard({ totalScore, verdict, scoreDiff }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">Score Diff</h4>
        <span className="text-xs text-slate-500">Total {totalScore} • {verdict}</span>
      </div>

      <div className="mt-3 space-y-2">
        {scoreDiff.map((item) => (
          <div
            key={item.dimension}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2"
          >
            <span className="text-xs font-medium text-slate-700">
              {toTitle(item.dimension)}
            </span>

            {item.delta == null ? (
              <span className="text-xs text-slate-500">{item.nextScore}</span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-semibold",
                  item.delta > 0
                    ? "text-emerald-600"
                    : item.delta < 0
                      ? "text-rose-600"
                      : "text-slate-500"
                )}
              >
                {item.delta > 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : item.delta < 0 ? (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                {item.previousScore} → {item.nextScore}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
