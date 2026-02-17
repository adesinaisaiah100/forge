# Forge — MVP Feature Expansion Plan (Refined)

> **Product Identity**: Forge is an **AI that helps you evolve startup ideas** — not just evaluate them once, but iteratively refine them until they're investable.
>
> **Core Loop**: Think → Evaluate → Refine → Re-evaluate → Track Progress → Share
>
> Every feature must serve this loop. If it doesn't tighten the loop, it's deferred.

---

## Execution Approval Plan (Phase-by-Phase)

Use this section as the implementation gate. No code work should start for a phase until you approve it.

### Phase 1 — Responsive Foundation + Landing + Onboarding

**What we are building**
- Shared responsive breakpoint system using `react-responsive`.
- Fully responsive landing page sections (hero + marketing blocks + footer).
- Fully responsive onboarding flow (progress, spacing, mobile-safe controls).

**Deliverable**
- Mobile-first UX from 320px to desktop for entry flow pages.

**Status**
- ✅ Completed and shipped.

---

### Phase 2 — Dashboard + Idea Workspace Responsive UX

**What we are building**
- Responsive dashboard header/list behavior for small screens.
- Mobile workspace shell (top bar + slide-in navigation).
- Desktop workspace shell retained (fixed sidebar).

**Deliverable**
- Consistent dashboard/workspace usability across phone, tablet, and desktop.

**Status**
- ✅ Completed and shipped.

---

### Phase 3 — Evaluation Tabs Responsive Refactor

**What we are building**
- Responsive tab layouts in Overview / Deep Analysis / MVP / Feature Lab.
- Mobile-friendly rendering patterns (stacking, card mode, reduced visual density where needed).
- Responsive readability for long-form strategic content.

**Deliverable**
- Evaluation experience is operable and readable on all major viewport classes.

**Status**
- ✅ Completed and shipped.

---

### Phase 4 — Conversational Core (Next Build Phase)

**What we are building**
- AI Assistant tab with streaming responses.
- Three-tool system only (`re_evaluate_idea`, `refine_feature`, `update_idea_field`).
- Compressed context injection + post-re-evaluation score-diff psychology loop.
- Basic MVP checkboxes with persisted progress.

**Deliverable**
- Think → Evaluate → Refine → Re-evaluate loop becomes interactive and persistent.

**Status**
- ⏸ Pending your approval to start implementation.

---

### Phase 5 — Evolution + Comparison + Share Outputs

**What we are building**
- Evolution timeline UI + version diff visibility.
- Quick re-evaluation workflow and side-by-side idea comparison.
- Report export and shareable link output.

**Deliverable**
- Strong retention loop + growth/share surface.

**Status**
- ⏸ Not started.

---

## Current State (What Exists)

| Feature | Status |
|---|---|
| Idea intake (6-step onboarding) | ✅ Live |
| Multi-agent AI evaluation (4 agents, 6 dimensions, 4 risks) | ✅ Live |
| Idea workspace with tabbed interface | ✅ Live |
| Overview / Deep Analysis / Risk Profile tabs | ✅ Live |
| MVP Plan generation | ✅ Live |
| Feature Lab (impact simulation) | ✅ Live |
| Evolution tab | 🔲 Placeholder |
| Idea versioning | 🔲 Data model exists, no UI |

---

## Strategic Tier Ranking

Everything is ranked by impact on the core loop.

### Tier 1 — Retention Backbone (Build first)

| Phase | Feature | Why |
|---|---|---|
| A | AI Assistant (3 tools) | Makes everything interactive. The thinking partner. |
| B | Evolution Timeline | Visual reward for iterating. Without it, re-evaluations feel invisible. |
| C | Quick Re-Evaluation + Idea Comparison | Reduces friction to pivot. Comparison drives multi-idea engagement. |

### Tier 2 — Perceived Value & Growth (Build second)

| Phase | Feature | Why |
|---|---|---|
| D | Report Export + Shareable Link | Tangible output + growth engine. Export and share reuse the same render logic. |
| D+ | MVP Checkboxes (basic) | Simple retention mechanic — 3 hours of work, daily return reason. Bundled into Phase A. |

### Tier 3 — Depth Enhancers (Build after validation)

