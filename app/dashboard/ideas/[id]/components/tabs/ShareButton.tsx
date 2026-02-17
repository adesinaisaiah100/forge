"use client";

import { useMemo, useState } from "react";
import { Copy, Link2, Loader2, Lock, Share2, Unlock } from "lucide-react";

interface Props {
  ideaVersionId: string | null;
}

export function ShareButton({ ideaVersionId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const absoluteUrl = useMemo(() => {
    if (!shareUrl) return null;
    if (typeof window === "undefined") return shareUrl;
    return `${window.location.origin}${shareUrl}`;
  }, [shareUrl]);

  const handleGenerate = async () => {
    if (!ideaVersionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { generateShareLink } = await import("@/app/actions/share");
      const result = await generateShareLink(ideaVersionId);
      setShareUrl(result.url);
      setIsPublic(true);
    } catch (shareError) {
      setError(
        shareError instanceof Error
          ? shareError.message
          : "Unable to generate share link"
      );
    }

    setIsLoading(false);
  };

  const handleToggle = async () => {
    if (!ideaVersionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { toggleShareLink } = await import("@/app/actions/share");
      const result = await toggleShareLink(ideaVersionId, !isPublic);
      setIsPublic(result.isPublic);
      if (result.url) {
        setShareUrl(result.url);
      }
    } catch (shareError) {
      setError(
        shareError instanceof Error
          ? shareError.message
          : "Unable to update share visibility"
      );
    }

    setIsLoading(false);
  };

  const handleCopy = async () => {
    if (!absoluteUrl) return;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
    } catch {
      setError("Copy failed. Please copy manually.");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || !ideaVersionId}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
          Share report
        </button>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading || !shareUrl}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPublic ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {isPublic ? "Public" : "Private"}
        </button>

        {absoluteUrl ? (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy link
          </button>
        ) : null}
      </div>

      {absoluteUrl ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Link2 className="h-3.5 w-3.5" />
          {absoluteUrl}
        </p>
      ) : null}

      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
