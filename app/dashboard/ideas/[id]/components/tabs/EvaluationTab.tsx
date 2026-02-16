"use client";

import { RawAggregatorOutput } from "@/lib/ai/schemas";
import { CompleteEvaluation } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import { AssessmentRadarChart } from "@/app/dashboard/components/AssessmentRadarChart";
import { 
    TrendingUp, 
    Users, 
    Target, 
    Zap, 
    Clock, 
    Code2, 
    DollarSign,
    ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBreakpoints } from "@/lib/hooks/use-breakpoints";

interface Props {
  data: RawAggregatorOutput["score_breakdown"];
  raw_reports: CompleteEvaluation["raw_reports"];
    isFirstRun?: boolean;
}

type DimensionKey = keyof RawAggregatorOutput["score_breakdown"];

export function EvaluationTab({ data, raw_reports, isFirstRun = false }: Props) {
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>('problem_strength');
    const [showFirstRunSkeleton, setShowFirstRunSkeleton] = useState(isFirstRun);
    const { isMobile } = useBreakpoints();

    useEffect(() => {
        if (!isFirstRun) return;
        const timer = setTimeout(() => setShowFirstRunSkeleton(false), 800);
        return () => clearTimeout(timer);
    }, [isFirstRun]);

  const dimensions: { key: DimensionKey; label: string; icon: React.ElementType }[] = [
    { key: 'problem_strength', label: 'Problem Strength', icon: Target },
    { key: 'market_opportunity', label: 'Market Opportunity', icon: Users },
    { key: 'differentiation_strength', label: 'Differentiation', icon: Zap },
    { key: 'timing_readiness', label: 'Timing', icon: Clock },
    { key: 'execution_feasibility', label: 'Execution', icon: Code2 },
    { key: 'founder_leverage', label: 'Founder Fit', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Deep Analysis</h2>
        <p className="text-slate-500">Click on any dimension to reveal the raw data from the agent network.</p>
      </div>

    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
         
         {/* Left Column: Chart & Navigation (5 cols) */}
         <div className="space-y-4 lg:col-span-5 lg:space-y-6">
             {/* Simple Selection List */}
             <div className="rounded-2xl border border-slate-200 bg-white p-2">
                 {dimensions.map((dim) => (
                     <button
                        key={dim.key}
                        onClick={() => setSelectedDimension(dim.key)}
                        className={cn(
                            "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                            selectedDimension === dim.key 
                                ? "bg-slate-900 text-white shadow-md" 
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                     >
                        <div className="flex items-center gap-3">
                            <dim.icon className={cn("h-4 w-4", selectedDimension === dim.key ? "text-slate-300" : "text-slate-400")} />
                            {dim.label}
                        </div>
                        <div className="flex items-center gap-3">
                             <div className={cn(
                                 "text-xs font-bold px-2 py-0.5 rounded-full border",
                                 selectedDimension === dim.key ? "bg-white/20 border-transparent text-white" : "bg-slate-100 border-slate-200 text-slate-500"
                             )}>
                                 {data[dim.key].score}
                             </div>
                             {selectedDimension === dim.key && <ArrowRight className="h-4 w-4 text-slate-400" />}
                        </div>
                     </button>
                 ))}
             </div>

             {/* Radar Chart Review */}
             {!isMobile && <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 self-start">Visual Mix</h4>
                 <div className="w-full h-62.5 max-w-75">
                    <AssessmentRadarChart 
                        data={data} 
                        selectedDimension={selectedDimension}
                        onDimensionSelect={setSelectedDimension}
                    />
                 </div>
             </div>}
         </div>

         {/* Right Column: Deep Dive Panel (7 cols) */}
         <div className="lg:col-span-7">
             {showFirstRunSkeleton ? (
                <DeepDiveSkeleton />
             ) : (
               <AnimatePresence mode="wait">
                   <motion.div
                      key={selectedDimension}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                             className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8"
                   >
                      <DeepDiveContent 
                          dimension={selectedDimension} 
                          scoreData={data[selectedDimension]} 
                          reports={raw_reports} 
                      />
                   </motion.div>
               </AnimatePresence>
             )}
         </div>

      </div>
    </div>
  );
}

function DeepDiveSkeleton() {
    return (
        <div className="h-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col">
            <div className="mb-6 border-b border-slate-100 pb-6">
                <div className="h-10 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-5 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                        </div>
                        <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Subcomponent: Content Router ---

function DeepDiveHeader({ scoreData }: { scoreData: RawAggregatorOutput["score_breakdown"][DimensionKey] }) {
    return (
        <div className="border-b border-slate-100 pb-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
                 <span className={cn(
                     "text-4xl font-black tracking-tighter",
                     scoreData.score >= 80 ? "text-emerald-600" : scoreData.score >= 60 ? "text-amber-500" : "text-rose-500"
                 )}>
                     {scoreData.score}
                 </span>
                 <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                     / 100 Score
                 </span>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed font-medium">
                {scoreData.insight}
            </p>
        </div>
    );
}

function DeepDiveContent({ dimension, scoreData, reports }: { dimension: DimensionKey; scoreData: RawAggregatorOutput["score_breakdown"][DimensionKey]; reports: CompleteEvaluation["raw_reports"] }) {
    // Render based on selected dimension
    switch (dimension) {
        case 'market_opportunity':
            return (
                <div>
                   <DeepDiveHeader scoreData={scoreData} />
                   <div className="space-y-6">
                       <DataItem label="Market Saturation" value={reports.market.market_saturation} />
                       <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                           <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Major Competitors Identified</h4>
                           <div className="space-y-3">
                               {reports.market.existing_alternatives.map((comp, i) => (
                                   <div key={i} className="flex gap-4 items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                       <div className="flex-1">
                                           <div className="font-bold text-slate-900">{comp.name}</div>
                                       </div>
                                       <div className="flex-1 text-sm text-slate-500 border-l border-slate-100 pl-4">
                                           <span className="block text-xs font-semibold text-rose-500 mb-1">WEAKNESS:</span>
                                           {comp.weakness}
                                       </div>
                                   </div>
                               ))}
                               {reports.market.existing_alternatives.length === 0 && (
                                   <p className="text-slate-400 italic">No direct competitors found (Blue Ocean opportunities require extra validation).</p>
                               )}
                           </div>
                       </div>
                   </div>
                </div>
            );

        case 'differentiation_strength':
             return (
                 <div>
                    <DeepDiveHeader scoreData={scoreData} />
                    <div className="space-y-6">
                        <DataItem label="Differentiation Difficulty" value={reports.market.differentiation_potential} />
                        <div className="grid gap-4 md:grid-cols-2">
                             <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                                 <h4 className="flex items-center gap-2 mb-3 text-sm font-bold uppercase tracking-wider text-blue-800">
                                     <Zap className="h-4 w-4" /> Core Value Prop
                                 </h4>
                                 <p className="text-blue-900 font-medium leading-relaxed">
                                     {reports.idea.core_value_prop}
                                 </p>
                             </div>
                             <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
                                 <h4 className="flex items-center gap-2 mb-3 text-sm font-bold uppercase tracking-wider text-emerald-800">
                                     <DollarSign className="h-4 w-4" /> Business Model
                                 </h4>
                                 <ul className="space-y-1">
                                     {reports.idea.monetization_models.map((m, i) => (
                                         <li key={i} className="text-emerald-900 text-sm font-medium">• {m}</li>
                                     ))}
                                 </ul>
                             </div>
                        </div>
                    </div>
                 </div>
             );
        
        case 'problem_strength':
             return (
                 <div>
                     <DeepDiveHeader scoreData={scoreData} />
                     <div className="space-y-6">
                        <DataItem label="Pain Level" value={reports.market.problem_severity} />
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                             <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Industry Vertical</h4>
                             <p className="text-slate-900 font-medium">{reports.idea.industry_vertical} / {reports.idea.category}</p>
                        </div>
                     </div>
                 </div>
             );

        case 'execution_feasibility':
             return (
                 <div>
                     <DeepDiveHeader scoreData={scoreData} />
                     <div className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                             <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                 <Code2 className="h-4 w-4" /> Suggested Tech Stack
                             </h4>
                             <div className="flex flex-wrap gap-2">
                                 {reports.idea.suggested_tech_stack.map((tech, i) => (
                                     <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200">
                                         {tech}
                                     </span>
                                 ))}
                             </div>
                        </div>
                     </div>
                 </div>
             );

        case 'timing_readiness':
             return (
                 <div>
                     <DeepDiveHeader scoreData={scoreData} />
                     <div className="space-y-6">
                        <DataItem label="Why Now Verdict" value={reports.timing.why_now_verdict} />
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                <h4 className="font-bold text-emerald-800 text-sm mb-3">Tailwinds (Helping You)</h4>
                                <ul className="space-y-2">
                                    {reports.timing.macro_tailwinds.map((t, i) => (
                                        <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"/> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                                <h4 className="font-bold text-rose-800 text-sm mb-3">Headwinds (Hurting You)</h4>
                                <ul className="space-y-2">
                                    {reports.timing.macro_headwinds.map((t, i) => (
                                        <li key={i} className="text-sm text-rose-700 flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"/> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                     </div>
                 </div>
             );

        case 'founder_leverage':
             return (
                 <div>
                     <DeepDiveHeader scoreData={scoreData} />
                     <div className="space-y-6">
                        <DataItem label="Founder-Market Fit" value={reports.timing.founder_market_fit} />
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                            <p className="text-sm text-slate-500 italic">
                                &quot;Ideas are cheap. Founder fit is expensive. This score reflects an AI estimation of how well the founding team profile aligns with the specific problem space.&quot;
                            </p>
                        </div>
                     </div>
                 </div>
             );

        default:
            return <div>Select a dimension</div>;
    }
}

function DataItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className="text-slate-900 font-bold">{value}</span>
        </div>
    )
}