| Feature | Why deferred |
|---|---|
| Interactive MVP change requests | Complex AI change analysis flow. Only useful if founders actually use checkboxes first. Validate checkbox usage before building the AI layer. |
| Competitor Intelligence (search API) | Tavily integration adds cost + complexity. Tier 1 competitor profiles from the Market Agent prompt are free and ship in Phase A. Real search API comes after validating demand. |
| Pitch Deck Generator | High marketing value, low daily usage. Depends on all other data being solid. Ship last. |
| `fetch_competitor_data` tool | The model can answer competitor questions conversationally from training data. A formal tool with search API adds latency, routing errors, and cost. Defer until founders ask for it. |
| `find_resources` tool | Pure conversational — the model already knows YC library, First Round Review, etc. No tool needed. The assistant handles this naturally. |

---

## Phase A — Conversational Core (~5-6 days)

**What ships**: AI Assistant with 3 tools, compressed context injection, post-re-evaluation psychology layer, basic MVP checkboxes, enhanced Market Agent competitor profiles.
And using google provider in the vercel ai sdk

### A.1 Data Model Changes

**New collection: `chat_messages`**

| Attribute | Type | Required | Description |
|---|---|---|---|
| `ideaId` | string(255) | ✅ | Links conversation to an idea |
| `ideaVersionId` | string(255) | ✅ | Links to specific version |
| `role` | string(20) | ✅ | `user` or `assistant` |
| `content` | string(50000) | ✅ | Message text (markdown supported) |
| `toolCalls` | string(50000) | ❌ | JSON array of tool calls made (for audit trail) |
| `toolResults` | string(50000) | ❌ | JSON array of tool results returned |
| `createdAt` | string(50) | ✅ | ISO timestamp |

**New collection: `chat_sessions`**

| Attribute | Type | Required | Description |
|---|---|---|---|
| `ideaId` | string(255) | ✅ | Parent idea |
| `ideaVersionId` | string(255) | ✅ | Version context |
| `title` | string(255) | ✅ | Auto-generated session title |
| `messageCount` | integer | ✅ | Running count |
| `lastMessageAt` | string(50) | ✅ | ISO timestamp |

**Updated collection: `mvp_plans`** — Add:

| Attribute | Type | Required | Description |
|---|---|---|---|
| `featureStatuses` | string(10000) | ❌ | JSON object mapping feature index → status (`pending` / `completed`) |

**Updated collection: `evaluations`** — Add (for enhanced competitor profiles):

| Attribute | Type | Required | Description |
|---|---|---|---|
| `competitorProfiles` | string(50000) | ❌ | JSON array of structured competitor profiles from Market Agent |

### A.2 AI Assistant Architecture

**Compressed Context Injection** — Instead of dumping raw JSON (4,000+ tokens), inject a compressed summary (~200 tokens):

```
IDEA: [title]
STAGE: [stage] | VERSION: [versionNumber]
SCORE: [totalScore]/100 | VERDICT: [verdict] | CONFIDENCE: [confidence]%

DIMENSIONS:
  Problem Strength:    [score] (weight 25%)
  Market Opportunity:  [score] (weight 20%)
  Differentiation:     [score] (weight 20%)
  Timing Readiness:    [score] (weight 15%)
  Founder Leverage:    [score] (weight 10%)
  Execution Feasibility: [score] (weight 10%)

WEAKEST: [dimension name] ([score])
STRONGEST: [dimension name] ([score])

RISKS: Market [level] | Execution [level] | Timing [level] | Technical [level]
TOP RISK: [name] — [one-line reason]

MVP STATUS: [Not generated | Generated (X/Y tasks complete)]
LAST VERSION CHANGE: [V1→V2 summary or "First version"]

TARGET USER: [targetUser]
PROBLEM: [problem]
IDEA: [idea text]
```

The assistant can request full detailed data (raw scoreBreakdown, riskProfile, strategicAnalysis) conversationally if the discussion requires depth — but the system prompt stays lean.

**Model**: `gemini-flash-latest` (same as evaluation pipeline but with gemini — already integrated).

**Streaming**: Vercel AI SDK `streamText()` for real-time responses.

### A.3 Tool System — 3 Tools Only

