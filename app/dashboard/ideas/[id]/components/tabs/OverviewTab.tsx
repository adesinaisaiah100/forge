"use client";

import { useRouter } from "next/navigation";
import { EvaluationResult } from "@/lib/ai/schemas";
import { CompetitorProfile, IdeaDocument } from "@/lib/ai/types";
import { ArrowRight, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabId } from "../IdeaWorkspace";
import { InlineEditField } from "./InlineEditField";

interface Props {
   ideaId: string;
   idea: Pick<
      IdeaDocument,
      "idea" | "targetUser" | "problem" | "alternatives" | "timing" | "founderFit" | "stage"
   >;
  evaluation: EvaluationResult;
   competitorProfiles: CompetitorProfile[];
  moveToTab: (tab: TabId) => void;
}

export function OverviewTab({ ideaId, idea, evaluation, competitorProfiles, moveToTab }: Props) {
   const router = useRouter();
  const { overall_assessment } = evaluation;

   const handleReEvaluate = async (
      fieldName: "idea" | "targetUser" | "problem" | "alternatives" | "timing" | "founderFit" | "stage",
      value: string
   ) => {
      const { reEvaluateWithChange } = await import("@/app/actions/ideas");
      const result = await reEvaluateWithChange(ideaId, fieldName, value);
      setTimeout(() => {
         router.refresh();
      }, 1200);
      return result;
   };

  return (
    <div className="space-y-8">
      {/* 1. Header & Big Score */}
      <div className="grid gap-6 md:grid-cols-2">
         {/* Introduction */}
         <div className="space-y-4">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Mission Control
             </h2>
             <p className="text-lg text-slate-600 leading-relaxed">
                {overall_assessment.summary}
             </p>
         </div>

         {/* Hero Score Card */}
         <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-2xl shadow-slate-900/10 sm:p-8">
            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full space-y-2">
                 <div className="text-xs font-bold uppercase tracking-widest opacity-50">Forge Score</div>
                 <div className="text-6xl font-black tracking-tighter sm:text-7xl">
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
       <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
           <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-4">
               <span>Lifecycle Status</span>
               <span>Stage 2 of 5</span>
           </div>
           
          <div className="relative overflow-x-auto pb-2">
                {/* Connecting Line */}
             <div className="absolute top-1/2 left-0 hidden h-1 min-w-130 -translate-y-1/2 rounded-full bg-slate-100 sm:block sm:w-full" />
                
                {/* Steps */}
             <div className="relative z-10 flex min-w-130 justify-between sm:min-w-0 sm:w-full">
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

         <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-6">
            <div>
               <h3 className="text-lg font-bold text-slate-900">Quick Re-Evaluation</h3>
               <p className="mt-1 text-sm text-slate-500">
                  Edit one field and run a fresh evaluation in one step.
               </p>
            </div>

            <div className="grid gap-4">
               <InlineEditField
                  label="Core Idea"
                  value={idea.idea}
                  onReEvaluate={(value) => handleReEvaluate("idea", value)}
               />
               <InlineEditField
                  label="Target User"
                  value={idea.targetUser}
                  onReEvaluate={(value) => handleReEvaluate("targetUser", value)}
               />
               <InlineEditField
                  label="Problem"
                  value={idea.problem}
                  onReEvaluate={(value) => handleReEvaluate("problem", value)}
               />
               <InlineEditField
                  label="Alternatives"
                  value={idea.alternatives}
                  onReEvaluate={(value) => handleReEvaluate("alternatives", value)}
               />
               <InlineEditField
                  label="Timing"
                  value={idea.timing}
                  onReEvaluate={(value) => handleReEvaluate("timing", value)}
               />
               <InlineEditField
                  label="Founder Fit"
                  value={idea.founderFit}
                  onReEvaluate={(value) => handleReEvaluate("founderFit", value)}
               />
            </div>
         </div>

         {competitorProfiles.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
               <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">Competitor Profiles</h3>
                  <button
                     onClick={() => moveToTab("evaluation")}
                     className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                     See deep analysis
                  </button>
               </div>

               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {competitorProfiles.slice(0, 6).map((competitor, index) => (
                     <div
                        key={`${competitor.name}-${index}`}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                     >
                        <div className="mb-2 flex items-start justify-between gap-2">
                           <p className="font-semibold text-slate-900">{competitor.name}</p>
                           <span
                              className={cn(
                                 "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                 competitor.threatLevel === "high"
                                    ? "bg-rose-100 text-rose-700"
                                    : competitor.threatLevel === "medium"
                                       ? "bg-amber-100 text-amber-700"
                                       : "bg-emerald-100 text-emerald-700"
                              )}
                           >
                              {competitor.threatLevel}
                           </span>
                        </div>

                        <p className="text-xs text-slate-500">{competitor.stage} • {competitor.estimatedSize}</p>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{competitor.description}</p>

                        <div className="mt-3 space-y-1">
                           <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">How You Differ</p>
                           <p className="text-xs text-slate-700 line-clamp-3">{competitor.howYouDiffer}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
    </div>
  );
}
