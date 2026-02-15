"use client";

import { useEffect, useState } from "react";
import { 
  LayoutGrid, 
  Activity, 
  ShieldAlert, 
  Box,
  FlaskConical,
  GitBranch,
  ChevronRight,
  ArrowLeft,
  LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CompleteEvaluation, IdeaDocument, IdeaVersion, StoredMVPPlan, StoredFeatureSimulation } from "@/lib/ai/types";
import Link from "next/link";

// Tab Components
import { OverviewTab } from "./tabs/OverviewTab";
import { EvaluationTab } from "./tabs/EvaluationTab";
import { RisksTab } from "./tabs/RisksTab";
import { MVPTab } from "./tabs/MVPTab";
import { FeatureLabTab } from "./tabs/FeatureLabTab";
import { Skeleton, SkeletonText } from "./Skeletons";

interface Props {
  idea: IdeaDocument;
  evaluation: CompleteEvaluation;
  versions: IdeaVersion[];
  currentVersion: IdeaVersion | null;
  mvpPlan: StoredMVPPlan | null;
  featureSimulations: StoredFeatureSimulation[];
  isFirstRunEvaluation?: boolean;
}

export type TabId = 'overview' | 'evaluation' | 'risks' | 'mvp' | 'feature-lab' | 'evolution';

export function IdeaWorkspace({ idea, evaluation, versions, currentVersion, mvpPlan: initialMVPPlan, featureSimulations: initialSimulations, isFirstRunEvaluation = false }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [mvpPlan, setMvpPlan] = useState<StoredMVPPlan | null>(initialMVPPlan);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const versionNumber = currentVersion?.versionNumber ?? 1;

  const menuItems: { id: TabId; label: string; icon: LucideIcon; ready: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid, ready: true },
    { id: 'evaluation', label: 'Deep Analysis', icon: Activity, ready: true },
    { id: 'risks', label: 'Risk Profile', icon: ShieldAlert, ready: true },
    { id: 'mvp', label: 'MVP Plan', icon: Box, ready: true },
    { id: 'feature-lab', label: 'Feature Lab', icon: FlaskConical, ready: true },
    { id: 'evolution', label: 'Evolution', icon: GitBranch, ready: false },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 bg-white/50 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
             <Link 
               href="/dashboard"
               className="flex items-center gap-1.5 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors mb-3"
             >
                <ArrowLeft className="h-3 w-3" />
                All ideas
             </Link>
             <h1 className="font-bold text-slate-900 truncate" title={idea.title}>
                {idea.title}
             </h1>
             <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {idea.stage}
                </span>
                <span className="text-xs text-slate-400 font-mono">v{versionNumber}.0</span>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => item.ready ? setActiveTab(item.id) : undefined}
                disabled={!item.ready}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                    : item.ready 
                      ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      : "text-slate-300 cursor-not-allowed"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4", 
                  activeTab === item.id ? "text-slate-300" : item.ready ? "text-slate-400 group-hover:text-slate-600" : "text-slate-200"
                )} />
                <span className="flex-1 text-left">{item.label}</span>
                {!item.ready && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded">Soon</span>
                )}
                {activeTab === item.id && (
                    <motion.div layoutId="active-indicator" className="ml-auto">
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                    </motion.div>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom — Score Summary */}
          <div className="p-4 border-t border-slate-100 space-y-3">
             {isHydrated ? (
               <>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Forge Score</span>
                    <span className={cn(
                      "font-bold text-lg",
                      evaluation.overall_assessment.total_score >= 70 ? "text-emerald-600" :
                      evaluation.overall_assessment.total_score >= 50 ? "text-amber-600" :
                      "text-rose-600"
                    )}>
                      {evaluation.overall_assessment.total_score}
                    </span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Verdict</span>
                    <span className={cn(
                      "font-bold uppercase text-xs px-2 py-0.5 rounded-full",
                      evaluation.overall_assessment.verdict === "GO" ? "bg-emerald-100 text-emerald-700" :
                      evaluation.overall_assessment.verdict === "REFINE" ? "bg-amber-100 text-amber-700" :
                      "bg-rose-100 text-rose-700"
                    )}>
                      {evaluation.overall_assessment.verdict}
                    </span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Versions</span>
                    <span className="text-slate-700 font-medium">{versions.length}</span>
                 </div>
               </>
             ) : (
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <SkeletonText className="h-3 w-16" />
                   <Skeleton className="h-6 w-10" />
                 </div>
                 <div className="flex items-center justify-between">
                   <SkeletonText className="h-3 w-14" />
                   <Skeleton className="h-5 w-16 rounded-full" />
                 </div>
                 <div className="flex items-center justify-between">
                   <SkeletonText className="h-3 w-12" />
                   <Skeleton className="h-4 w-6" />
                 </div>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="flex-1 pl-64">
        <div className="mx-auto max-w-5xl p-8 lg:p-12">
           <AnimatePresence mode="wait">
             <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
             >
                {activeTab === 'overview' && <OverviewTab evaluation={evaluation} moveToTab={setActiveTab} />}
                {activeTab === 'evaluation' && (
                  <EvaluationTab
                    data={evaluation.score_breakdown}
                    raw_reports={evaluation.raw_reports}
                    isFirstRun={isFirstRunEvaluation}
                  />
                )}
                {activeTab === 'risks' && <RisksTab risks={evaluation.risk_profile} />}
                
                {/* Phase 2: MVP Plan */}
                {activeTab === 'mvp' && (
                    <MVPTab
                      mvpPlan={mvpPlan}
                      ideaVersionId={currentVersion?.$id ?? null}
                      onGenerate={async () => {
                        const { createMVPPlan } = await import("@/app/actions/mvp");
                        const plan = await createMVPPlan(
                          currentVersion!.$id,
                          idea.idea,
                          idea.targetUser,
                          idea.problem
                        );
                        setMvpPlan(plan);
                      }}
                    />
                )}

                {/* Phase 3: Feature Lab */}
                {activeTab === 'feature-lab' && (
                    <FeatureLabTab
                      simulations={initialSimulations}
                      ideaVersionId={currentVersion?.$id ?? null}
                      onSimulate={async (proposedFeature) => {
                        const { simulateFeature } = await import("@/app/actions/features");
                        return simulateFeature(
                          currentVersion!.$id,
                          idea.idea,
                          idea.targetUser,
                          idea.problem,
                          proposedFeature
                        );
                      }}
                    />
                )}

                {/* Phase 4: Evolution */}
                {activeTab === 'evolution' && (
                    <PlaceholderTab
                      title="Evolution Timeline"
                      description="Visualize your idea's evolution across versions. Track score deltas and strategic pivots."
                      phase="Phase 4"
                    />
                )}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ── Placeholder for unreleased tabs ──
function PlaceholderTab({ title, description, phase }: { title: string; description: string; phase: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <div className="rounded-full bg-white p-4 shadow-sm">
        <Box className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-slate-900">{title}</h3>
      <p className="max-w-md mt-2 text-sm text-slate-500">{description}</p>
      <span className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {phase}
      </span>
    </div>
  );
}
