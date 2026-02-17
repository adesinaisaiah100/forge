"use client";

import type { FormEvent, HTMLAttributes, TextareaHTMLAttributes } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: HTMLAttributes<HTMLFormElement>) {
  return <form className={cn("relative", className)} {...props} />;
}

export function PromptInputTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={2}
      className={cn(
        "min-h-10.5 max-h-36 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-all",
        "focus:border-slate-300 focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: "ready" | "submitted" | "streaming";
}

export function PromptInputSubmit({
  status = "ready",
  className,
  disabled,
  ...props
}: PromptInputSubmitProps) {
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <button
      type="submit"
      disabled={disabled || isBusy}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all",
        disabled || isBusy
          ? "cursor-not-allowed bg-slate-100 text-slate-400"
          : "bg-slate-900 text-white hover:bg-slate-800",
        className
      )}
      aria-label="Send message"
      {...props}
    >
      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
    </button>
  );
}

export type PromptInputMessage = {
  text?: string;
};

export type PromptInputSubmitHandler = (
  event: FormEvent<HTMLFormElement>
) => void;
