"use client";

import { useEffect, useState } from "react";
import { 
  LayoutGrid, 
  Activity, 
  ShieldAlert, 
  Box,
  Bot,
  FlaskConical,
  GitBranch,
  ChevronRight,
  ArrowLeft,
  Menu,
  X,
  LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CompetitorProfile, CompleteEvaluation, IdeaDocument, IdeaVersion, StoredEvaluation, StoredMVPPlan, StoredFeatureSimulation } from "@/lib/ai/types";
import Link from "next/link";

// Tab Components
import { OverviewTab } from "./tabs/OverviewTab";
import { AssistantTab } from "./tabs/AssistantTab";
import { EvaluationTab } from "./tabs/EvaluationTab";
import { RisksTab } from "./tabs/RisksTab";
import { MVPTab } from "./tabs/MVPTab";
import { FeatureLabTab } from "./tabs/FeatureLabTab";
import { EvolutionTab } from "./tabs/EvolutionTab";
import { Skeleton, SkeletonText } from "./Skeletons";
import { useBreakpoints } from "@/lib/hooks/use-breakpoints";

interface Props {
  idea: IdeaDocument;
  evaluation: CompleteEvaluation;
  competitorProfiles: CompetitorProfile[];
  versions: IdeaVersion[];
  currentVersion: IdeaVersion | null;
  versionEvaluations: StoredEvaluation[];
  mvpPlan: StoredMVPPlan | null;
  featureSimulations: StoredFeatureSimulation[];
  isFirstRunEvaluation?: boolean;
}

export type TabId = 'overview' | 'assistant' | 'evaluation' | 'risks' | 'mvp' | 'feature-lab' | 'evolution';

