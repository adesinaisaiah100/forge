# Forge — Phase Implementation Log

This document tracks implementation progress phase-by-phase, including:
- What was completed
- Which files were created/updated
- Important logic and design decisions
- What remains for the current phase

---

## Phase A — Conversational Core

Status: 🚧 In progress

### Prerequisites (Appwrite)

Before running Phase A in the app, ensure these are created in Appwrite:
- New collection: `chat_sessions`
- New collection: `chat_messages`
- New attribute on `mvp_plans`: `featureStatuses`
- New attribute on `evaluations`: `competitorProfiles`

Detailed checklist: `docs/phase-a-appwrite-setup.md`

### A0. Foundation slice completed (backend persistence + types)

#### What was done
- Added Appwrite collection constants for chat system:
  - `chat_sessions`
  - `chat_messages`
- Extended shared domain types for Phase A data:
  - `ChatSession`
  - `ChatMessage`
  - `CompetitorProfile`
  - `StoredMVPPlan.featureStatuses`
  - `StoredEvaluation.competitorProfiles`
- Implemented chat server actions:
  - List sessions by idea
  - List messages by session (cursor-ready)
  - Create session
  - Create message + update session counters
- Implemented MVP checkbox persistence action:
  - `updateMVPTaskStatus(planId, featureIndex, status)`

#### Files created
- `app/actions/chat.ts`

#### Files updated
- `lib/appwrite/config.ts`
- `lib/ai/types.ts`
- `app/actions/ideas.ts`
- `app/actions/mvp.ts`

#### Important logic
- Chat session title generation uses the first message (trimmed and length-safe).
- Message creation updates:
  - `chat_messages` record
  - session `messageCount`
  - session `lastMessageAt`
- MVP task progress is stored as a JSON map in `mvp_plans.featureStatuses`:
  - key: feature index (`"0"`, `"1"`, ...)
  - value: `pending` | `completed`
- Read-path parsers in actions safely parse JSON fields and default to empty objects/arrays where appropriate.

#### Why this slice first
This establishes stable persistence contracts before wiring UI and streaming. It minimizes rework and keeps Phase A implementation incremental.

---

### Phase A remaining (next slices)

1. Add compressed assistant context builder
   - `lib/ai/build-assistant-context.ts`
2. Add assistant tool layer (3 tools only)
   - `lib/ai/assistant-tools.ts`
3. Add streaming chat route
   - `app/api/chat/route.ts`
4. Build assistant tab UI and components
   - `AssistantTab.tsx`, `ChatMessage.tsx`, `ChatInput.tsx`, `ToolResultCard.tsx`, `ScoreDiffCard.tsx`
5. Add AI Assistant to workspace navigation
6. Wire MVP tab checkboxes + progress bar to `updateMVPTaskStatus`
7. Add competitor profile output path and cards in UI
8. End-to-end validation for tool loop and score diff behavior

---

### A1. Assistant backend + streaming route completed

#### What was done
- Reviewed Vercel AI SDK documentation for:
  - `useChat` client integration patterns
  - `streamText()` + `toUIMessageStreamResponse()` route patterns
  - Tool rendering parts in UI messages
- Built assistant data loader for current idea/version/evaluation/MVP state.
- Built compressed assistant context generator.
- Implemented the 3-tool system:
  - `re_evaluate_idea`
  - `refine_feature`
  - `update_idea_field`
- Created streaming API route for assistant chat using Gemini via `@ai-sdk/google`.
- Added chat message/session persistence from the API route.

#### Files created
- `lib/ai/assistant-data.ts`
- `lib/ai/build-assistant-context.ts`
- `lib/ai/assistant-tools.ts`
- `app/api/chat/route.ts`

#### Important logic
- The route validates auth via `forge-session`, loads current idea state, injects compressed context, and exposes only the 3 approved tools.
- If `sessionId` is not provided, a chat session is created automatically.
- User and assistant messages are persisted to `chat_messages`, and `chat_sessions` metadata is updated.
- `re_evaluate_idea` creates a new version, runs full evaluation, saves it, updates `ideas.currentVersionId`, and returns per-dimension deltas.
- `refine_feature` reuses the feature simulation pipeline and persists results to `feature_simulations`.
- `update_idea_field` updates exactly one allowed idea field without auto re-evaluation.

---

### A2. Assistant UI + MVP checklist UX completed

#### What was done
- Added `@ai-sdk/react` and implemented assistant chat UI using documented `useChat` patterns.
- Added AI Assistant tab into Idea Workspace tab order (Overview → AI Assistant → Deep Analysis...).
- Added session picker + new session control in Assistant tab.
- Added chat message rendering for:
  - text responses
  - tool invocation cards
  - score diff card after `re_evaluate_idea`
