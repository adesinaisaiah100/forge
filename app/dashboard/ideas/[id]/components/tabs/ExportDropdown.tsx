"use client";

import { useState } from "react";
import { Copy, Download, FileJson, FileText, Loader2 } from "lucide-react";
import type { EvaluationResult } from "@/lib/ai/schemas";
import type { StoredFeatureSimulation, StoredMVPPlan } from "@/lib/ai/types";
import { copyToClipboard, downloadFile } from "@/lib/export/download";
import { formatAsJSON, formatAsMarkdown } from "@/lib/export/format-report";

interface Props {
  ideaTitle: string;
  idea: {
    idea: string;
    targetUser: string;
    problem: string;
    alternatives: string;
    timing: string;
    founderFit: string;
    stage: string;
  };
  evaluation: EvaluationResult;
  mvpPlan: StoredMVPPlan | null;
  featureSimulations: StoredFeatureSimulation[];
}

export function ExportDropdown({
  ideaTitle,
  idea,
  evaluation,
  mvpPlan,
  featureSimulations,
}: Props) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildPayload = () => ({
    ideaTitle,
    idea,
    evaluation,
    mvpPlan,
    featureSimulations,
  });

  const handleMarkdownDownload = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const markdown = formatAsMarkdown(buildPayload());
      downloadFile(markdown, `forge-report-${ideaTitle.replace(/\s+/g, "-").toLowerCase()}.md`, "text/markdown;charset=utf-8");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Markdown export failed.");
    }
    setIsBusy(false);
  };

  const handleJsonDownload = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const json = JSON.stringify(formatAsJSON(buildPayload()), null, 2);
      downloadFile(json, `forge-report-${ideaTitle.replace(/\s+/g, "-").toLowerCase()}.json`, "application/json;charset=utf-8");
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "JSON export failed.");
    }
    setIsBusy(false);
  };

  const handleCopyMarkdown = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const markdown = formatAsMarkdown(buildPayload());
      await copyToClipboard(markdown);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Copy failed.");
    }
    setIsBusy(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleMarkdownDownload}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
          Export Markdown
        </button>

        <button
          type="button"
          onClick={handleJsonDownload}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <FileJson className="h-3.5 w-3.5" />
          Export JSON
        </button>

        <button
          type="button"
          onClick={handleCopyMarkdown}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Markdown
        </button>
      </div>

      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}

      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
        <Download className="h-3.5 w-3.5" />
        Exports include evaluation, risk profile, and optional MVP/Feature Lab context.
      </p>
    </div>
  );
}
