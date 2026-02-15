"use client";

import { useState } from "react";
import {
  Crosshair,
  Skull,
  FlaskConical,
  ListOrdered,
  Ban,
  Clock,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StoredMVPPlan } from "@/lib/ai/types";
import { Skeleton, SkeletonCircle, SkeletonText } from "../Skeletons";

interface Props {
  mvpPlan: StoredMVPPlan | null;
  ideaVersionId: string | null;
  onGenerate: () => Promise<void>;
}

export function MVPTab({
  mvpPlan,
  ideaVersionId,
  onGenerate,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!ideaVersionId) return;
    setIsGenerating(true);
    setError(null);
    try {
      await onGenerate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate MVP plan."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating && !mvpPlan) {
    return <MVPSkeleton />;
  }

  // ── Empty State: No MVP Plan yet ──
  if (!mvpPlan) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">MVP Plan</h2>
          <p className="text-slate-500">
            Generate a lean MVP plan that tests the highest-risk assumption
            first.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <div className="rounded-full bg-white p-4 shadow-sm">
            <FlaskConical className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No MVP plan generated yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Based on your evaluation scores and risk profile, the AI will design
            the leanest possible experiment to validate or kill this idea.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !ideaVersionId}
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-all",
              isGenerating
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:-translate-y-0.5 hover:shadow-md"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating MVP Plan…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate MVP Plan
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── MVP Plan Exists: Render Full UI ──
  const priorityStyles: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    "Must Have": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    "Should Have": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    "Nice to Have": {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
    },
    Ignore: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200",
    },
  };

  const effortStyles: Record<string, string> = {
    Hours: "text-emerald-600",
    Days: "text-amber-600",
    Weeks: "text-rose-600",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">MVP Plan</h2>
          <p className="text-slate-500">
            Lean experiment designed to validate or kill this idea fast.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {mvpPlan.estimatedTimeline}
        </div>
      </div>

      {/* 1. Core Hypothesis + Kill Condition — side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hypothesis Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Crosshair className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">Core Hypothesis</h3>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {mvpPlan.coreHypothesis}
          </p>
        </motion.div>

        {/* Kill Condition Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Skull className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">Kill Condition</h3>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {mvpPlan.killCondition}
          </p>
        </motion.div>
      </div>

      {/* 2. Lean Experiment */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Lean Experiment</h3>
            <span className="text-xs text-slate-400">
              Duration: {mvpPlan.leanExperiment.duration}
            </span>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed mb-5">
          {mvpPlan.leanExperiment.description}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Success Metric
              </span>
            </div>
            <p className="text-sm text-emerald-800 font-medium">
              {mvpPlan.leanExperiment.success_metric}
            </p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Failure Metric
              </span>
            </div>
            <p className="text-sm text-rose-800 font-medium">
              {mvpPlan.leanExperiment.failure_metric}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. Feature Prioritization Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="p-6 pb-0">
          <h3 className="font-bold text-slate-900">Feature Prioritization</h3>
          <p className="text-sm text-slate-500 mt-1">
            Every feature must earn its place.
          </p>
        </div>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Feature
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Priority
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Effort
                </th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                  Rationale
                </th>
              </tr>
            </thead>
            <tbody>
              {mvpPlan.featurePrioritization.map((item, i) => {
                const style = priorityStyles[item.priority] ?? {
                  bg: "bg-slate-50",
                  text: "text-slate-600",
                  border: "border-slate-200",
                };
                return (
                  <tr
                    key={i}
                    className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {item.feature}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold",
                          style.bg,
                          style.text,
                          style.border
                        )}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          effortStyles[item.effort_estimate] ?? "text-slate-500"
                        )}
                      >
                        {item.effort_estimate}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 hidden lg:table-cell">
                      {item.rationale}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 4. Build Order + What to Ignore — side by side */}
      <div className="grid gap-6 md:grid-cols-5">
        {/* Build Order (3/5 width) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <ListOrdered className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">Build Order</h3>
          </div>

          <div className="space-y-0">
            {mvpPlan.buildOrder.map((step, i) => (
              <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Vertical line */}
                {i < mvpPlan.buildOrder.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200" />
                )}
                {/* Step number */}
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {step.step}
                </div>
                <div className="pt-0.5">
                  <p className="font-medium text-slate-900">{step.action}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {step.rationale}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What to Ignore (2/5 width) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <Ban className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">Skip These</h3>
          </div>

          <ul className="space-y-3">
            {mvpPlan.whatToIgnore.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <span className="text-sm text-slate-600">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function MVPSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <SkeletonText className="h-5 w-32" />
        <SkeletonText className="mt-2 h-4 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <SkeletonCircle className="h-10 w-10" />
            <SkeletonText className="h-4 w-32" />
          </div>
          <SkeletonText className="h-4 w-full" />
          <SkeletonText className="h-4 w-5/6" />
          <SkeletonText className="h-4 w-2/3" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <SkeletonCircle className="h-10 w-10" />
            <SkeletonText className="h-4 w-28" />
          </div>
          <SkeletonText className="h-4 w-full" />
          <SkeletonText className="h-4 w-4/5" />
          <SkeletonText className="h-4 w-2/3" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <SkeletonCircle className="h-10 w-10" />
          <div>
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="mt-2 h-3 w-24" />
          </div>
        </div>
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-5/6" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <SkeletonText className="h-3 w-24" />
            <SkeletonText className="h-3 w-full" />
            <SkeletonText className="h-3 w-4/5" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <SkeletonText className="h-3 w-24" />
            <SkeletonText className="h-3 w-full" />
            <SkeletonText className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
