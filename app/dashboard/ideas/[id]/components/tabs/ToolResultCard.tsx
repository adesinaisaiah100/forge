"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Hammer } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  part: {
    type: string;
    state?: string;
    input?: unknown;
    output?: unknown;
  };
}

function prettyToolName(type: string): string {
  return type.replace("tool-", "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ToolResultCard({ part }: Props) {
  const [open, setOpen] = useState(false);

  const title = useMemo(() => prettyToolName(part.type), [part.type]);
  const isLoading = part.state === "input-available";
  const isDone = part.state === "output-available";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Hammer className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">{title}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              isLoading
                ? "bg-amber-100 text-amber-700"
                : isDone
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
            )}
          >
            {isLoading ? "Running" : isDone ? "Complete" : "Pending"}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="space-y-2 border-t border-slate-200 px-3 py-3 text-xs text-slate-600">
          {part.input != null && (
            <div>
              <p className="mb-1 font-semibold text-slate-700">Input</p>
              <pre className="overflow-x-auto rounded-md bg-white p-2">{JSON.stringify(part.input, null, 2)}</pre>
            </div>
          )}

          {part.output != null && (
            <div>
              <p className="mb-1 font-semibold text-slate-700">Output</p>
              <pre className="overflow-x-auto rounded-md bg-white p-2">{JSON.stringify(part.output, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
