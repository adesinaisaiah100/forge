"use client";

import { FormEvent, useState } from "react";
import {
  Input,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

interface Props {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
}

export function ChatInput({ disabled = false, onSend }: Props) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const next = value.trim();
    if (!next || disabled || isSending) return;

    setIsSending(true);
    try {
      await onSend(next);
      setValue("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Input onSubmit={submit} className="sticky bottom-0 border-t border-slate-200 bg-white p-3">
      <div className="flex items-end gap-2">
        <PromptInputTextarea
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={2}
          placeholder="Ask Forge to refine your idea..."
          disabled={disabled || isSending}
          className="flex-1"
        />

        <PromptInputSubmit
          status={isSending ? "submitted" : "ready"}
          disabled={!value.trim() || disabled || isSending}
        />
      </div>
    </Input>
  );
}