Minimal tool surface. Ship 3, validate, expand later. More tools = more routing errors, more latency, harder debugging.

#### Tool 1: `re_evaluate_idea`

- **What it does**: Triggers a full re-evaluation with updated context. Creates a new version.
- **When used**: Founder refines problem statement, pivots target user, adds features.
- **Implementation**:
  1. Creates new `idea_versions` document (increments version number)
  2. Runs full 4-agent evaluation pipeline with updated idea text
  3. Saves new evaluation to `evaluations` collection
  4. Updates `ideas.currentVersionId` to point to new version
  5. Returns structured score diff (see Psychology Layer below)
- **Side effect**: Powers the Evolution tab (Phase B).

#### Tool 2: `refine_feature`

- **What it does**: Runs a feature through the Feature Lab simulation pipeline inline in the chat.
- **When used**: Founder asks "What if I add a referral system?" — assistant calls this tool instead of guessing.
- **Implementation**: Reuses existing `simulateFeature()` server action. Tool wrapper formats result as readable chat message.
- **Side effect**: Saves simulation to `feature_simulations` collection (same as Feature Lab tab).

#### Tool 3: `update_idea_field`

- **What it does**: Updates a specific field of the idea (targetUser, problem, alternatives, timing, founderFit, stage).
- **When used**: After discussion, assistant suggests "Based on our conversation, I'd update your target user to X. Want me to save this?" → founder confirms → tool updates field.
- **Side effect**: Logs the change. Does NOT auto-trigger re-evaluation (that's a separate deliberate action via Tool 1).

### A.4 Post-Re-Evaluation Psychology Layer

**This is critical.** After every `re_evaluate_idea` call, the assistant automatically formats a score diff and proactive suggestion:

```
📊 Your idea improved +7 points.

  Problem Strength:    72 → 76 (+4)
  Market Opportunity:  58 → 66 (+8)
  Differentiation:     45 → 40 (-5)  ← still weakest
  Timing Readiness:    71 → 73 (+2)
  Founder Leverage:    65 → 65 (—)
  Execution:           60 → 62 (+2)

  Total: 62 → 69 | Verdict: REFINE (unchanged)
  Risk shift: Market Risk dropped from High → Medium ✓

Your weakest dimension is still Differentiation at 40/100.
Want to brainstorm ways to strengthen it?
```

This creates a guided iteration loop. The founder sees progress, sees what's still weak, and gets an immediate action suggestion. That's the dopamine loop that makes iteration addictive.

### A.5 Basic MVP Checkboxes (Included in Phase A)

Not the full Interactive MVP system — just checkboxes:

- Each item in `featurePrioritization` and `buildOrder` becomes checkable
- Checkbox toggles `completed` status
- Progress bar: "4/12 tasks completed — 33%"
- Persisted to `featureStatuses` in `mvp_plans` document
- Assistant reads MVP progress via compressed context: "MVP STATUS: Generated (4/12 tasks complete)"

**No change request flow.** No AI change analysis. Just checkboxes + progress bar. ~3 hours of work.

### A.6 Enhanced Market Agent Competitor Profiles (Free)

Enhance the existing Market Agent prompt to output structured competitor profiles during evaluation. Zero additional cost — it's the same LLM call, just richer output.

```typescript
interface CompetitorProfile {
  name: string;
  url: string | null;
  description: string;
  stage: "Startup" | "Growth" | "Enterprise" | "Dead";
  estimatedSize: string;
  fundingInfo: string | null;
  keyStrengths: string[];
  keyWeaknesses: string[];
  howYouDiffer: string;
  threatLevel: "low" | "medium" | "high";
}
```

Stored in `evaluations.competitorProfiles`, displayed as cards in Overview or Deep Analysis tab. The assistant references them conversationally without needing a formal tool.

### A.7 Chat UI

**Location**: "AI Assistant" tab — 2nd in workspace sidebar (after Overview, before Deep Analysis).

**Layout**:
- Full-height scrollable message list
- Sticky input bar at bottom with textarea + send button
- Messages render markdown (bold, lists, code blocks, tables)
- Tool call results render as collapsible inline cards
- Typing indicator with streaming text
- Session picker dropdown at top (start new or continue existing)

**Key UX details**:
- First message auto-generated: "I've reviewed your idea, [title]. Your current Forge Score is [X]/100 with a [VERDICT] verdict. Your weakest dimension is [name] at [score]/100. What would you like to explore?"
- Tool calls show loading state: "Running feature simulation..." with skeleton pattern
- After `re_evaluate_idea` runs, sidebar score updates in real-time + psychology layer diff renders inline

### A.8 Implementation Steps

```
1.  Create chat_messages and chat_sessions collections in Appwrite Console
2.  Add collection IDs to lib/appwrite/config.ts
3.  Add featureStatuses attribute to mvp_plans collection
4.  Add competitorProfiles attribute to evaluations collection
5.  Create compressed context builder: lib/ai/build-assistant-context.ts
    - Takes idea + evaluation + mvpPlan + simulations
    - Returns ~200 token compressed summary string
6.  Create tool definitions: lib/ai/assistant-tools.ts
    - 3 tools only: re_evaluate_idea, refine_feature, update_idea_field
    - Zod schemas for each
    - Wire to existing server actions
7.  Create API route: app/api/chat/route.ts
    - Streaming endpoint using streamText()
    - Context injection + tool execution
8.  Create server actions: app/actions/chat.ts
    - getChatSessions(ideaId)
    - getChatMessages(sessionId, cursor?)
    - createChatSession(ideaId, ideaVersionId)
9.  Create server action: updateMVPTaskStatus(planId, featureIndex, status)
10. Build chat UI components:
    - app/dashboard/ideas/[id]/components/tabs/AssistantTab.tsx
    - ChatMessage.tsx (user/assistant messages + tool result cards)
    - ChatInput.tsx (textarea + send + keyboard shortcut)
    - ToolResultCard.tsx (collapsible inline cards)
    - ScoreDiffCard.tsx (psychology layer — score diff + proactive suggestion)
11. Add checkboxes + progress bar to MVPTab.tsx
12. Add CompetitorCard.tsx to Overview or Deep Analysis tab
13. Update Market Agent prompt to output competitor profiles
14. Add "AI Assistant" tab to IdeaWorkspace.tsx sidebar nav
15. Wire streaming with useChat() hook from Vercel AI SDK
16. Test end-to-end:
    - Submit idea → open assistant → ask questions → verify streaming
    - Trigger re_evaluate_idea → verify new version + score diff card
    - Trigger refine_feature → verify simulation saved + displayed
    - Check MVP tasks → verify progress bar updates
    - Verify competitor cards render from evaluation data
```

### A.9 Validation Metrics (Measure Before Moving to Phase B)

| Metric | Target | What it tells you |
|---|---|---|
| Messages per session | >5 | Are founders having real conversations or single-question drive-bys? |
| Re-evaluations per user | >2 versions created | Is the core loop happening? If <2, the re-evaluate tool isn't compelling enough. |
| Feature simulations via assistant | >1 per user | Are founders exploring "what if" scenarios? |
| MVP checkboxes checked | >3 items per plan | Do founders treat the MVP tab as a tracker? |
| Session return rate | >1 session per week | Are founders coming back? |

**If versions created < 2 per user, the core loop is broken. Diagnose before building Phase B.**

---

## Phase B — Evolution Timeline (~2 days)

**Why immediately after Phase A**: Once versions exist from re-evaluations, founders need visual feedback. Without the timeline, re-evaluating feels like shouting into a void. The evolution tab is the psychological reward that reinforces the loop.

### B.1 When Versions Are Created

Versions are created through two paths:
1. AI Assistant calls `re_evaluate_idea` tool (Phase A)
2. Quick Re-Evaluation inline edit (Phase C)

Both create `idea_versions` documents and run the full evaluation pipeline.

### B.2 Evolution Tab UI

**Timeline view**:
- Vertical timeline, newest at top
- Each node shows: version number, date, score, verdict badge
- Connecting line between nodes is color-coded (green = score went up, red = down)
- Clicking a version expands inline comparison panel

**Comparison panel** (expanded):
- Side-by-side score bars: V1 vs V2 for each dimension
- Delta badges: "+8 Problem Strength", "-3 Market Opportunity"
- Risk changes: "Market Risk: High → Medium"
- Summary: AI-generated 2-sentence explanation of what changed and why

**Aggregate view** (top of tab):
- Line chart showing total score over time (Recharts — already installed)
- Current streak: "3 consecutive improvements"
- Biggest gain: "Problem Strength: 38 → 72 (+34)"
- Biggest remaining weakness: "Differentiation: 45"

### B.3 Implementation Steps

```
1. Add diffSummary attribute (string 5000) to idea_versions collection
2. Create EvolutionTab.tsx replacing the placeholder
3. Fetch all versions + their evaluations via getIdeaWithVersions()
4. Build VersionTimeline.tsx component (vertical timeline with colored connectors)
5. Build ScoreComparisonPanel.tsx (side-by-side dimension bars with deltas)
6. Build EvolutionChart.tsx (Recharts line chart — score over time)
7. Generate AI diff summaries during re_evaluate_idea tool execution
8. Test: create 3 versions via assistant → verify timeline + diffs + chart
```

---

## Phase C — Quick Re-Evaluation + Idea Comparison (~1.5 days)

### C.1 Quick Re-Evaluation (Inline Pivot) — ~1 day

**Why**: The assistant supports re-evaluation through conversation, but sometimes founders don't want to chat. They just want to tweak one field and see what happens. 3 clicks instead of a conversation.

**What it does**: On the Overview tab, each intake field has a pencil icon. Click → inline textarea with current value → edit → "Re-evaluate" → new version + score diff.

**Flow**:
```
1. Founder clicks pencil icon next to "Target User"
2. Inline textarea expands with current value pre-filled
3. Edits: "Freelance designers" → "Mid-size design agencies (10-50 people)"
4. Clicks "Re-evaluate" →
   a. New idea_version created (V2)
   b. Full 4-agent evaluation runs with updated field
   c. Loading skeleton while evaluation runs
   d. Score diff appears inline (same format as psychology layer)
   e. Sidebar score + verdict update automatically
   f. New version appears in Evolution tab
5. "Revert" button to switch back to previous version
```

**Implementation**:
```
1. Create server action: reEvaluateWithChange(ideaId, fieldName, newValue)
   - Creates new idea_version with updated field
   - Runs full evaluation pipeline
   - Updates ideas.currentVersionId
   - Returns: old score, new score, per-dimension deltas
2. Create InlineEditField.tsx component
   - Display mode: text + pencil icon
   - Edit mode: textarea + "Re-evaluate" / "Cancel" buttons
   - Loading mode: skeleton while evaluation runs
   - Result mode: score diff badges (reuse ScoreDiffCard from Phase A)
3. Add inline edit fields to OverviewTab.tsx for each intake field
4. Wire sidebar score refresh after re-evaluation completes
```

### C.2 Idea Comparison (Multi-Idea View) — ~0.5 day

**Why**: Founders have 3-5 ideas. This answers "Which idea should I build?" Half a day of work using data that already exists.

**Comparison data (zero new AI calls needed):**

| Row | Data Source |
|---|---|
| Forge Score | `evaluations.totalScore` |
| Verdict | `evaluations.verdict` |
| 6 Dimension Scores | `evaluations.scoreBreakdown` — bar chart per dimension |
| Radar Chart Overlay | All 6 dimensions on one radar (Recharts) |
| Risk Profile | `evaluations.riskProfile` — side-by-side risk badges |
| Executive Summary | `evaluations.executiveSummary` — truncated with expand |
| AI Recommendation | Optional: single LLM call — "Build Idea B because..." |

**UI**:
- Dashboard: checkbox on each idea card → "Compare (N)" floating button when 2+ selected
- Route: `app/dashboard/compare/page.tsx`
- Full-width comparison grid, each column = one idea, color-coded cells
- Top: overlaid radar chart with one series per idea
- Bottom: optional AI recommendation paragraph

**Implementation**:
```
1. Create ComparisonView.tsx in app/dashboard/components/
2. Create ComparisonRadarChart.tsx (multi-series Recharts radar)
3. Add selection checkboxes to dashboard idea cards
4. Create route: app/dashboard/compare/page.tsx
5. (Optional) AI recommendation: single LLM call
```

---

## Phase D — Report Export + Shareable Link (~2-2.5 days)

**Why together**: Export and share both need the same rendering logic — structured report formatting. Build the formatter once, use it for downloads AND public pages.

### D.1 Report Export (~1 day)

**What gets exported** (all data already exists):

| Section | Data Source |
|---|---|
| **Cover** | Idea title, version, date, Forge Score, Verdict |
| **Executive Summary** | `evaluations.executiveSummary` |
| **Score Breakdown** | 6 dimensions with scores, weights, analysis from `scoreBreakdown` |
| **Risk Profile** | 4 risks with levels, scores, reasoning from `riskProfile` |
| **Competitive Landscape** | From `competitiveLandscape` + `competitorProfiles` (Phase A) |
| **Strategic Analysis** | Strengths, weaknesses from `strategicAnalysis` |
| **Recommended Next Steps** | Actionable list from `recommendedNextSteps` |
| **MVP Plan** (if generated) | Hypothesis, kill condition, features, build order, timeline |
| **Feature Lab Results** (if any) | Feature name, recommendation, net score impact |
| **Appendix: Raw Intake** | Founder's original answers |

**Export formats (ship immediately — zero dependencies):**

| Format | How |
|---|---|
| **Markdown (.md)** | Server-side string generation → Blob download |
| **JSON (.json)** | Raw structured data dump |
| **Clipboard** | One-click copy of markdown version |

**UI**: "Export Report" dropdown button in Overview tab header. Immediate download. Toast: "Report downloaded as forge-report-v1.md"

**Implementation**:
```
1. Create lib/export/format-report.ts
   - formatAsMarkdown(idea, evaluation, mvpPlan?, simulations?) → string
   - formatAsJSON(idea, evaluation, mvpPlan?, simulations?) → object
2. Create lib/export/download.ts
   - downloadFile(content, filename, mimeType)
   - copyToClipboard(content)
3. Create ExportDropdown.tsx component
4. Add to OverviewTab.tsx header
```

### D.2 Shareable Report Link (~1-1.5 days)

**Why**: Growth engine. Every shared link is a free marketing page. The output IS the marketing.

**Data model** — add to `evaluations`:

| Attribute | Type | Required | Description |
|---|---|---|---|
| `shareId` | string(255) | ❌ | Unique public share token (nanoid). Null = not shared. |
| `isPublic` | boolean | ❌ | Whether publicly accessible. Default false. |

**Share flow**:
1. Founder clicks "Share Report" in Overview tab
2. Generates `shareId`, sets `isPublic = true`, saves to Appwrite
3. Modal shows public URL + copy button
4. Toggle to revoke access

**Public report page** — `app/report/[shareId]/page.tsx`:
- Server-rendered, no auth required
- Shows: Forge branding, idea title, score circle, verdict, 6-dimension bars, risk cards, executive summary, next steps
- Does NOT show: raw AI data, founder's personal answers, chat history, MVP plan (keep behind auth wall)
- Footer CTA: "Have an idea? Find out if it's worth building. →"
- OG meta tags: "Forge Evaluation: [Title] — Score: 78/100 — REFINE"
- Subtle watermark: "Evaluated with Forge" — this is distribution

**Implementation**:
```
1. Add shareId and isPublic attributes to evaluations collection
2. Create app/actions/share.ts
   - generateShareLink(evaluationId) → creates shareId, returns URL
   - toggleShareLink(evaluationId, isPublic)
   - getPublicReport(shareId) → fetches without auth
3. Create app/report/[shareId]/page.tsx (server component)
4. Create PublicReportLayout.tsx (branded header/footer/CTA)
5. Add ShareButton.tsx to OverviewTab.tsx header
6. Add OG meta tags for rich link previews
```

---

## Execution Summary

```
Phase A: Conversational Core ........... ~5-6 days
  ├── A1: Chat data model + collections .. 0.5 day
  ├── A2: API route + streaming .......... 0.5 day
  ├── A3: Chat UI components ............. 1.5 days
  ├── A4: 3 tools (re_eval, refine, update) 1.5 days
  ├── A5: Psychology layer + context ...... 0.5 day
  ├── A6: MVP checkboxes + progress bar .. 0.5 day
  └── A7: Competitor profile prompts + UI  0.5 day

  ── VALIDATE ── measure metrics before continuing ──

Phase B: Evolution Timeline ............ ~2 days
  ├── B1: VersionTimeline component ...... 0.5 day
  ├── B2: ScoreComparisonPanel ........... 0.5 day
  ├── B3: EvolutionChart (Recharts) ...... 0.5 day
  └── B4: AI diff summaries .............. 0.5 day

Phase C: Quick Re-Eval + Comparison .... ~1.5 days
  ├── C1: InlineEditField + reEvaluate ... 1 day
  └── C2: ComparisonView + radar chart ... 0.5 day

Phase D: Export + Share ................ ~2-2.5 days
  ├── D1: Report formatters + download ... 0.5 day
  ├── D2: ExportDropdown UI .............. 0.5 day
  ├── D3: Share link backend ............. 0.5 day
  ├── D4: Public report page + OG tags ... 0.5 day
  └── D5: ShareButton UI ................ 0.5 day
```

**Total: ~11-12 days of focused work for the complete core product.**

---

## Deferred Features & Why

These features are intentionally delayed. Each has a specific trigger for when to build it.

---

### Deferred: `fetch_competitor_data` Tool

**What**: Formal assistant tool that searches for competitors via external API (Tavily/Serper).

**Why deferred**: The model answers competitor questions conversationally from its training data without a tool. Adding a tool increases latency (search API round-trip), token cost (formatting search results), and routing complexity (more tools = more routing errors). The free Tier 1 competitor profiles from the enhanced Market Agent prompt (Phase A) cover 80% of the need.

**Build when**: Founders explicitly request fresher/more detailed competitor data, or when conversational answers about competitors are consistently insufficient. Or when budget allows Tavily ($0.01/search).

**Effort when ready**: ~1 day.

---

### Deferred: `find_resources` Tool

**What**: Formal assistant tool that returns curated articles, guides, and frameworks.

**Why deferred**: Purely conversational. The model already knows YC Startup Library, First Round Review, Lenny's Newsletter, Paul Graham essays, etc. A tool adds no value over a normal response. Only justify formalizing this if you build a proprietary resource database.

**Build when**: Never, unless you build a proprietary resource database worth searching.

---

### Deferred: Interactive MVP Change Requests

**What**: Founder clicks "Request Change" on an MVP task → describes change → AI analyzes impact on scope/timeline/dependencies → returns structured report → founder accepts/rejects → task updates.

**Why deferred**: Complex flow (textarea → AI call → structured report → accept/reject → update) that only matters if founders actively use the basic checkboxes. If nobody checks tasks, nobody will request changes. Validate checkbox usage first.

**Build when**: Phase A validation shows >50% of founders with MVP plans are checking items (>3 items checked). If usage is low, the MVP tab needs a different approach entirely.

**Effort when ready**: ~1-1.5 days.

---

### Deferred: Competitor Intelligence Search API (Tavily)

**What**: Real-time search during evaluation — 3-5 searches per idea, AI synthesizes results into competitor cards with real URLs, funding data, current status.

**Why deferred**: Adds API cost ($0.01/search × 3-5 × every evaluation), external dependency, and latency to the evaluation pipeline. The Market Agent prompt enhancement (Phase A) generates good profiles for free.

**Build when**: Founders frequently ask the assistant about competitors AND the conversational answers aren't satisfying. Or competitor profile cards in the UI get high click rates.

**Effort when ready**: ~1 day.

---

### Deferred: Pitch Deck Generator

**What**: AI generates a structured pitch narrative mapped to standard slides (Problem → Solution → Why Now → Market → etc.), exportable as markdown/PDF.

**Why deferred**: High marketing value but low daily usage. A founder generates one pitch deck, maybe edits once, never returns. Doesn't serve the core loop. Also depends on solid evaluation data, MVP plan, and competitor profiles — benefits from being built last. Landing page already promises it ("Structured Pitch Deck" in WhatYouGet) so it needs to ship eventually, but not this cycle.

**Build when**: After Phase D ships and you need a marketing differentiator to justify premium pricing. Or when landing page visitors specifically cite pitch decks as the reason they signed up.

**Effort when ready**: ~1-2 days.

---

### Deferred: PDF Export

**What**: Styled, branded PDF reports via `@react-pdf/renderer` with Forge logo, color-coded scores, clean typography.

**Why deferred**: Requires new dependency. Markdown and JSON exports cover the need. PDF is what advisors/investors want — but founders at the "evaluating ideas" stage usually aren't talking to investors yet.

**Build when**: Founders ask for PDF specifically, or when you add premium features (PDF = Pro tier gating opportunity).

**Effort when ready**: ~0.5-1 day.

---

### Deferred: Notion / Google Docs Export

**What**: Push report as a Notion page or Google Doc via their APIs.

**Why deferred**: Requires OAuth integration with external services. High complexity for niche audience. Markdown copy/paste handles this adequately.

**Build when**: User research shows significant demand from Notion/Docs power users.

---

### Deferred: Weekly Re-Evaluation Nudge

**What**: Automated notification: "Your idea hasn't been refined in 14 days. Want to revisit your assumptions?"

**Why deferred**: Requires notification infrastructure (email or in-app). Premature before the core loop is validated. Also risks annoying users if the loop isn't compelling.

**Build when**: After validating that founders who DO return show significantly better outcomes than one-session users.

---

## New Collections Summary (After All Phases)

| Collection | Phase | Purpose |
|---|---|---|
| `ideas` | Existing | Core idea data |
| `idea_versions` | Existing (+ `diffSummary` Phase B) | Version snapshots |
| `evaluations` | Existing (+ `competitorProfiles` Phase A, + `shareId`/`isPublic` Phase D) | AI evaluation results |
| `mvp_plans` | Existing (+ `featureStatuses` Phase A) | MVP plans with task tracking |
| `feature_simulations` | Existing | Feature Lab results |
| `chat_sessions` | Phase A | Conversation session metadata |
| `chat_messages` | Phase A | Individual chat messages + tool calls |

**Total: 7 collections. Only 2 new (chat_sessions, chat_messages). Everything else is attribute additions to existing collections.**

---

## Tab Order (After All Phases)

| # | Tab | Phase |
|---|---|---|
| 1 | Overview | Existing (+ Export/Share from Phase D, + inline edit from Phase C, + competitor cards from Phase A) |
| 2 | AI Assistant | Phase A |
| 3 | Deep Analysis | Existing |
| 4 | Risk Profile | Existing |
| 5 | MVP Plan | Existing (+ checkboxes from Phase A) |
| 6 | Feature Lab | Existing |
| 7 | Evolution | Phase B |

Idea Comparison (Phase C) → standalone dashboard route at `/dashboard/compare`.
Public shareable report (Phase D) → public route at `/report/[shareId]`.

---

## Tech Stack Additions

| Package | Purpose | Phase |
|---|---|---|
| None (existing `ai` SDK) | `useChat()` hook + `streamText()` + tool calling | Phase A |
| `nanoid` (2KB, optional) | Generate short share IDs | Phase D |

**Deferred packages:**

| Package | Purpose | When |
|---|---|---|
| `@react-pdf/renderer` | PDF export | After markdown export validates demand |
| `@tavily/core` | Real-time competitor search | After validating competitor data demand |

**Principle: Zero new dependencies for Phases A-C.** The Vercel AI SDK already supports streaming, tool calling, and structured output. Recharts is already installed. Appwrite handles all persistence.

---

## What This Changes About the Product

**Before**: Founder submits idea → reads report → leaves. One-session tool.

**After**: Founder submits idea → discusses with AI → refines thinking → re-evaluates (sees score diff + what's still weak) → assistant suggests next focus → tweaks inline or via chat → tracks evolution over time → compares against other ideas → shares report with advisor → advisor signs up.

**The identity shift**: From "evaluate" (one-time verb) to "evolve" (ongoing process).

The AI Assistant is the backbone — it's the reason to come back.
The Psychology Layer is the hook — score diffs + proactive suggestions make iteration addictive.
The Evolution Timeline is the reward — visual proof of progress.
The Shareable Link is the growth engine — the output IS the marketing.

Everything else is a surface the assistant can interact with.
