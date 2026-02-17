import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getIdeasForComparison } from "@/app/actions/ideas";
import { ComparisonRadarChart } from "../components/ComparisonRadarChart";
import { cn } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

const dimensionRows: Array<{ key: string; label: string }> = [
  { key: "problem_strength", label: "Problem Strength" },
  { key: "market_opportunity", label: "Market Opportunity" },
  { key: "differentiation_strength", label: "Differentiation" },
  { key: "timing_readiness", label: "Timing Readiness" },
  { key: "founder_leverage", label: "Founder Leverage" },
  { key: "execution_feasibility", label: "Execution Feasibility" },
];

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

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Compare Ideas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Side-by-side evaluation to decide what to build next.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {compared.map((idea) => (
              <div key={idea.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{idea.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Score</span>
                  <span className="text-lg font-bold text-slate-900">{idea.totalScore}</span>
                </div>
                <span
                  className={cn(
                    "mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                    idea.verdict === "GO"
                      ? "bg-emerald-100 text-emerald-700"
                      : idea.verdict === "REFINE"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  )}
                >
                  {idea.verdict}
                </span>
                <p className="mt-1 text-[11px] text-slate-500">{idea.stage}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Radar Overlay</h2>
          <ComparisonRadarChart
            ideas={compared.map((idea) => ({
              id: idea.id,
              title: idea.title,
              scoreBreakdown: idea.scoreBreakdown,
            }))}
          />
        </section>

        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dimension
                </th>
                {compared.map((idea) => (
                  <th key={idea.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {idea.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dimensionRows.map((row) => (
                <tr key={row.key}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{row.label}</td>
                  {compared.map((idea) => {
                    const score = idea.scoreBreakdown[row.key as keyof typeof idea.scoreBreakdown].score;
                    return (
                      <td key={`${idea.id}-${row.key}`} className="px-4 py-3 text-sm text-slate-700">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span>{score}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100">
                            <div className="h-1.5 rounded-full bg-slate-900" style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr>
                <td className="px-4 py-3 text-sm font-medium text-slate-700">Top Risk</td>
                {compared.map((idea) => {
                  const riskOrder: Array<keyof typeof idea.riskProfile> = [
                    "market_risk",
                    "execution_risk",
                    "timing_risk",
                    "technical_risk",
                  ];

                  const topRisk = [...riskOrder]
                    .sort((a, b) => idea.riskProfile[b].score - idea.riskProfile[a].score)[0];

                  return (
                    <td key={`${idea.id}-risk`} className="px-4 py-3 text-sm text-slate-700">
                      {topRisk.replace(/_/g, " ")} ({idea.riskProfile[topRisk].level})
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="px-4 py-3 text-sm font-medium text-slate-700">Summary</td>
                {compared.map((idea) => (
                  <td key={`${idea.id}-summary`} className="px-4 py-3 text-sm text-slate-600">
                    <p className="line-clamp-4 max-w-sm">{idea.executiveSummary}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
