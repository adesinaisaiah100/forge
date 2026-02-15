# Hatch — System Architecture & Database Schema

> **Last updated:** February 2026
> A comprehensive reference for the database schema, AI pipeline architecture, data flow, and system design decisions behind Hatch.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Database Architecture](#database-architecture)
   - [Database: `forge-db`](#database-forge-db)
   - [Collection: `ideas`](#collection-ideas)
   - [Collection: `idea_versions`](#collection-idea_versions)
   - [Collection: `evaluations`](#collection-evaluations)
   - [Collection: `mvp_plans`](#collection-mvp_plans)
   - [Collection: `feature_simulations`](#collection-feature_simulations)
4. [Entity Relationship Diagram](#entity-relationship-diagram)
5. [AI Pipeline Architecture](#ai-pipeline-architecture)
   - [Pipeline 1: Idea Evaluation (Orchestrated Agents)](#pipeline-1-idea-evaluation-orchestrated-agents)
   - [Pipeline 2: MVP Generator](#pipeline-2-mvp-generator)
   - [Pipeline 3: Feature Impact Simulator](#pipeline-3-feature-impact-simulator)
6. [Zod Schemas (Structured AI Output)](#zod-schemas-structured-ai-output)
7. [Server Actions (Data Layer)](#server-actions-data-layer)
8. [Data Flow Diagrams](#data-flow-diagrams)
   - [Onboarding → First Evaluation](#onboarding--first-evaluation)
   - [MVP Plan Generation](#mvp-plan-generation)
   - [Feature Simulation](#feature-simulation)
9. [Scoring System](#scoring-system)
10. [TypeScript Type Map](#typescript-type-map)
11. [File Structure Reference](#file-structure-reference)
12. [Appwrite Setup Guide](#appwrite-setup-guide)

---

## System Overview

Hatch is an **iterative decision intelligence system** for startup ideas. It transforms a raw idea through a multi-stage AI pipeline that evaluates, strategizes, and simulates — then persists every result so users can iterate without re-running expensive AI calls.

The core loop:

```
Idea Intake → AI Evaluation → MVP Planning → Feature Simulation → (iterate)
```

Every stage is:
- **Versioned** — linked to a specific `idea_version`
- **Persisted** — stored in Appwrite so results survive page reloads
- **Deterministic** — AI outputs are validated through Zod schemas into structured JSON
- **Additive** — new analyses layer on top of existing ones, never overwrite

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Server components, server actions, routing |
| **Language** | TypeScript (strict) | End-to-end type safety |
| **Database/BaaS** | Appwrite | Document database, auth, session management |
| **AI Runtime** | Vercel AI SDK + Groq | Structured LLM calls with Zod validation |
| **AI Model** | `openai/gpt-oss-120b` (via Groq) | All inference |
| **State** | Zustand | Client-side caching for multi-idea support |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Animations** | Framer Motion | Tab transitions, card reveals |
| **Charts** | Recharts | Radar charts, score visualizations |
| **Schema Validation** | Zod | AI output validation, type inference |

---

## Database Architecture

### Database: `forge-db`

All collections live under a single Appwrite database with ID `forge-db`. Collections are accessed via a centralized config:

```typescript
// lib/appwrite/config.ts
export const DATABASE_ID = "forge-db";

export const COLLECTIONS = {
  IDEAS: "ideas",
  IDEA_VERSIONS: "idea_versions",
  EVALUATIONS: "evaluations",
  MVP_PLANS: "mvp_plans",
  FEATURE_SIMULATIONS: "feature_simulations",
} as const;
```

---

### Collection: `ideas`

**Purpose:** The root entity. Stores everything the user fills in during onboarding.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string(255) | ✅ | Appwrite user ID (owner) |
| `title` | string(255) | ✅ | Display name for the idea |
| `idea` | string(5000) | ✅ | Full idea description |
| `targetUser` | string(2000) | ✅ | Who the product is for |
| `problem` | string(2000) | ✅ | What problem it solves |
| `alternatives` | string(2000) | ✅ | Current alternatives / competitors |
| `timing` | string(2000) | ✅ | Why now? Timing context |
| `founderFit` | string(2000) | ✅ | Founder's background / domain expertise |
| `stage` | string(100) | ✅ | Current stage (e.g., "Just an idea", "Have a prototype") |
| `currentVersionId` | string(255) | ❌ | Points to the latest `idea_versions.$id` |

**Relationships:**
- `1 → N` with `idea_versions` (via `ideaId`)
- `currentVersionId` is a soft FK pointing to the active version

**Created by:** `submitIdea()` server action (called at end of onboarding)

---

### Collection: `idea_versions`

**Purpose:** Immutable snapshots of the idea at a point in time. Enables version-controlled iteration. Every evaluation, MVP plan, and simulation is linked to a specific version.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `ideaId` | string(255) | ✅ | FK → `ideas.$id` |
| `versionNumber` | integer | ✅ | Sequential (1, 2, 3…) |
| `baseIdeaText` | string(5000) | ✅ | Snapshot of the idea text at this version |
| `featureList` | string(10000) | ❌ | JSON array of features added in this version |
| `parentVersionId` | string(255) | ❌ | FK → `idea_versions.$id` (null for V1) |

**Relationships:**
- `N → 1` with `ideas` (via `ideaId`)
- `1 → N` with `evaluations` (via `ideaVersionId`)
- `1 → N` with `mvp_plans` (via `ideaVersionId`)
- `1 → N` with `feature_simulations` (via `ideaVersionId`)
- Self-referential: `parentVersionId` → prior version (enables version chain)

**Version chain:** `V1 (null) ← V2 ← V3 ← ...`

**Created by:** `submitIdea()` creates V1 automatically alongside the idea.

---

### Collection: `evaluations`

**Purpose:** Stores the full AI evaluation result for a specific idea version. Includes scores, risk profile, competitive landscape, strategic analysis, and next steps.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `ideaVersionId` | string(255) | ✅ | FK → `idea_versions.$id` |
| `totalScore` | integer | ✅ | Weighted aggregate score (0–100) |
| `verdict` | string(10) | ✅ | `GO` \| `REFINE` \| `KILL` |
| `confidence` | integer | ✅ | AI confidence in the assessment (0–100) |
| `scoreBreakdown` | string(10000) | ✅ | JSON — per-pillar scores and insights |
| `riskProfile` | string(10000) | ✅ | JSON — per-dimension risk levels |
| `competitiveLandscape` | string(5000) | ✅ | JSON — saturation, differentiation, positioning |
| `strategicAnalysis` | string(5000) | ✅ | JSON — strengths and weaknesses |
| `executiveSummary` | string(5000) | ✅ | Plain text executive summary |
| `recommendedNextSteps` | string(5000) | ✅ | JSON array of actionable steps |
| `rawAiResponse` | string(50000) | ❌ | Full raw JSON for debugging |

**JSON field: `scoreBreakdown`:**
```json
{
  "problem_strength": { "score": 78, "insight": "..." },
  "market_opportunity": { "score": 65, "insight": "..." },
  "differentiation_strength": { "score": 52, "insight": "..." },
  "timing_readiness": { "score": 70, "insight": "..." },
  "founder_leverage": { "score": 45, "insight": "..." },
  "execution_feasibility": { "score": 60, "insight": "..." }
}
```

**JSON field: `riskProfile`:**
```json
{
  "market_risk": { "level": "medium", "score": 55, "reason": "..." },
  "execution_risk": { "level": "high", "score": 72, "reason": "..." },
  "timing_risk": { "level": "low", "score": 30, "reason": "..." },
  "technical_risk": { "level": "medium", "score": 48, "reason": "..." }
}
```

**Created by:** `saveEvaluation()` server action (called after AI pipeline completes)

---

### Collection: `mvp_plans`

**Purpose:** Stores the AI-generated MVP plan for a specific idea version. Designed around lean methodology — hypothesis, kill condition, experiment design, feature prioritization.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `ideaVersionId` | string(255) | ✅ | FK → `idea_versions.$id` |
| `coreHypothesis` | string(2000) | ✅ | The riskiest assumption to validate |
| `killCondition` | string(2000) | ✅ | Measurable signal to abandon the idea |
| `leanExperiment` | string(5000) | ✅ | JSON — experiment description, duration, success/failure metrics |
| `featurePrioritization` | string(10000) | ✅ | JSON array — MoSCoW prioritized features |
| `whatToIgnore` | string(5000) | ✅ | JSON array — things to skip |
| `buildOrder` | string(10000) | ✅ | JSON array — ordered build steps |
| `estimatedTimeline` | string(255) | ✅ | e.g., "3-4 weeks" |
| `rawAiResponse` | string(50000) | ❌ | Full raw JSON for debugging |

**JSON field: `leanExperiment`:**
```json
{
  "description": "Build a landing page with signup form...",
  "duration": "2 weeks",
  "success_metric": "10% signup-to-activation rate",
  "failure_metric": "Less than 3% after 500 visitors"
}
```

**JSON field: `featurePrioritization`:**
```json
[
  {
    "feature": "User onboarding flow",
    "priority": "Must Have",
    "rationale": "Cannot test without users being able to sign up",
    "effort_estimate": "Days"
  },
  {
    "feature": "Analytics dashboard",
    "priority": "Ignore",
    "rationale": "Not needed to validate core hypothesis",
    "effort_estimate": "Weeks"
  }
]
```

**JSON field: `buildOrder`:**
```json
[
  { "step": 1, "action": "Set up landing page", "rationale": "First touchpoint for validation" },
  { "step": 2, "action": "Implement core feature X", "rationale": "Directly tests hypothesis" }
]
```

**Created by:** `createMVPPlan()` server action (user-triggered from MVP tab)

---

### Collection: `feature_simulations`

**Purpose:** Stores hypothetical feature impact simulations. Each record represents "what would happen if we added feature X?" — without creating a new version.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `ideaVersionId` | string(255) | ✅ | FK → `idea_versions.$id` |
| `proposedFeature` | string(2000) | ✅ | User's raw feature description |
| `featureSummary` | string(2000) | ✅ | AI's cleaned restatement |
| `scoreDeltas` | string(10000) | ✅ | JSON — per-pillar before/after/delta/reasoning |
| `riskShifts` | string(5000) | ✅ | JSON — per-risk before/after/reasoning |
| `netScoreChange` | integer | ✅ | Net weighted score delta |
| `projectedTotalScore` | integer | ✅ | Projected total if feature is added |
| `strategicImpact` | string(5000) | ✅ | Summary of overall impact |
| `recommendation` | string(50) | ✅ | `Add` \| `Skip` \| `Needs Research` |
| `recommendationRationale` | string(5000) | ✅ | Why this recommendation |
| `rawAiResponse` | string(50000) | ❌ | Full raw JSON for debugging |

**JSON field: `scoreDeltas`:**
```json
{
  "problem_strength": { "before": 78, "after": 82, "delta": 4, "reasoning": "..." },
  "market_opportunity": { "before": 65, "after": 63, "delta": -2, "reasoning": "..." },
  "differentiation_strength": { "before": 52, "after": 68, "delta": 16, "reasoning": "..." },
  "timing_readiness": { "before": 70, "after": 70, "delta": 0, "reasoning": "..." },
  "founder_leverage": { "before": 45, "after": 40, "delta": -5, "reasoning": "..." },
  "execution_feasibility": { "before": 60, "after": 50, "delta": -10, "reasoning": "..." }
}
```

**JSON field: `riskShifts`:**
```json
{
  "market_risk": { "before": "medium", "after": "medium", "reasoning": "..." },
  "execution_risk": { "before": "high", "after": "critical", "reasoning": "..." },
  "timing_risk": { "before": "low", "after": "low", "reasoning": "..." },
  "technical_risk": { "before": "medium", "after": "high", "reasoning": "..." }
}
```

**Created by:** `simulateFeature()` server action (user-triggered from Feature Lab tab)

---

## Entity Relationship Diagram

```
┌──────────────────────┐
│       ideas          │
│──────────────────────│
│ $id (PK)             │
│ userId               │
│ title                │
│ idea                 │
│ targetUser           │
│ problem              │
│ alternatives         │
│ timing               │
│ founderFit           │
│ stage                │
│ currentVersionId ────┼──────────┐
└──────────┬───────────┘          │
           │ 1:N                  │
           ▼                      │
┌──────────────────────┐          │
│   idea_versions      │◄─────────┘
│──────────────────────│
│ $id (PK)             │
│ ideaId (FK→ideas)    │
│ versionNumber        │
│ baseIdeaText         │
│ featureList (JSON)   │
│ parentVersionId (FK) ─── self-ref (version chain)
└──────────┬───────────┘
           │ 1:N  (one version can have one of each + many simulations)
           │
     ┌─────┼──────────────────┐
     ▼     ▼                  ▼
┌──────────┐ ┌──────────┐ ┌────────────────────┐
│evaluations│ │mvp_plans │ │feature_simulations │
│──────────│ │──────────│ │────────────────────│
│ $id      │ │ $id      │ │ $id                │
│ version  │ │ version  │ │ versionId          │
│ FK       │ │ FK       │ │ proposedFeature    │
│ score    │ │ hypothesis│ │ scoreDeltas (JSON) │
│ verdict  │ │ killCond │ │ riskShifts (JSON)  │
│ breakdown│ │ experiment│ │ netScoreChange     │
│ risks    │ │ features │ │ recommendation     │
│ ...      │ │ ...      │ │ ...                │
└──────────┘ └──────────┘ └────────────────────┘
  (1 per ver)  (1 per ver)    (N per version)
```

**Cardinality:**
- `ideas` → `idea_versions`: **1:N** (one idea, many versions)
- `idea_versions` → `evaluations`: **1:1** (one evaluation per version, latest wins)
- `idea_versions` → `mvp_plans`: **1:1** (one MVP plan per version, latest wins)
- `idea_versions` → `feature_simulations`: **1:N** (many simulations per version)

---

## AI Pipeline Architecture

Hatch uses three distinct AI pipelines, each with a different architecture:

### Pipeline 1: Idea Evaluation (Orchestrated Agents)

**Architecture:** Parallel multi-agent → aggregator

```
User Input (IdeaIntake)
        │
        ▼
   ┌────┼────┐
   ▼    ▼    ▼         (run in parallel via Promise.all)
┌──────┐┌──────┐┌──────┐
│ Idea ││Market││Timing│
│Agent ││Agent ││Agent │
└──┬───┘└──┬───┘└──┬───┘
   │       │       │
   ▼       ▼       ▼
┌──────────────────────┐
│     Aggregator       │  ← Synthesizes 3 reports into final verdict
│  (weighted scoring)  │
└──────────┬───────────┘
           ▼
   CompleteEvaluation
   (score + verdict + risks + strategy)
```

**Files:**
- `lib/ai/agents/idea-agent.ts` — Product categorization, value prop, tech stack, monetization
- `lib/ai/agents/market-agent.ts` — Problem severity, saturation, competitors, differentiation
- `lib/ai/agents/timing-agent.ts` — Macro forces, founder fit, why-now
- `lib/ai/agents/aggregator.ts` — Final scoring, risk profile, strategic analysis
- `lib/ai/orchestrator.ts` — Coordinates parallel execution + aggregate call
- `lib/ai/weights.ts` — Pillar weights for scoring

**Model:** `groq("openai/gpt-oss-120b")` via Vercel AI SDK

**Output validation:** Each agent uses Zod schemas for structured output (`Output.object({ schema })`)

### Pipeline 2: MVP Generator

**Architecture:** Single structured LLM call (not an agent)

```
StoredEvaluation + Idea Context
        │
        ▼
┌──────────────────────┐
│   MVP Generator      │  ← Auto-detects weakest pillar + highest risk
│   (single LLM call)  │
└──────────┬───────────┘
           ▼
      MVPPlan (Zod-validated)
```

**Files:**
- `lib/ai/pipelines/mvp-generator.ts` — Prompt construction + structured call
- `lib/ai/schemas.ts` — `mvpPlanSchema`

**Key behavior:**
- Automatically identifies the weakest scoring pillar and highest risk from the evaluation
- Designs the MVP to test the highest-risk assumption first
- Features default to "Ignore" unless they directly validate the core hypothesis

### Pipeline 3: Feature Impact Simulator

**Architecture:** Single structured LLM call

```
StoredEvaluation + Proposed Feature
        │
        ▼
┌──────────────────────┐
│  Feature Simulator   │  ← Simulates per-pillar delta + risk shifts
│  (single LLM call)   │
└──────────┬───────────┘
           ▼
   FeatureSimulation (Zod-validated)
```

**Files:**
- `lib/ai/pipelines/feature-simulator.ts` — Prompt construction + structured call
- `lib/ai/schemas.ts` — `featureSimulationSchema`

**Key behavior:**
- Receives the current evaluation scores as explicit "before" values
- LLM is instructed that "before" values MUST match current scores exactly
- Uses actual evaluation weights for net score calculation
- Temperature set to 0.3 for more deterministic output
- Recommendation must be justified: "Add" only if net positive AND no critical new risks

---

## Zod Schemas (Structured AI Output)

All AI pipeline outputs are validated through Zod schemas. The AI SDK uses `Output.object({ schema })` to force the LLM to produce valid JSON matching the schema.

| Schema | Pipeline | Key Fields |
|--------|----------|------------|
| `ideaAnalysisSchema` | Idea Agent | category, industry, value prop, tech stack, monetization |
| `marketAnalysisSchema` | Market Agent | problem severity, saturation, competitors, differentiation |
| `timingAnalysisSchema` | Timing Agent | tailwinds, headwinds, founder fit, why-now |
| `aggregatorRawSchema` | Aggregator | scores, risks, competitive landscape, strategy, summary |
| `evaluationResultSchema` | Final output | overall assessment + all breakdown fields |
| `mvpPlanSchema` | MVP Generator | hypothesis, kill condition, experiment, features, build order |
| `featureSimulationSchema` | Feature Simulator | score deltas, risk shifts, net change, recommendation |

All schemas live in `lib/ai/schemas.ts`. Types are inferred via `z.infer<typeof schema>`.

---

## Server Actions (Data Layer)

All database operations go through Next.js server actions. No direct client → Appwrite calls for data mutation.

### `app/actions/ideas.ts`

| Function | Purpose | Creates |
|----------|---------|---------|
| `submitIdea(input)` | Creates idea + V1 version | `ideas` + `idea_versions` docs |
| `getUserIdeas()` | Lists all user's ideas | — |
| `getUserIdea()` | Gets latest single idea (backwards compat) | — |
| `getIdeaWithVersions(id)` | Fetches idea + versions + evaluation + MVP plan + simulations | — |
| `saveEvaluation(versionId, eval)` | Persists AI evaluation result | `evaluations` doc |
| `getEvaluation(versionId)` | Fetches stored evaluation | — |

### `app/actions/ai.ts`

| Function | Purpose |
|----------|---------|
| `runEvaluation(input)` | Runs full 4-agent AI pipeline |

### `app/actions/mvp.ts`

| Function | Purpose | Creates |
|----------|---------|---------|
| `createMVPPlan(versionId, ...)` | Fetches eval → runs MVP pipeline → persists | `mvp_plans` doc |
| `getMVPPlan(versionId)` | Fetches stored MVP plan | — |

### `app/actions/features.ts`

| Function | Purpose | Creates |
|----------|---------|---------|
| `simulateFeature(versionId, ..., feature)` | Fetches eval → runs simulation → persists | `feature_simulations` doc |
| `getFeatureSimulations(versionId)` | Fetches all simulations for a version | — |

**Data serialization pattern:** All server actions use `toPlain*()` helper functions to strip Appwrite class instances into plain serializable objects (required for Next.js server→client boundary). JSON fields stored as strings in Appwrite are parsed on read.

---

## Data Flow Diagrams

### Onboarding → First Evaluation

```
User fills onboarding form
        │
        ▼
submitIdea() ─── creates ideas doc + idea_versions V1 doc
        │           └── updates ideas.currentVersionId
        ▼
Redirect → /dashboard/ideas/[id]
        │
        ▼
Page (server component):
  1. getIdeaWithVersions(id)  ← fetches idea + versions + eval + mvp + sims
  2. No evaluation found? → runEvaluation(input)
  3. AI pipeline runs (4 agents in parallel → aggregator)
  4. saveEvaluation(versionId, result)  ← persists to evaluations collection
  5. Pass data to <IdeaWorkspace> client component
```

### MVP Plan Generation

```
User clicks "Generate MVP Plan" in MVP tab
        │
        ▼
IdeaWorkspace.onGenerate() → dynamic import("@/app/actions/mvp")
        │
        ▼
createMVPPlan(versionId, ideaText, targetUser, problem)
  1. getEvaluation(versionId)  ← must have eval first
  2. generateMVPPlan({...})    ← AI pipeline (single structured call)
     └── Auto-detects weakest pillar + highest risk
  3. databases.createDocument() ← persists to mvp_plans collection
  4. Returns StoredMVPPlan → UI updates via setMvpPlan()
```

### Feature Simulation

```
User types a feature + clicks "Run Simulation" in Feature Lab
        │
        ▼
FeatureLabTab.onSimulate(proposedFeature) → dynamic import("@/app/actions/features")
        │
        ▼
simulateFeature(versionId, ideaText, targetUser, problem, proposedFeature)
  1. getEvaluation(versionId)  ← must have eval first
  2. simulateFeatureImpact({...}) ← AI pipeline (single structured call)
     └── Current scores injected as explicit "before" constraints
  3. databases.createDocument() ← persists to feature_simulations
  4. Returns StoredFeatureSimulation → prepended to simulations list in UI
```

---

## Scoring System

### Pillar Weights

The total score is a weighted average of 6 scoring pillars:

| Pillar | Weight | Description |
|--------|--------|-------------|
| Problem Strength | **25%** | How painful is the problem? |
| Market Opportunity | **20%** | How large & accessible is the market? |
| Differentiation Strength | **20%** | How defensible is the positioning? |
| Timing Readiness | **15%** | Is the macro environment favorable? |
| Founder Leverage | **10%** | Does the founder have an unfair advantage? |
| Execution Feasibility | **10%** | How realistic is building this? |

### Verdict Logic

| Score Range | Verdict | Meaning |
|-------------|---------|---------|
| 70–100 | **GO** | Strong foundation — proceed with confidence |
| 50–69 | **REFINE** | Promising but needs iteration on weak areas |
| 0–49 | **KILL** | Fundamental issues — pivot or abandon |

### Risk Dimensions

Each idea is assessed across 4 risk dimensions:

| Risk | Levels |
|------|--------|
| Market Risk | low \| medium \| high \| critical |
| Execution Risk | low \| medium \| high \| critical |
| Timing Risk | low \| medium \| high \| critical |
| Technical Risk | low \| medium \| high \| critical |

Each risk includes a numeric score (0–100, higher = riskier) and a textual reason.

---

## TypeScript Type Map

All types live in `lib/ai/types.ts`. Here's the mapping between collections and their TypeScript interfaces:

| Collection | TypeScript Interface | Purpose |
|------------|---------------------|---------|
| `ideas` | `IdeaDocument` (extends `IdeaIntake`) | Persisted idea with Appwrite metadata |
| `idea_versions` | `IdeaVersion` | Version snapshot |
| `evaluations` | `StoredEvaluation` | Persisted evaluation |
| `mvp_plans` | `StoredMVPPlan` | Persisted MVP plan |
| `feature_simulations` | `StoredFeatureSimulation` | Persisted simulation result |
| — | `IdeaIntake` | Raw form input (no Appwrite metadata) |
| — | `CompleteEvaluation` | In-memory eval with raw agent reports |
| — | `IdeaWithVersions` | Fully hydrated idea with all relationships |

### `IdeaWithVersions` (aggregate root)

The main data shape passed from server → client:

```typescript
interface IdeaWithVersions extends IdeaDocument {
  versions: IdeaVersion[];
  currentVersion: IdeaVersion | null;
  currentEvaluation: StoredEvaluation | null;
  currentMVPPlan: StoredMVPPlan | null;
  featureSimulations: StoredFeatureSimulation[];
}
```

---

## File Structure Reference

```
lib/
├── ai/
│   ├── agents/
│   │   ├── idea-agent.ts          ← Agent 1: Product intelligence
│   │   ├── market-agent.ts        ← Agent 2: Market validation
│   │   ├── timing-agent.ts        ← Agent 3: Timing & leverage
│   │   └── aggregator.ts          ← Agent 4: Final synthesis
│   ├── pipelines/
│   │   ├── mvp-generator.ts       ← Pipeline 2: MVP plan generation
│   │   └── feature-simulator.ts   ← Pipeline 3: Feature impact simulation
│   ├── orchestrator.ts            ← Coordinates parallel agent execution
│   ├── schemas.ts                 ← All Zod schemas (AI output validation)
│   ├── types.ts                   ← All TypeScript interfaces
│   └── weights.ts                 ← Scoring pillar weights
├── appwrite/
│   ├── config.ts                  ← Database & collection IDs
│   ├── server.ts                  ← Server SDK (admin + session clients)
│   └── client.ts                  ← Browser SDK (OAuth, realtime)
└── stores/
    └── idea-store.ts              ← Zustand store (client-side cache)

app/
├── actions/
│   ├── ideas.ts                   ← CRUD for ideas, versions, evaluations
│   ├── ai.ts                      ← AI evaluation wrapper
│   ├── mvp.ts                     ← MVP plan generation + retrieval
│   └── features.ts                ← Feature simulation + retrieval
└── dashboard/
    └── ideas/
        └── [id]/
            ├── page.tsx           ← Server component (fetch + conditional AI run)
            └── components/
                ├── IdeaWorkspace.tsx ← Main workspace shell (sidebar + tabs)
                └── tabs/
                    ├── OverviewTab.tsx
                    ├── EvaluationTab.tsx
                    ├── RisksTab.tsx
                    ├── MVPTab.tsx
                    └── FeatureLabTab.tsx
```

---

## Appwrite Setup Guide

### 1. Create the Database

Go to Appwrite Console → Databases → Create Database:
- **Database ID:** `forge-db`
- **Name:** Forge DB

### 2. Create Collections

For each collection below, create it with the specified ID, then add all attributes.

#### Collection: `ideas` (ID: `ideas`)
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| userId | String | 255 | Yes | — |
| title | String | 255 | Yes | — |
| idea | String | 5000 | Yes | — |
| targetUser | String | 2000 | Yes | — |
| problem | String | 2000 | Yes | — |
| alternatives | String | 2000 | Yes | — |
| timing | String | 2000 | Yes | — |
| founderFit | String | 2000 | Yes | — |
| stage | String | 100 | Yes | — |
| currentVersionId | String | 255 | No | — |

#### Collection: `idea_versions` (ID: `idea_versions`)
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| ideaId | String | 255 | Yes | — |
| versionNumber | Integer | — | Yes | — |
| baseIdeaText | String | 5000 | Yes | — |
| featureList | String | 10000 | No | — |
| parentVersionId | String | 255 | No | — |

#### Collection: `evaluations` (ID: `evaluations`)
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| ideaVersionId | String | 255 | Yes | — |
| totalScore | Integer | — | Yes | — |
| verdict | String | 10 | Yes | — |
| confidence | Integer | — | Yes | — |
| scoreBreakdown | String | 10000 | Yes | — |
| riskProfile | String | 10000 | Yes | — |
| competitiveLandscape | String | 5000 | Yes | — |
| strategicAnalysis | String | 5000 | Yes | — |
| executiveSummary | String | 5000 | Yes | — |
| recommendedNextSteps | String | 5000 | Yes | — |
| rawAiResponse | String | 50000 | No | — |

#### Collection: `mvp_plans` (ID: `mvp_plans`)
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| ideaVersionId | String | 255 | Yes | — |
| coreHypothesis | String | 2000 | Yes | — |
| killCondition | String | 2000 | Yes | — |
| leanExperiment | String | 5000 | Yes | — |
| featurePrioritization | String | 10000 | Yes | — |
| whatToIgnore | String | 5000 | Yes | — |
| buildOrder | String | 10000 | Yes | — |
| estimatedTimeline | String | 255 | Yes | — |
| rawAiResponse | String | 50000 | No | — |

#### Collection: `feature_simulations` (ID: `feature_simulations`)
| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| ideaVersionId | String | 255 | Yes | — |
| proposedFeature | String | 2000 | Yes | — |
| featureSummary | String | 2000 | Yes | — |
| scoreDeltas | String | 10000 | Yes | — |
| riskShifts | String | 5000 | Yes | — |
| netScoreChange | Integer | — | Yes | — |
| projectedTotalScore | Integer | — | Yes | — |
| strategicImpact | String | 5000 | Yes | — |
| recommendation | String | 50 | Yes | — |
| recommendationRationale | String | 5000 | Yes | — |
| rawAiResponse | String | 50000 | No | — |

### 3. Set Permissions

For each collection, set permissions to allow authenticated users to CRUD their own documents:
- **Role:** `users` → Read, Create
- **Document-level:** Use Appwrite's document security with `userId` checks in server actions

### 4. Create Indexes (Recommended)

| Collection | Index | Attributes | Type |
|------------|-------|------------|------|
| ideas | `userId_idx` | `userId` | Key |
| idea_versions | `ideaId_idx` | `ideaId` | Key |
| evaluations | `versionId_idx` | `ideaVersionId` | Key |
| mvp_plans | `versionId_idx` | `ideaVersionId` | Key |
| feature_simulations | `versionId_idx` | `ideaVersionId` | Key |
