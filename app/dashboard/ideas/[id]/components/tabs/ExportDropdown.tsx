"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download, FileJson, FileText, Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAsJSON, formatAsMarkdown, type ReportPayload } from "@/lib/export/format-report";
import { copyToClipboard, downloadFile } from "@/lib/export/download";

interface Props {
  payload: Omit<ReportPayload, "generatedAt">;
}

export function ExportDropdown({ payload }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const reportPayload = useMemo<ReportPayload>(() => ({
    ...payload,
    generatedAt: new Date().toISOString(),
  }), [payload]);

  const fileBase = useMemo(() => {
    const normalized = payload.ideaTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `${normalized || "forge-report"}-v${payload.versionNumber}`;
  }, [payload.ideaTitle, payload.versionNumber]);

  const onDownloadMarkdown = () => {
    const markdown = formatAsMarkdown(reportPayload);
    downloadFile(markdown, `${fileBase}.md`, "text/markdown;charset=utf-8");
    setStatus("Markdown downloaded.");
    setOpen(false);
  };

  const onDownloadJson = () => {
    const json = JSON.stringify(formatAsJSON(reportPayload), null, 2);
    downloadFile(json, `${fileBase}.json`, "application/json;charset=utf-8");
    setStatus("JSON downloaded.");
    setOpen(false);
  };

  const onCopyMarkdown = async () => {
    try {
      const markdown = formatAsMarkdown(reportPayload);
      await copyToClipboard(markdown);
      setStatus("Markdown copied to clipboard.");
    } catch {
      setStatus("Clipboard copy failed.");
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-3.5 w-3.5" />
        Export Report
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open ? "rotate-180" : "rotate-0")} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10">
          <button
            type="button"
            onClick={onDownloadMarkdown}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" />
            Download Markdown
          </button>

          <button
            type="button"
            onClick={onDownloadJson}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileJson className="h-3.5 w-3.5" />
            Download JSON
          </button>

          <button
            type="button"
            onClick={() => {
              void onCopyMarkdown();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Clipboard className="h-3.5 w-3.5" />
            Copy Markdown
          </button>
        </div>
      ) : null}

      {status ? <p className="mt-1 text-[11px] text-slate-500">{status}</p> : null}
    </div>
  );
}
