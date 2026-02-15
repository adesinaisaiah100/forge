"use client";

import { RawAggregatorOutput } from "@/lib/ai/schemas";
import { RiskMatrix } from "@/app/dashboard/components/RiskMatrix"; 
// ^ Reusing the existing RiskMatrix component but placing it in the new layout structure.
// The user liked the RiskMatrix but wanted it in its own tab.

interface Props {
  risks: RawAggregatorOutput["risk_profile"];
}

export function RisksTab({ risks }: Props) {
  // Calculate max risk
  const riskLevels = { critical: 4, high: 3, medium: 2, low: 1 };
  const getLevelValue = (level: string) => riskLevels[level as keyof typeof riskLevels] || 0;

  const allRisks = [risks.market_risk, risks.execution_risk, risks.timing_risk, risks.technical_risk];
  const maxRisk = allRisks.reduce((prev, current) => (getLevelValue(current.level) > getLevelValue(prev.level) ? current : prev));

  return (
    <div className="space-y-8">
       <div>
            <h2 className="text-2xl font-bold text-slate-900">Risk Profile</h2>
            <p className="text-slate-500">Emotional and structural vulnerabilities.</p>
       </div>

       {/* Top: Overall Assessment */}
       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Highest Thread</h3>
            <div className="flex items-start gap-4">
                 <div className="flex-1">
                     <p className="text-lg font-medium text-slate-900">
                        The most critical risk is <span className="font-bold underline decoration-rose-300 decoration-2 underline-offset-2 capitalize">{maxRisk.level} {maxRisk === risks.market_risk ? "Market" : maxRisk === risks.execution_risk ? "Execution" : maxRisk === risks.timing_risk ? "Timing" : "Technical"} Risk</span>.
                     </p>
                     <p className="mt-2 text-slate-600">
                        {maxRisk.reason}
                     </p>
                 </div>
            </div>
       </div>

       {/* Matrix */}
       <RiskMatrix risks={risks} />

       {/* De-Risking Section Placeholder */}
       <div className="rounded-2xl bg-slate-100 p-8 text-center border border-dashed border-slate-300">
            <h3 className="font-bold text-slate-900">De-Risking Strategy Generator</h3>
            <p className="text-sm text-slate-500 mt-1">AI agent not connected for deep risk mitigation plan yet.</p>
       </div>
    </div>
  );
}
