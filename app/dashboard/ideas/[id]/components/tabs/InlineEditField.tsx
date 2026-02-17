"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreDiffCard } from "./ScoreDiffCard";

interface ReEvalResult {
  fieldName: string;
  value: string;
  versionId: string;
  versionNumber: number;
  totalScore: number;
  verdict: "GO" | "REFINE" | "KILL";
  scoreDiff: Array<{
    dimension: string;
    previousScore: number | null;
    nextScore: number;
    delta: number | null;
  }>;
}

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  onReEvaluate: (newValue: string) => Promise<ReEvalResult>;
}

export function InlineEditField({ label, value, placeholder, onReEvaluate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReEvalResult | null>(null);

  const hasChanged = useMemo(() => draft.trim() !== value.trim(), [draft, value]);

  const handleCancel = () => {
    setDraft(value);
    setError(null);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!hasChanged || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await onReEvaluate(draft.trim());
      setResult(response);
      setIsEditing(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to re-evaluate this field."
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setIsEditing(true);
              setError(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Re-evaluate
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder={placeholder ?? "Update this field"}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasChanged || isSubmitting}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
                !hasChanged || isSubmitting
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Re-evaluate
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>

          {isSubmitting ? (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-slate-700">{value}</p>
      )}

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">
            Updated to version {result.versionNumber}
          </p>
          <ScoreDiffCard
            totalScore={result.totalScore}
            verdict={result.verdict}
            scoreDiff={result.scoreDiff}
          />
        </div>
      ) : null}
    </div>
  );
}
