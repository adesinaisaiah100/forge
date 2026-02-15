"use client";

import { EvaluationResult } from "@/lib/ai/schemas";
import { ArrowRight, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabId } from "../IdeaWorkspace";

interface Props {
  evaluation: EvaluationResult;
  moveToTab: (tab: TabId) => void;
}

export function OverviewTab({ evaluation, moveToTab }: Props) {
  const { overall_assessment } = evaluation;

  return (
    <div className="space-y-8">
      {/* 1. Header & Big Score */}
      <div className="grid gap-6 md:grid-cols-2">
         {/* Introduction */}
         <div className="space-y-4">
             <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Mission Control
             </h2>
             <p className="text-lg text-slate-600 leading-relaxed">
                {overall_assessment.summary}
             </p>
         </div>

         {/* Hero Score Card */}
         <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/10">
            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full space-y-2">
                 <div className="text-xs font-bold uppercase tracking-widest opacity-50">Forge Score</div>
                 <div className="text-7xl font-black tracking-tighter">
                    {overall_assessment.total_score}
                 </div>
                 <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    {overall_assessment.verdict === "GO" ? "🚀 High Potential" : overall_assessment.verdict === "REFINE" ? "🛠 Needs Work" : "🛑 No Go"}
                 </div>
            </div>
            {/* Background Gradient */}
            <div className={cn(
                "absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full blur-3xl opacity-40",
                overall_assessment.verdict === "GO" ? "bg-emerald-500" : overall_assessment.verdict === "REFINE" ? "bg-amber-500" : "bg-rose-500"
            )} />
         </div>
      </div>

      {/* 2. Progress Tracker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
           <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-4">
               <span>Lifecycle Status</span>
               <span>Stage 2 of 5</span>
           </div>
           
           <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-1 bg-slate-100 rounded-full" />
                
                {/* Steps */}
                <div className="relative z-10 flex w-full justify-between">
                     {[
                        { label: "Concept", status: "complete" },
                        { label: "Evaluation", status: "complete" },
                        { label: "MVP Specs", status: "current" },
                        { label: "Build", status: "pending" },
                        { label: "Launch", status: "pending" }
                     ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 bg-white px-2">
                             <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300",
                                step.status === "complete" ? "border-slate-900 bg-slate-900 text-white" : 
                                step.status === "current" ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-50" :
                                "border-slate-200 bg-slate-50 text-slate-300"
                             )}>
                                {step.status === "complete" && <Target className="h-4 w-4" />}
                                {step.status === "current" && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                             </div>
                             <span className={cn(
                                "text-xs font-semibold uppercase tracking-wider",
                                step.status === "complete" ? "text-slate-900" :
                                step.status === "current" ? "text-blue-600" :
                                "text-slate-300"
                             )}>{step.label}</span>
                        </div>
                     ))}
                </div>
           </div>
      </div>

      {/* 3. The One Next Move */}
      <div className="grid gap-6 md:grid-cols-2">
           <div 
             onClick={() => moveToTab('evaluation')}
             className="group cursor-pointer rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
            >
               <div className="flex items-center gap-3 mb-3">
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                       <ArrowRight className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-slate-900">Recommended Focus</h3>
               </div>
               <p className="text-slate-600 line-clamp-2 mb-4 group-hover:text-slate-900 transition-colors">
                   {evaluation.recommended_next_steps[0]}
               </p>
               <div className="flex items-center text-sm font-medium text-blue-600 group-hover:underline">
                   View analysis <ArrowRight className="ml-1 h-4 w-4" />
               </div>
           </div>

           <div 
             onClick={() => moveToTab('risks')}
             className="group cursor-pointer rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50 to-white p-6 shadow-sm transition-all hover:shadow-md hover:border-amber-300"
            >
               <div className="flex items-center gap-3 mb-3">
                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                       <AlertTriangle className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-slate-900">Top Risk Factor</h3>
               </div>
               <p className="text-slate-600 mb-4 group-hover:text-slate-900 transition-colors">
                   {evaluation.risk_profile.market_risk.level === 'critical' ? 'Critical Market Risk' : 
                    evaluation.risk_profile.execution_risk.level === 'critical' ? 'Critical Execution Risk' :
                    evaluation.risk_profile.market_risk.level === 'high' ? 'High Market Risk' : 'Review Risk Profile'}
               </p>
               <div className="flex items-center text-sm font-medium text-amber-600 group-hover:underline">
                   De-risk now <ArrowRight className="ml-1 h-4 w-4" />
               </div>
           </div>
      </div>
    </div>
  );
}
