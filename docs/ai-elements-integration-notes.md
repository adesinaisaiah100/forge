# AI Elements Integration Notes (Vercel AI SDK)

Source reviewed:
- https://elements.ai-sdk.dev/docs
- https://elements.ai-sdk.dev/docs/setup
- https://elements.ai-sdk.dev/docs/usage
- https://elements.ai-sdk.dev/docs/benefits

## Key takeaways

- AI Elements is a shadcn-based component registry for AI chat UIs.
- It is designed to work directly with AI SDK hooks like `useChat`.
- Components are composable (e.g. `Message`, `MessageContent`, `MessageResponse`).
- It supports streaming/status-aware rendering and better default accessibility/theming.
- Install flow typically adds source files into the app (`@/components/ai-elements/...`) rather than a black-box widget.

## Fit with current project

Current stack already matches prerequisites:
- React 19
- Next.js App Router
- AI SDK
- Tailwind CSS 4

Potential migration target:
- Current custom chat UI in `app/dashboard/ideas/[id]/components/tabs/*` can be progressively swapped with AI Elements message/composer primitives without changing backend route/tooling.

## Recommended migration approach

1. Keep existing backend unchanged:
   - `/api/chat` route
   - `createAssistantTools` and Appwrite persistence
2. Replace only visual layer first:
   - `ChatMessage.tsx` → AI Elements message primitives
   - `ChatInput.tsx` → AI Elements prompt/composer primitives
3. Preserve existing custom pieces:
   - Tool result cards
   - Score diff card
   - Session picker and setup error banners
4. Validate streaming/tool rendering behavior with existing `useChat` flow.

## Dependency note

AI Elements can be added through CLI and may introduce additional generated components/dependencies.
Per project rule, request explicit approval before installing any new dependency.

## Suggested next implementation task

- Introduce AI Elements `message` primitives in the assistant tab only (no backend changes), then evaluate readability and maintainability.
