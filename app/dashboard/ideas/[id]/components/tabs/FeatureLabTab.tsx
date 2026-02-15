"use client";

import { useState } from "react";
import {
  FlaskConical,
  Loader2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StoredFeatureSimulation } from "@/lib/ai/types";

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface Props {
  simulations: StoredFeatureSimulation[];
  ideaVersionId: string | null;
  onSimulate: (proposedFeature: string) => Promise<StoredFeatureSimulation>;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const recommendationStyles: Record<string, { bg: string; text: string; border: string }> = {
  Add: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Skip: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Needs Research": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-400">
        <Minus className="h-3 w-3" /> 0
      </span>
    );
  }
  const isPositive = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-bold",
        isPositive ? "text-emerald-600" : "text-rose-600"
      )}
    >
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? "+" : ""}
      {delta}
    </span>
  );
}

function RiskShiftBadge({ before, after }: { before: string; after: string }) {
  if (before === after) {
    return <span className="text-xs text-slate-400">No change</span>;
  }

  const riskOrder = ["low", "medium", "high", "critical"];
  const improved = riskOrder.indexOf(after) < riskOrder.indexOf(before);

  return (
    <span className={cn("text-xs font-bold", improved ? "text-emerald-600" : "text-rose-600")}>
      {before} → {after}
    </span>
  );
}

const pillarLabels: Record<string, string> = {
  problem_strength: "Problem",
  market_opportunity: "Market",
  differentiation_strength: "Differentiation",
  timing_readiness: "Timing",
  founder_leverage: "Founder",
  execution_feasibility: "Execution",
};

const riskLabels: Record<string, string> = {
  market_risk: "Market",
  execution_risk: "Execution",
  timing_risk: "Timing",
  technical_risk: "Technical",
};

// ──────────────────────────────────────────────
// Simulation Card (expandable)
// ──────────────────────────────────────────────

function SimulationCard({ sim }: { sim: StoredFeatureSimulation }) {
  const [expanded, setExpanded] = useState(false);
  const recStyle = recommendationStyles[sim.recommendation] ?? recommendationStyles["Skip"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Summary Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
      >
        {/* Net Score Badge */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
            sim.netScoreChange > 0
              ? "bg-emerald-100 text-emerald-700"
              : sim.netScoreChange < 0
              ? "bg-rose-100 text-rose-700"
              : "bg-slate-100 text-slate-500"
          )}
        >
          {sim.netScoreChange > 0 ? "+" : ""}
          {sim.netScoreChange}
        </div>

        {/* Feature Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">
            {sim.featureSummary}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            &ldquo;{sim.proposedFeature}&rdquo;
          </p>
        </div>

        {/* Recommendation Badge */}
        <span
          className={cn(
            "shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold",
            recStyle.bg,
            recStyle.text,
            recStyle.border
          )}
        >
          {sim.recommendation}
        </span>

        {/* Projected Score */}
        <div className="shrink-0 text-right hidden sm:block">
          <span className="text-xs text-slate-400">Projected</span>
          <p className="font-bold text-slate-900">{sim.projectedTotalScore}</p>
        </div>

        {/* Expand toggle */}
        <div className="shrink-0 text-slate-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-5 space-y-5">
              {/* Strategic Impact */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Strategic Impact
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {sim.strategicImpact}
                </p>
              </div>

              {/* Score Deltas Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Score Impact by Pillar
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(sim.scoreDeltas).map(([key, delta]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500">
                          {pillarLabels[key] ?? key}
                        </span>
                        <DeltaBadge delta={delta.delta} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>{delta.before}</span>
                        <span>→</span>
                        <span className="font-medium text-slate-600">
                          {delta.after}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {delta.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Shifts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="h-3 w-3" />
                  Risk Shifts
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(sim.riskShifts).map(([key, shift]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                    >
                      <span className="text-xs font-medium text-slate-500">
                        {riskLabels[key] ?? key}
                      </span>
                      <div className="mt-1">
                        <RiskShiftBadge before={shift.before} after={shift.after} />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {shift.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Rationale */}
              <div className={cn("rounded-xl border p-4", recStyle.bg, recStyle.border)}>
                <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-1", recStyle.text)}>
                  Why &ldquo;{sim.recommendation}&rdquo;
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {sim.recommendationRationale}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// FeatureLabTab — Main Component
// ──────────────────────────────────────────────

export function FeatureLabTab({ simulations: initialSimulations, ideaVersionId, onSimulate }: Props) {
  const [simulations, setSimulations] = useState<StoredFeatureSimulation[]>(initialSimulations);
  const [featureInput, setFeatureInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!featureInput.trim() || !ideaVersionId) return;
    setIsSimulating(true);
    setError(null);
    try {
      const result = await onSimulate(featureInput.trim());
      setSimulations((prev) => [result, ...prev]);
      setFeatureInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Feature Lab</h2>
        <p className="text-slate-500">
          Simulate how adding a feature would change your strategic profile.
        </p>
      </div>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Propose a Feature</h3>
            <p className="text-xs text-slate-400">
              Describe a feature — the AI will simulate its impact on every scoring pillar and risk dimension.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            placeholder='e.g. "Add an AI-powered recommendation engine that suggests relevant content based on user behavior patterns"'
            rows={3}
            disabled={isSimulating}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 resize-none transition-colors disabled:opacity-50"
          />

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {simulations.length} simulation{simulations.length !== 1 ? "s" : ""} run
            </span>
            <button
              onClick={handleSimulate}
              disabled={isSimulating || !featureInput.trim() || !ideaVersionId}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all",
                isSimulating || !featureInput.trim()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:-translate-y-0.5 hover:shadow-md"
              )}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Simulating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Simulations List */}
      {simulations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
          <div className="rounded-full bg-white p-3 shadow-sm">
            <Plus className="h-6 w-6 text-slate-300" />
          </div>
          <h3 className="mt-3 text-sm font-medium text-slate-900">
            No simulations yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Propose a feature above to see how it would affect your idea&apos;s strategic profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700">
            Past Simulations
          </h3>
          {simulations.map((sim) => (
            <SimulationCard key={sim.$id} sim={sim} />
          ))}
        </div>
      )}
    </div>
  );
}
