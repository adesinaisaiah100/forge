"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type ScoreBreakdown = {
  problem_strength: { score: number };
  market_opportunity: { score: number };
  differentiation_strength: { score: number };
  timing_readiness: { score: number };
  founder_leverage: { score: number };
  execution_feasibility: { score: number };
};

interface ComparisonItem {
  id: string;
  title: string;
  scoreBreakdown: ScoreBreakdown;
}

interface Props {
  ideas: ComparisonItem[];
}

const colors = ["#0f172a", "#2563eb", "#059669", "#dc2626"];

export function ComparisonRadarChart({ ideas }: Props) {
  const chartData = [
    { subject: "Problem" },
    { subject: "Market" },
    { subject: "Diff." },
    { subject: "Timing" },
    { subject: "Founder" },
    { subject: "Execution" },
  ].map((row) => {
    const values: Record<string, string | number> = { subject: row.subject };

    ideas.forEach((idea, index) => {
      const breakdown = idea.scoreBreakdown;
      const score =
        row.subject === "Problem"
          ? breakdown.problem_strength.score
          : row.subject === "Market"
          ? breakdown.market_opportunity.score
          : row.subject === "Diff."
          ? breakdown.differentiation_strength.score
          : row.subject === "Timing"
          ? breakdown.timing_readiness.score
          : row.subject === "Founder"
          ? breakdown.founder_leverage.score
          : breakdown.execution_feasibility.score;

      values[`idea-${index}`] = score;
    });

    return values;
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />

          {ideas.map((idea, index) => (
            <Radar
              key={idea.id}
              name={idea.title}
              dataKey={`idea-${index}`}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.08}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
