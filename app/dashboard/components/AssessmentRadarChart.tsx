"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  PolarRadiusAxis
} from "recharts";
import { RawAggregatorOutput } from "@/lib/ai/schemas";

type DimensionKey = keyof RawAggregatorOutput["score_breakdown"];

interface Props {
  data: RawAggregatorOutput["score_breakdown"];
  onDimensionSelect?: (key: DimensionKey) => void;
  selectedDimension?: DimensionKey | null;
}

export function AssessmentRadarChart({ data, onDimensionSelect, selectedDimension }: Props) {
  // Transform structured breakdown into chart-friendly array
  // We keep the keys in the data to easily map back on click
  const chartData = [
    { subject: "Problem", key: "problem_strength", A: data.problem_strength.score, fullMark: 100 },
    { subject: "Market", key: "market_opportunity", A: data.market_opportunity.score, fullMark: 100 },
    { subject: "Diff.", key: "differentiation_strength", A: data.differentiation_strength.score, fullMark: 100 },
    { subject: "Timing", key: "timing_readiness", A: data.timing_readiness.score, fullMark: 100 },
    { subject: "Founder", key: "founder_leverage", A: data.founder_leverage.score, fullMark: 100 },
    { subject: "Execution", key: "execution_feasibility", A: data.execution_feasibility.score, fullMark: 100 },
  ];

  /* 
    Enhanced Custom Tick to allow interaction 
  */
  function CustomTick({ payload, x, y, textAnchor }: { payload: { value: string }; x: number | string; y: number | string; textAnchor: string }) {
    const item = chartData.find(d => d.subject === payload.value);
    const isSelected = selectedDimension === item?.key;

    return (
      <g 
        className="cursor-pointer transition-all hover:opacity-80" 
        onClick={() => item && onDimensionSelect?.(item.key as DimensionKey)}
      >
        <text
          x={x}
          y={y}
          textAnchor={textAnchor as "start" | "middle" | "end" | "inherit"}
          fill={isSelected ? "#0f172a" : "#64748b"}
          fontWeight={isSelected ? 700 : 500}
          fontSize={12}
        >
          {payload.value}
        </text>
      </g>
    );
  }

  return (
    <div className="h-full w-full min-h-62.5">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={CustomTick}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#0f172a"
            strokeWidth={2}
            fill="#0f172a"
            fillOpacity={0.1}
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