export function IdeaWorkspace({ idea, evaluation, competitorProfiles, versions, currentVersion, versionEvaluations, mvpPlan: initialMVPPlan, featureSimulations: initialSimulations, isFirstRunEvaluation = false }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [mvpPlan, setMvpPlan] = useState<StoredMVPPlan | null>(initialMVPPlan);
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isMobile } = useBreakpoints();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const versionNumber = currentVersion?.versionNumber ?? 1;

  const menuItems: { id: TabId; label: string; icon: LucideIcon; ready: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid, ready: true },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, ready: true },
    { id: 'evaluation', label: 'Deep Analysis', icon: Activity, ready: true },
    { id: 'risks', label: 'Risk Profile', icon: ShieldAlert, ready: true },
    { id: 'mvp', label: 'MVP Plan', icon: Box, ready: true },
    { id: 'feature-lab', label: 'Feature Lab', icon: FlaskConical, ready: true },
    { id: 'evolution', label: 'Evolution', icon: GitBranch, ready: true },
  ];

  const content = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            ideaId={idea.$id}
            ideaTitle={idea.title}
            versionNumber={versionNumber}
            idea={{
              idea: idea.idea,
              targetUser: idea.targetUser,
              problem: idea.problem,
              alternatives: idea.alternatives,
              timing: idea.timing,
              founderFit: idea.founderFit,
              stage: idea.stage,
            }}
            evaluation={evaluation}
            competitorProfiles={competitorProfiles}
            mvpPlan={mvpPlan}
            featureSimulations={initialSimulations}
            moveToTab={setActiveTab}
          />
        )}
        {activeTab === 'assistant' && (
          <AssistantTab
            ideaId={idea.$id}
            ideaVersionId={currentVersion?.$id ?? null}
            ideaTitle={idea.title}
            evaluation={evaluation}
          />
        )}
        {activeTab === 'evaluation' && (
          <EvaluationTab
            data={evaluation.score_breakdown}
            raw_reports={evaluation.raw_reports}
            isFirstRun={isFirstRunEvaluation}
          />
        )}
        {activeTab === 'risks' && <RisksTab risks={evaluation.risk_profile} />}

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

        {activeTab === 'evolution' && (
          <EvolutionTab
            versions={versions}
            evaluations={versionEvaluations}
            currentVersionId={currentVersion?.$id ?? null}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {isMobile ? (
        <>
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
              >
                <ArrowLeft className="h-3 w-3" />
                All ideas
              </Link>
              <button
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
                aria-label="Open workspace navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 pb-3">
              <h1 className="truncate text-base font-bold text-slate-900" title={idea.title}>
                {idea.title}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {idea.stage}
                </span>
                <span className="font-mono text-xs text-slate-400">v{versionNumber}.0</span>
              </div>
            </div>
          </header>

          <AnimatePresence>
            {mobileNavOpen && (
              <>
                <motion.div
                  className="fixed inset-0 z-40 bg-slate-900/35"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileNavOpen(false)}
                />
                <motion.aside
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-y-0 right-0 z-50 w-80 max-w-[88vw] border-l border-slate-200 bg-white p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">Navigation</h2>
                    <button
                      onClick={() => setMobileNavOpen(false)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500"
                      aria-label="Close workspace navigation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <nav className="space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!item.ready) return;
                          setActiveTab(item.id);
                          setMobileNavOpen(false);
                        }}
                        disabled={!item.ready}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          activeTab === item.id
                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                            : item.ready
                              ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              : "cursor-not-allowed text-slate-300"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            activeTab === item.id ? "text-slate-300" : item.ready ? "text-slate-400 group-hover:text-slate-600" : "text-slate-200"
                          )}
                        />
                        <span className="flex-1 text-left">{item.label}</span>
                        {!item.ready && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">Soon</span>
                        )}
                        {activeTab === item.id && (
                          <ChevronRight className="ml-auto h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    ))}
                  </nav>

                  <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    {isHydrated ? (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-500">Forge Score</span>
                          <span
                            className={cn(
                              "text-lg font-bold",
                              evaluation.overall_assessment.total_score >= 70
                                ? "text-emerald-600"
                                : evaluation.overall_assessment.total_score >= 50
                                  ? "text-amber-600"
                                  : "text-rose-600"
                            )}
                          >
                            {evaluation.overall_assessment.total_score}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-500">Verdict</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-bold uppercase",
                              evaluation.overall_assessment.verdict === "GO"
                                ? "bg-emerald-100 text-emerald-700"
                                : evaluation.overall_assessment.verdict === "REFINE"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                            )}
                          >
                            {evaluation.overall_assessment.verdict}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-500">Versions</span>
                          <span className="font-medium text-slate-700">{versions.length}</span>
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
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main className="px-4 py-6">
            {content}
          </main>
        </>
      ) : (
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 bg-white/50 backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-100 p-6">
                <Link
                  href="/dashboard"
                  className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
                >
                  <ArrowLeft className="h-3 w-3" />
                  All ideas
                </Link>
                <h1 className="truncate font-bold text-slate-900" title={idea.title}>
                  {idea.title}
                </h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {idea.stage}
                  </span>
                  <span className="font-mono text-xs text-slate-400">v{versionNumber}.0</span>
                </div>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
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
                          : "cursor-not-allowed text-slate-300"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        activeTab === item.id ? "text-slate-300" : item.ready ? "text-slate-400 group-hover:text-slate-600" : "text-slate-200"
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {!item.ready && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">Soon</span>
                    )}
                    {activeTab === item.id && (
                      <motion.div layoutId="active-indicator" className="ml-auto">
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </nav>

              <div className="space-y-3 border-t border-slate-100 p-4">
                {isHydrated ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">Forge Score</span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          evaluation.overall_assessment.total_score >= 70 ? "text-emerald-600" :
                          evaluation.overall_assessment.total_score >= 50 ? "text-amber-600" :
                          "text-rose-600"
                        )}
                      >
                        {evaluation.overall_assessment.total_score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">Verdict</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-bold uppercase",
                          evaluation.overall_assessment.verdict === "GO" ? "bg-emerald-100 text-emerald-700" :
                          evaluation.overall_assessment.verdict === "REFINE" ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        )}
                      >
                        {evaluation.overall_assessment.verdict}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">Versions</span>
                      <span className="font-medium text-slate-700">{versions.length}</span>
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

          <main className="flex-1 pl-64">
            <div className="mx-auto max-w-5xl p-8 lg:p-12">
              {content}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
