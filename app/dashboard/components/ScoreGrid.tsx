"use client";

import { RawAggregatorOutput } from "../../../lib/ai/schemas";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface Props {
  data: RawAggregatorOutput["score_breakdown"];
}

function ScoreCard({ title, score, insight, index }: { title: string; score: number; insight: string; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getBarColor = (s: number) => {
    if (s >= 80) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
    if (s >= 60) return "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]";
    return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]";
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-600";
    if (s >= 60) return "text-amber-600";
    return "text-rose-600";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className={clsx(
        "group cursor-pointer relative overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-100",
        isExpanded ? "ring-2 ring-blue-500/10 shadow-lg" : "shadow-sm border-slate-100"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={clsx("text-4xl font-black tracking-tight", getScoreColor(score))}>
                {score}
            </span>
            <span className="text-sm font-medium text-slate-300">/100</span>
          </div>
        </div>
        
        <div className="rounded-full bg-slate-50 p-2 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.2 + (index * 0.1), duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${getBarColor(score)}`}
        />
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-dashed border-slate-100">
                <p className="text-sm leading-relaxed text-slate-600">
                    {insight}
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isExpanded && (
           <p className="mt-4 text-xs text-slate-400 line-clamp-2">
            {insight}
           </p>
      )}
    </motion.div>
  );
}

export function ScoreGrid({ data }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ScoreCard index={0} title="Problem" score={data.problem_strength.score} insight={data.problem_strength.insight} />
      <ScoreCard index={1} title="Market" score={data.market_opportunity.score} insight={data.market_opportunity.insight} />
      <ScoreCard index={2} title="Differentiation" score={data.differentiation_strength.score} insight={data.differentiation_strength.insight} />
      <ScoreCard index={3} title="Timing" score={data.timing_readiness.score} insight={data.timing_readiness.insight} />
      <ScoreCard index={4} title="Founder Fit" score={data.founder_leverage.score} insight={data.founder_leverage.insight} />
      <ScoreCard index={5} title="Execution" score={data.execution_feasibility.score} insight={data.execution_feasibility.insight} />
    </div>
  );
}
