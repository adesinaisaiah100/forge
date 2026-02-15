/**
 * Appwrite Database & Collection IDs
 *
 * Central source of truth for all Appwrite resource IDs.
 * These must match what you create in the Appwrite Console.
 *
 * Setup Guide:
 * 1. Go to Appwrite Console → Databases → Create Database → ID "forge-db"
 * 2. Create collections with the IDs below
 * 3. Add attributes as described in each collection's section
 *
 * ─── Collection: ideas ───
 * userId        string(255)   required
 * title         string(255)   required   — display name for the idea
 * idea          string(5000)  required
 * targetUser    string(2000)  required
 * problem       string(2000)  required
 * alternatives  string(2000)  required
 * timing        string(2000)  required
 * founderFit    string(2000)  required
 * stage         string(100)   required
 * currentVersionId  string(255) optional — points to latest idea_versions.$id
 *
 * ─── Collection: idea_versions ───
 * ideaId            string(255)   required
 * versionNumber     integer       required
 * baseIdeaText      string(5000)  required   — snapshot of the idea text at this version
 * featureList       string(10000) optional   — JSON array of features
 * parentVersionId   string(255)   optional   — null for V1, references prior version
 *
 * ─── Collection: evaluations ───
 * ideaVersionId         string(255)    required
 * totalScore            integer        required
 * verdict               string(10)     required   — GO | REFINE | KILL
 * confidence            integer        required
 * scoreBreakdown        string(10000)  required   — JSON
 * riskProfile           string(10000)  required   — JSON
 * competitiveLandscape  string(5000)   required   — JSON
 * strategicAnalysis     string(5000)   required   — JSON
 * executiveSummary      string(5000)   required
 * recommendedNextSteps  string(5000)   required   — JSON array
 * rawAiResponse         string(50000)  optional   — full raw JSON for debugging
 *
 * ─── Collection: mvp_plans ───
 * ideaVersionId          string(255)    required
 * coreHypothesis         string(2000)   required
 * killCondition          string(2000)   required
 * leanExperiment         string(5000)   required   — JSON
 * featurePrioritization  string(10000)  required   — JSON array
 * whatToIgnore           string(5000)   required   — JSON array
 * buildOrder             string(10000)  required   — JSON array
 * estimatedTimeline      string(255)    required
 * rawAiResponse          string(50000)  optional   — full raw JSON for debugging
 *
 * ─── Collection: feature_simulations ───
 * ideaVersionId          string(255)    required
 * proposedFeature        string(2000)   required   — user's raw feature description
 * featureSummary         string(2000)   required   — AI's cleaned restatement
 * scoreDeltas            string(10000)  required   — JSON: per-pillar before/after/delta/reasoning
 * riskShifts             string(5000)   required   — JSON: per-risk before/after/reasoning
 * netScoreChange         integer        required   — net weighted delta
 * projectedTotalScore    integer        required   — projected total if feature added
 * strategicImpact        string(5000)   required   — summary
 * recommendation         string(50)     required   — Add | Skip | Needs Research
 * recommendationRationale string(5000)  required
 * rawAiResponse          string(50000)  optional   — full raw JSON for debugging
 */

export const DATABASE_ID = "forge-db";

export const COLLECTIONS = {
  IDEAS: "ideas",
  IDEA_VERSIONS: "idea_versions",
  EVALUATIONS: "evaluations",
  MVP_PLANS: "mvp_plans",
  FEATURE_SIMULATIONS: "feature_simulations",
} as const;
