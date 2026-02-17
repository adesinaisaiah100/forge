import { cookies } from "next/headers";
import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { ID, Permission, Role } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite/server";
import { COLLECTIONS, DATABASE_ID } from "@/lib/appwrite/config";
import { getAssistantIdeaState } from "@/lib/ai/assistant-data";
import { buildAssistantContext } from "@/lib/ai/build-assistant-context";
import { createAssistantTools } from "@/lib/ai/assistant-tools";

export const maxDuration = 60;

interface ChatRouteBody {
  messages: UIMessage[];
  ideaId: string;
  sessionId?: string;
}

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .map((part) => {
      if (part.type === "text") {
        return part.text;
      }
      return "";
    })
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("forge-session")?.value;

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as ChatRouteBody;
    if (!body.ideaId || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response("Invalid request body", { status: 400 });
    }

    const client = createSessionClient(session);
    const user = await client.account.get();

    const state = await getAssistantIdeaState(session, body.ideaId);
    if (!state.currentVersion) {
      return new Response("Idea version not found", { status: 404 });
    }

    const latestUserMessage = [...body.messages]
      .reverse()
      .find((message) => message.role === "user");

    const latestUserText = latestUserMessage
      ? getTextFromMessage(latestUserMessage)
      : "";

    let sessionId = body.sessionId;

    if (!sessionId) {
      const now = new Date().toISOString();
      const title = latestUserText
        ? latestUserText.slice(0, 60)
        : `Idea chat ${state.currentVersion.versionNumber}`;

      const chatSession = await client.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        ID.unique(),
        {
          ideaId: body.ideaId,
          ideaVersionId: state.currentVersion.$id,
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

      sessionId = chatSession.$id;
    }

    if (latestUserText) {
      const createdAt = new Date().toISOString();
      await client.databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_MESSAGES,
        ID.unique(),
        {
          sessionId,
          ideaId: body.ideaId,
          ideaVersionId: state.currentVersion.$id,
          role: "user",
          content: latestUserText,
          toolCalls: null,
          toolResults: null,
          createdAt,
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
    }

    const assistantContext = buildAssistantContext(state);
    const tools = createAssistantTools({
      session,
      ideaId: body.ideaId,
    });

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: [
        "You are Forge AI Assistant. You help founders iteratively refine startup ideas.",
        "Use exactly these tools when appropriate: re_evaluate_idea, refine_feature, update_idea_field.",
        "Do not invent tool names.",
        "If user asks to save an idea field, use update_idea_field.",
        "If user asks to test impact of a feature, use refine_feature.",
        "If user asks to re-score after changes, use re_evaluate_idea.",
        "Keep responses strategic, explanative, and actionable.",
        "",
        "Current compressed context:",
        assistantContext,
      ].join("\n"),
      messages: await convertToModelMessages(body.messages),
      tools,
      stopWhen: stepCountIs(5),
    });

    result.text.then(
      async (assistantText) => {
        if (!assistantText?.trim()) return;

        const createdAt = new Date().toISOString();
        await client.databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CHAT_MESSAGES,
          ID.unique(),
          {
            sessionId,
            ideaId: body.ideaId,
            ideaVersionId: state.currentVersion?.$id,
            role: "assistant",
            content: assistantText,
            toolCalls: null,
            toolResults: null,
            createdAt,
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );

        const currentSession = await client.databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.CHAT_SESSIONS,
          sessionId
        );

        const nextMessageCount = (currentSession.messageCount ?? 0) +
          (latestUserText ? 2 : 1);

        await client.databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CHAT_SESSIONS,
          sessionId,
          {
            messageCount: nextMessageCount,
            lastMessageAt: createdAt,
          }
        );
      },
      () => {
        // Streaming should still succeed even if persistence fails.
      }
    );

    return result.toUIMessageStreamResponse({
      headers: {
        "x-chat-session-id": sessionId,
      },
      onError: () => {
        return "Something went wrong while generating a response.";
      },
    });
  } catch {
    return new Response("Failed to process chat request", { status: 500 });
  }
}
