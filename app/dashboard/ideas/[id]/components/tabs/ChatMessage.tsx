"use client";

import type { UIMessage } from "ai";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { ToolResultCard } from "./ToolResultCard";
import { ScoreDiffCard } from "./ScoreDiffCard";

interface Props {
  message: UIMessage;
}

export function ChatMessage({ message }: Props) {
  return (
    <Message from={message.role}>
      <MessageContent>
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <MessageResponse key={`${message.id}-text-${index}`}>
                {part.text}
              </MessageResponse>
            );
          }

          if (part.type === "tool-re_evaluate_idea" && part.state === "output-available") {
            const output = part.output as {
              totalScore?: number;
              verdict?: string;
              scoreDiff?: Array<{
                dimension: string;
                previousScore: number | null;
                nextScore: number;
                delta: number | null;
              }>;
            };

            if (output?.totalScore != null && output?.verdict && Array.isArray(output?.scoreDiff)) {
              return (
                <ScoreDiffCard
                  key={`${message.id}-scorediff-${index}`}
                  totalScore={output.totalScore}
                  verdict={output.verdict}
                  scoreDiff={output.scoreDiff}
                />
              );
            }
          }

          if (part.type.startsWith("tool-")) {
            return <ToolResultCard key={`${message.id}-tool-${index}`} part={part} />;
          }

          return null;
        })}
      </MessageContent>
    </Message>
  );
}
