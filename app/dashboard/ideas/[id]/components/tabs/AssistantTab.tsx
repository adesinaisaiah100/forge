"use client";

import { useEffect, useMemo, useState } from "react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { Bot, Loader2, MessageSquare, MessageSquarePlus } from "lucide-react";
import type { CompleteEvaluation } from "@/lib/ai/types";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import type { ChatMessage as StoredChatMessage, ChatSession } from "@/lib/ai/types";

interface Props {
  ideaId: string;
  ideaVersionId: string | null;
  ideaTitle: string;
  evaluation: CompleteEvaluation;
}

function findWeakestDimensionLabel(evaluation: CompleteEvaluation): string {
  const entries = Object.entries(evaluation.score_breakdown);
  const weakest = entries.sort((a, b) => a[1].score - b[1].score)[0]?.[0] ?? "differentiation_strength";
  return weakest.replace(/_/g, " ");
}

function toStoredMessage(message: StoredChatMessage): UIMessage {
  return {
    id: message.$id,
    role: message.role,
    parts: [
      {
        type: "text",
        text: message.content,
      },
    ],
  };
}

export function AssistantTab({ ideaId, ideaVersionId, ideaTitle, evaluation }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  const weakestDimensionLabel = useMemo(
    () => findWeakestDimensionLabel(evaluation),
    [evaluation]
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        ideaId,
        sessionId: selectedSessionId,
      },
    }),
  });

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoadingHistory(true);
      setSetupError(null);
      try {
        const { getChatSessions, createChatSession } = await import("@/app/actions/chat");
        const existing = await getChatSessions(ideaId);

        if (existing.length > 0) {
          setSessions(existing);
          setSelectedSessionId(existing[0].$id);
        } else if (ideaVersionId) {
          const created = await createChatSession(
            ideaId,
            ideaVersionId,
            `Review ${ideaTitle}`
          );
          setSessions([created]);
          setSelectedSessionId(created.$id);
        }
      } catch (error) {
        setSetupError(
          error instanceof Error
            ? error.message
            : "AI Assistant setup is incomplete. Please check Phase A Appwrite collections and attributes."
        );
      }

      setIsLoadingHistory(false);
    };

    void loadSessions();
  }, [ideaId, ideaTitle, ideaVersionId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedSessionId) {
        setMessages([]);
        return;
      }

      const { getChatMessages } = await import("@/app/actions/chat");
      const history = await getChatMessages(selectedSessionId);

      if (history.length === 0) {
        setMessages([
          {
            id: `welcome-${selectedSessionId}`,
            role: "assistant",
            parts: [
              {
                type: "text",
                text: `I've reviewed your idea, ${ideaTitle}. Your current Forge Score is ${evaluation.overall_assessment.total_score}/100 with a ${evaluation.overall_assessment.verdict} verdict. Your weakest dimension is ${weakestDimensionLabel} at ${evaluation.score_breakdown[Object.keys(evaluation.score_breakdown).sort((a, b) => evaluation.score_breakdown[a as keyof typeof evaluation.score_breakdown].score - evaluation.score_breakdown[b as keyof typeof evaluation.score_breakdown].score)[0] as keyof typeof evaluation.score_breakdown].score}/100. What would you like to explore?`,
              },
            ],
          },
        ]);
        return;
      }

      setMessages(history.map(toStoredMessage));
    };

    void loadMessages();
  }, [
    selectedSessionId,
    setMessages,
    ideaTitle,
    evaluation,
    weakestDimensionLabel,
  ]);

  const handleCreateSession = async () => {
    if (!ideaVersionId) return;
    try {
      const { createChatSession } = await import("@/app/actions/chat");
      const created = await createChatSession(
        ideaId,
        ideaVersionId,
        `New chat for ${ideaTitle}`
      );

      setSessions((current) => [created, ...current]);
      setSelectedSessionId(created.$id);
      setMessages([]);
      setSetupError(null);
    } catch (error) {
      setSetupError(
        error instanceof Error
          ? error.message
          : "Unable to create chat session."
      );
    }
  };

  const handleSend = async (text: string) => {
    try {
      await sendMessage({ text });
      setSetupError(null);
    } catch (error) {
      setSetupError(
        error instanceof Error
          ? error.message
          : "Unable to send message."
      );
    }
  };

  const historySkeleton = (
    <div className="space-y-4">
      {[0, 1, 2].map((row) => (
        <div
          key={`history-skeleton-${row}`}
          className={`flex w-full ${row === 1 ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`w-full max-w-[85%] space-y-2 rounded-2xl px-3 py-2.5 ${
              row === 1
                ? "bg-slate-900/10"
                : "border border-slate-200 bg-white"
            }`}
          >
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col rounded-2xl border border-slate-200 bg-slate-50/40">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">AI Assistant</h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            value={selectedSessionId ?? ""}
            onChange={(event) => setSelectedSessionId(event.currentTarget.value)}
            disabled={sessions.length === 0}
          >
            {sessions.map((session) => (
              <option key={session.$id} value={session.$id}>
                {session.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCreateSession}
            disabled={!ideaVersionId}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      <Conversation className="flex-1">
        <ConversationContent>
          {setupError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {setupError}
            </div>
          )}

          {isLoadingHistory ? (
            historySkeleton
          ) : messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="h-10 w-10" />}
              title="Start a conversation"
              description="Ask Forge to challenge assumptions, refine positioning, or re-evaluate your idea."
            />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {(status === "submitted" || status === "streaming") && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Forge is thinking...
                </div>
              )}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <ChatInput
        disabled={status !== "ready" || !selectedSessionId || !!setupError}
        onSend={handleSend}
      />
    </div>
  );
}