- Added typing indicator + sticky chat input bar.
- Added persisted MVP task checkboxes for:
  - `featurePrioritization`
  - `buildOrder`
- Added MVP progress UI with completed count and progress bar.

#### Files created
- `app/dashboard/ideas/[id]/components/tabs/AssistantTab.tsx`
- `app/dashboard/ideas/[id]/components/tabs/ChatMessage.tsx`
- `app/dashboard/ideas/[id]/components/tabs/ChatInput.tsx`
- `app/dashboard/ideas/[id]/components/tabs/ToolResultCard.tsx`
- `app/dashboard/ideas/[id]/components/tabs/ScoreDiffCard.tsx`

#### Files updated
- `app/dashboard/ideas/[id]/components/IdeaWorkspace.tsx`
- `app/dashboard/ideas/[id]/components/tabs/MVPTab.tsx`
- `app/actions/mvp.ts`

#### Important logic
- Assistant tab fetches/stores chat sessions via server actions and loads persisted history into `useChat`.
- Chat route receives `ideaId` + `sessionId` via transport body and streams model + tool outputs.
- Tool outputs are rendered inline as collapsible cards; score-diff output is rendered in a dedicated card.
- MVP checklist state is persisted per plan using a task-key map in `featureStatuses`.

---

### A3. Competitor profiles output completed

#### What was done
- Extended Market Agent schema to output structured competitor profiles.
- Updated Market Agent prompt to produce both:
  - lightweight `existing_alternatives`
  - rich `competitor_profiles`
- Persisted competitor profiles onto `evaluations.competitorProfiles`.
- Wired competitor profiles from persisted evaluation data into workspace props.
- Added competitor profile cards to the Overview tab.

#### Files updated
- `lib/ai/schemas.ts`
- `lib/ai/agents/market-agent.ts`
- `app/actions/ideas.ts`
- `app/dashboard/ideas/[id]/page.tsx`
- `app/dashboard/ideas/[id]/components/IdeaWorkspace.tsx`
- `app/dashboard/ideas/[id]/components/tabs/OverviewTab.tsx`

#### Important logic
- Profile structure includes: name, stage, estimated size, strengths/weaknesses, how-you-differ, and threat level.
- Persisted profiles are preferred for rendering; fallback reconstruction still works safely.
- Overview shows concise competitor cards with threat badges and differentiation snippets.

---

### A4. AI Elements-style chat primitives adopted

#### What was done
- Applied AI Elements composable UI pattern for chat rendering and input.
- Added local primitives modeled after AI Elements:
  - `Message`, `MessageContent`, `MessageResponse`
  - `Input`, `PromptInputTextarea`, `PromptInputSubmit`
- Refactored assistant tab chat UI to use these primitives while preserving existing business logic.

#### Files created
- `components/ai-elements/message.tsx`
- `components/ai-elements/prompt-input.tsx`

#### Files updated
- `app/dashboard/ideas/[id]/components/tabs/ChatMessage.tsx`
- `app/dashboard/ideas/[id]/components/tabs/ChatInput.tsx`

#### Important logic
- Backend route/tooling and Appwrite persistence are unchanged.
- Tool result cards and score-diff card behavior are preserved.
- This is a UI architecture upgrade only, aligned with AI Elements composition style.

---

### A5. AI Elements-style conversation primitives adopted

#### What was done
- Added local `Conversation` primitive set inspired by AI Elements patterns:
  - `Conversation`
  - `ConversationContent`
  - `ConversationEmptyState`
  - `ConversationScrollButton`
- Refactored Assistant tab to use these conversation primitives.

#### Files created
- `components/ai-elements/conversation.tsx`

#### Files updated
- `app/dashboard/ideas/[id]/components/tabs/AssistantTab.tsx`

#### Important logic
- Conversation auto-scrolls when at bottom and new content appears.
- Scroll-to-bottom button appears only when user is away from latest message.
- Empty state now uses a dedicated conversation component.

---

### A6. Assistant markdown rendering + loading skeleton polish

#### What was done
- Upgraded assistant text rendering to support markdown-style content in chat responses.
- Replaced plain loading text/spinner during chat history initialization with message-bubble skeleton placeholders.

#### Files updated
- `components/ai-elements/message.tsx`
- `app/dashboard/ideas/[id]/components/tabs/AssistantTab.tsx`

#### Important logic
- `MessageResponse` now renders structured output for headings, bullets/numbered lists, inline code, fenced code blocks, links, bold/italic text, and blockquotes.
- History loading state now visually mirrors chat bubbles to reduce perceived latency and avoid abrupt layout shift.

---

## Phase B — Evolution Timeline

Status: ⏸ Not started

## Phase C — Quick Re-eval + Comparison

Status: ⏸ Not started

## Phase D — Export + Share

Status: ⏸ Not started
