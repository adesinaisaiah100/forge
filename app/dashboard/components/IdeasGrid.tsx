"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, GitCompare } from "lucide-react";
import type { IdeaDocument } from "@/lib/ai/types";

interface Props {
  ideas: IdeaDocument[];
}

export function IdeasGrid({ ideas }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const compareUrl = useMemo(() => {
    if (selected.length < 2) return "";
    return `/dashboard/compare?ids=${selected.join(",")}`;
  }, [selected]);

  const toggleSelection = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, id];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">Your Ideas</h2>
        <span className="text-sm text-slate-500">{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => {
          const isSelected = selected.includes(idea.$id);

          return (
            <div
              key={idea.$id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {idea.stage}
                </span>
                <button
                  type="button"
                  onClick={() => toggleSelection(idea.$id)}
                  className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                  }`}
                  aria-label={isSelected ? "Deselect idea" : "Select idea for comparison"}
                >
                  {isSelected ? "✓" : ""}
                </button>
              </div>

              <div>
                <h3 className="line-clamp-2 font-bold text-slate-900 transition-colors group-hover:text-slate-700">
                  {idea.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {idea.idea.substring(0, 120)}
                  {idea.idea.length > 120 ? "..." : ""}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  {new Date(idea.$createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Link
                  href={`/dashboard/ideas/${idea.$id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  Open <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {selected.length >= 2 && compareUrl ? (
        <div className="sticky bottom-4 z-10 flex justify-end">
          <Link
            href={compareUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800"
          >
            <GitCompare className="h-4 w-4" />
            Compare ({selected.length})
          </Link>
        </div>
      ) : null}

      {selected.length > 0 && selected.length < 2 ? (
        <p className="text-xs text-slate-500">Select at least 2 ideas to compare (up to 4).</p>
      ) : null}

    </div>
  );
}
