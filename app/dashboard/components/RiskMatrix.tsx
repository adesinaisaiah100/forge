"use client";

import { AlertTriangle, CheckCircle, ShieldAlert, TrendingUp, AlertOctagon } from "lucide-react";
import clsx from "clsx";
import { RawAggregatorOutput } from "@/lib/ai/schemas";
import { motion } from "framer-motion";

interface Props {
  risks: RawAggregatorOutput["risk_profile"];
}

export function RiskMatrix({ risks }: Props) {
  const getRiskStyles = (level: string) => {
    switch (level) {
      case "low":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-900",
          iconColor: "text-emerald-600",
          badge: "bg-emerald-100 text-emerald-700"
        };
      case "medium":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-900",
          iconColor: "text-amber-600",
          badge: "bg-amber-100 text-amber-700"
        };
      case "high":
        return {
          bg: "bg-orange-50",
          border: "border-orange-100",
          text: "text-orange-900",
          iconColor: "text-orange-600",
          badge: "bg-orange-100 text-orange-700"
        };
      case "critical":
        return {
          bg: "bg-rose-50",
          border: "border-rose-100",
          text: "text-rose-900",
          iconColor: "text-rose-600",
          badge: "bg-rose-100 text-rose-700"
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-100",
          text: "text-slate-900",
          iconColor: "text-slate-600",
          badge: "bg-slate-100 text-slate-700"
        };
    }
  };

  const getIcon = (key: string) => {
    switch (key) {
      case "market_risk": return <TrendingUp className="h-5 w-5" />;
      case "execution_risk": return <AlertOctagon className="h-5 w-5" />;
      case "timing_risk": return <CheckCircle className="h-5 w-5" />;
      case "technical_risk": return <ShieldAlert className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const riskBlocks = [
    { key: "market_risk", label: "Market Risk", data: risks.market_risk },
    { key: "execution_risk", label: "Execution Risk", data: risks.execution_risk },
    { key: "timing_risk", label: "Timing Risk", data: risks.timing_risk },
    { key: "technical_risk", label: "Technical Risk", data: risks.technical_risk },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {riskBlocks.map((block, i) => {
        const styles = getRiskStyles(block.data.level);
        return (
          <motion.div
            key={block.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className={clsx(
              "relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-sm transition-hover hover:shadow-md",
              styles.bg,
              styles.border
            )}
          >
            <div className="flex items-start justify-between mb-4">
                <div className={clsx("rounded-lg p-2 bg-white/60 shadow-sm", styles.iconColor)}>
                    {getIcon(block.key)}
                </div>
                <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider", styles.badge)}>
                    {block.data.level}
                </span>
            </div>
            
            <div>
                 <h4 className={clsx("font-bold", styles.text)}>{block.label}</h4>
                 <p className={clsx("mt-1 text-sm opacity-90", styles.text)}>
                     {block.data.reason}
                 </p>
            </div>
            
            <div className={clsx("absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-10 blur-2xl", styles.iconColor.replace('text-', 'bg-'))} />
          </motion.div>
        );
      })}
    </div>
  );
}
