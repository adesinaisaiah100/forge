import { analyzeIdea } from './agents/idea-agent';
import { analyzeMarket } from './agents/market-agent';
import { analyzeTiming } from './agents/timing-agent';
import { aggregateAnalysis } from './agents/aggregator';
import { IdeaIntake } from './types';

export async function generateEvaluation(input: IdeaIntake) {
  const runId = Date.now().toString().slice(-4);
  console.log(`[Orchestrator ${runId}] Starting evaluation for: "${input.idea.substring(0, 50)}..."`);
  
  // Step 1: Run specialized agents in parallel
  console.time(`Agents Parallel Execution ${runId}`);
  const [ideaAnalysis, marketAnalysis, timingAnalysis] = await Promise.all([
    analyzeIdea(input),
    analyzeMarket(input),
    analyzeTiming(input),
  ]);
  console.timeEnd(`Agents Parallel Execution ${runId}`);

  // Step 2: Aggregate results
  console.log(`[Orchestrator ${runId}] Aggregating results...`);
  console.time(`Aggregator Execution ${runId}`);
  const finalVerdict = await aggregateAnalysis({
    idea: input,
    ideaAnalysis,
    marketAnalysis,
    timingAnalysis,
  });
  console.timeEnd(`Aggregator Execution ${runId}`);
  console.log(`[Orchestrator ${runId}] Final Verdict:`, JSON.stringify(finalVerdict, null, 2));

  return {
    ...finalVerdict,
    raw_reports: {
      idea: ideaAnalysis,
      market: marketAnalysis,
      timing: timingAnalysis,
    }
  };
}
