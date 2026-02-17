"use server";

import { createSessionClient } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { ID, Permission, Query, Role } from "node-appwrite";
import type { ChatMessage, ChatSession } from "@/lib/ai/types";

function getErrorDetails(error: unknown): { type?: string; message: string } {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    const typedError = error as { type?: string; message: string };
    return {
      type: typedError.type,
      message: typedError.message,
    };
  }

  return {
    message: "Unknown Appwrite error.",
  };
}

async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get("forge-session");
  if (!session?.value) throw new Error("Not authenticated");
  const client = createSessionClient(session.value);
  const user = await client.account.get();
  return { ...client, user };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainChatSession(doc: any): ChatSession {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    ideaId: doc.ideaId,
    ideaVersionId: doc.ideaVersionId,
    title: doc.title,
    messageCount: doc.messageCount ?? 0,
    lastMessageAt: doc.lastMessageAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlainChatMessage(doc: any): ChatMessage {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    sessionId: doc.sessionId,
    ideaId: doc.ideaId,
    ideaVersionId: doc.ideaVersionId,
    role: doc.role,
    content: doc.content,
    toolCalls: doc.toolCalls ?? null,
    toolResults: doc.toolResults ?? null,
    createdAt: doc.createdAt,
  };
}

function titleFromMessage(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "New assistant chat";
  return normalized.length > 60
    ? `${normalized.slice(0, 57).trimEnd()}...`
    : normalized;
}

export async function getChatSessions(ideaId: string): Promise<ChatSession[]> {
  try {
    const { databases } = await getAuthenticatedClient();
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CHAT_SESSIONS,
      [
        Query.equal("ideaId", ideaId),
        Query.orderDesc("lastMessageAt"),
        Query.limit(50),
      ]
    );

    return result.documents.map(toPlainChatSession);
  } catch {
    return [];
  }
}

export async function getChatMessages(
  sessionId: string,
  cursor?: string
): Promise<ChatMessage[]> {
  try {
    const { databases } = await getAuthenticatedClient();
    const queries = [
      Query.equal("sessionId", sessionId),
      Query.orderAsc("createdAt"),
      Query.limit(100),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.CHAT_MESSAGES,
      queries
    );

    return result.documents.map(toPlainChatMessage);
  } catch {
    return [];
  }
}

export async function createChatSession(
  ideaId: string,
  ideaVersionId: string,
  firstMessage?: string
): Promise<ChatSession> {
  try {
    const { databases, user } = await getAuthenticatedClient();

    const now = new Date().toISOString();
    const title = titleFromMessage(firstMessage ?? "");

    const session = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CHAT_SESSIONS,
      ID.unique(),
      {
        ideaId,
        ideaVersionId,
        title,
        messageCount: 0,
        lastMessageAt: now,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    return toPlainChatSession(session);
  } catch (error) {
    const details = getErrorDetails(error);
    const message = `${details.message}`.toLowerCase();
    if (
      details.type === "collection_not_found" ||
      message.includes("chat_sessions")
    ) {
      throw new Error(
        "Phase A setup required: create the Appwrite collection 'chat_sessions' before using AI Assistant."
      );
    }

    throw error;
  }
}

export async function createChatMessage(input: {
  sessionId: string;
  ideaId: string;
  ideaVersionId: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: string | null;
  toolResults?: string | null;
}): Promise<ChatMessage> {
  try {
    const { databases, user } = await getAuthenticatedClient();
    const createdAt = new Date().toISOString();

    const message = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CHAT_MESSAGES,
      ID.unique(),
      {
        sessionId: input.sessionId,
        ideaId: input.ideaId,
        ideaVersionId: input.ideaVersionId,
        role: input.role,
        content: input.content,
        toolCalls: input.toolCalls ?? null,
        toolResults: input.toolResults ?? null,
        createdAt,
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    try {
      const existingSession = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        input.sessionId
      );

      const nextMessageCount = (existingSession.messageCount ?? 0) + 1;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        input.sessionId,
        {
          messageCount: nextMessageCount,
          lastMessageAt: createdAt,
        }
      );
    } catch {
      // Keep message persistence successful even if session counter update fails.
    }

    return toPlainChatMessage(message);
  } catch (error) {
    const details = getErrorDetails(error);
    const message = `${details.message}`.toLowerCase();
    if (
      details.type === "collection_not_found" ||
      message.includes("chat_messages")
    ) {
      throw new Error(
        "Phase A setup required: create the Appwrite collection 'chat_messages' before using AI Assistant."
      );
    }

    throw error;
  }
}
