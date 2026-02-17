import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicReport } from "@/app/actions/share";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  const report = await getPublicReport(shareId);

  if (!report) {
    return {
      title: "Forge Report",
      description: "Public Forge startup idea report",
    };
  }

  const title = `Forge Evaluation: ${report.title}`;
  const description = `Score ${report.totalScore}/100 • ${report.verdict} — ${report.executiveSummary}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicReportPage({ params }: Props) {
  const { shareId } = await params;
  const report = await getPublicReport(shareId);

  if (!report) {
    notFound();
  }

  const scoreBreakdown = report.scoreBreakdown as Record<
    string,
    { score: number; insight: string }
  >;
  const riskProfile = report.riskProfile as Record<
    string,
    { level: string; reason: string }
  >;

  const dimensionRows = Object.entries(scoreBreakdown).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, " "),
    score: value.score,
    insight: value.insight,
  }));

  const riskRows = Object.entries(riskProfile).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, " "),
    level: value.level,
    reason: value.reason,
  }));

  return (
    <div className="min-h-screen bg-slate-50/60">
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Forge Evaluation</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{report.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{report.stage} • {new Date(report.createdAt).toLocaleDateString()}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Forge Score</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{report.totalScore}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Verdict</p>
              <span
                className={cn(
                  "mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase",
                  report.verdict === "GO"
                    ? "bg-emerald-100 text-emerald-700"
                    : report.verdict === "REFINE"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {report.verdict}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Share ID</p>
              <p className="mt-1 font-mono text-sm text-slate-700">{report.shareId}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-700">{report.executiveSummary}</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Score Breakdown</h2>
          <div className="mt-4 space-y-3">
            {dimensionRows.map((row) => (
              <div key={row.key} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold capitalize text-slate-800">{row.label}</p>
                  <p className="text-sm font-bold text-slate-900">{row.score}</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-slate-900" style={{ width: `${Math.max(0, Math.min(100, row.score))}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{row.insight}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Risk Profile</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {riskRows.map((risk) => (
              <div key={risk.key} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold capitalize text-slate-800">{risk.label}</p>
                  <span className="text-[11px] font-bold uppercase text-slate-500">{risk.level}</span>
                </div>
                <p className="text-xs text-slate-600">{risk.reason}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recommended Next Steps</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {report.recommendedNextSteps.slice(0, 5).map((step: string, index: number) => (
              <li key={`step-${index}`}>{step}</li>
            ))}
          </ul>
        </section>

        <footer className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-700">Evaluated with Forge</p>
          <p className="mt-1 text-xs text-slate-500">Have an idea? Validate and evolve it with AI.</p>
          <Link href="/" className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
            Try Forge
          </Link>
        </footer>
      </main>
    </div>
  );
}
