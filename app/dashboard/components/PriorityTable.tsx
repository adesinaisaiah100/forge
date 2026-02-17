import { CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityTableItem {
  id: string;
  title: string;
  stage: string;
  totalScore: number;
  feasibilityScore: number;
  marketScore: number;
  differentiationScore: number;
  problemScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
}

interface PriorityTableProps {
  items: PriorityTableItem[];
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-700 bg-emerald-50 ring-emerald-600/20";
  if (score >= 60) return "text-blue-700 bg-blue-50 ring-blue-600/20";
  if (score >= 40) return "text-amber-700 bg-amber-50 ring-amber-600/20";
  return "text-rose-700 bg-rose-50 ring-rose-600/20";
}

function RiskBadge({ level }: { level: string }) {
  const styles = {
    low: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    medium: "bg-amber-50 text-amber-700 ring-amber-600/10",
    high: "bg-orange-50 text-orange-700 ring-orange-600/10",
    critical: "bg-rose-50 text-rose-700 ring-rose-600/10",
  };
  
  const labels = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    critical: "Critical Risk",
  };

  const safeLevel = (level as keyof typeof styles) || "medium";

  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", styles[safeLevel])}>
      {labels[safeLevel]}
    </span>
  );
}

export function PriorityTable({ items }: PriorityTableProps) {
  // Sort by customized weighted priority for "What to build first"
  // 1. Feasibility (Can I build it?) - 35%
  // 2. Problem Strength (Do people want it?) - 30%
  // 3. Market (Is it big enough?) - 20%
  // 4. Differentiation (Is it unique?) - 15%
  const sortedItems = [...items].map(item => ({
    ...item,
    priorityScore: (
      (item.feasibilityScore * 0.35) +
      (item.problemScore * 0.30) +
      (item.marketScore * 0.20) +
      (item.differentiationScore * 0.15)
    )
  })).sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold leading-7 text-slate-900">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Priority Matrix
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Ranked by Speed, Demand, & Feasibility. Top item is your best bet to start now.
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50/50">
              <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Idea</th>
              <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Priority Score</th>
              <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Feasibility (Speed)</th>
              <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Problem (Demand)</th>
              <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Market Potential</th>
              <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Differentiation</th>
              <th scope="col" className="py-3.5 pl-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {sortedItems.map((item, index) => (
              <tr key={item.id} className={cn("hover:bg-slate-50/50 transition-colors", index === 0 ? "bg-indigo-50/30" : "")}>
                <td className="whitespace-nowrap py-4 pl-6 pr-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{item.title}</span>
                    <span className="text-xs text-slate-400 capitalize">{item.stage} Stage</span>
                    {index === 0 && (
                      <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                        <CheckCircle2 className="h-3 w-3" />
                        RECOMMENDED START
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-indigo-600">{Math.round(item.priorityScore)}</span>
                    <span className="text-[10px] text-slate-400">weighted avg</span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-sm font-bold ring-1 ring-inset", getScoreColor(item.feasibilityScore))}>
                    {item.feasibilityScore}
                  </span>
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-sm font-bold ring-1 ring-inset", getScoreColor(item.problemScore))}>
                    {item.problemScore}
                  </span>
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-sm font-bold ring-1 ring-inset", getScoreColor(item.marketScore))}>
                    {item.marketScore}
                  </span>
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-sm font-bold ring-1 ring-inset", getScoreColor(item.differentiationScore))}>
                    {item.differentiationScore}
                  </span>
                </td>

                <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                  <RiskBadge level={item.riskLevel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
