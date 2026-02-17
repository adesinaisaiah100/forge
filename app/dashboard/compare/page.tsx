import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getIdeasForComparison } from "@/app/actions/ideas";
import { PriorityTable } from "../components/PriorityTable";

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export default async function CompareIdeasPage({ searchParams }: Props) {
  const { ids } = await searchParams;
  const selectedIds = ids
    ? ids
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (selectedIds.length < 2) {
    notFound();
  }

  const items = await getIdeasForComparison(selectedIds);

  const readyItems = items.filter(
    (entry) => entry.currentVersion !== null && entry.evaluation !== null
  );

  if (readyItems.length < 2) {
    notFound();
  }

  const compared = readyItems.map((entry) => ({
    id: entry.idea.$id,
    title: entry.idea.title,
    stage: entry.idea.stage,
    totalScore: entry.evaluation!.totalScore,
    verdict: entry.evaluation!.verdict,
    scoreBreakdown: entry.evaluation!.scoreBreakdown,
    riskProfile: entry.evaluation!.riskProfile,
    executiveSummary: entry.evaluation!.executiveSummary,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Idea Comparison
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compare & Prioritize</h1>
          <p className="text-base text-slate-500">
            Use this matrix to decide what to build first based on feasibility, market demand, and your unique advantage.
          </p>
        </div>

        <PriorityTable
          items={compared.map((idea) => ({
            id: idea.id,
            title: idea.title,
            stage: idea.stage,
            totalScore: idea.totalScore,
            feasibilityScore: idea.scoreBreakdown.execution_feasibility?.score || 0,
            marketScore: idea.scoreBreakdown.market_opportunity?.score || 0,
            differentiationScore: idea.scoreBreakdown.differentiation_strength?.score || 0,
            problemScore: idea.scoreBreakdown.problem_strength?.score || 0,
            riskLevel: idea.riskProfile.execution_risk?.level || "medium",
          }))}
        />
      </main>
    </div>
  );
}
