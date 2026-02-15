import { generateText, Output } from 'ai';
import { groq } from '@ai-sdk/groq';
import { timingAnalysisSchema } from '../schemas';
import { IdeaIntake } from '../types';



export const analyzeTiming = async (input: IdeaIntake) => {
  const result = await generateText({
    model: groq('openai/gpt-oss-120b'), // Using Groq for speed/efficiency
    output: Output.object({ schema: timingAnalysisSchema }),
    system: `You are a Venture Capitalist Analyst focused on "Why Now?".
    Your goal is to assess macro trends, technological shifts, and founder-market fit suitability.
    
    Context:
    - Founder's Why Now: ${input.timing}
    - Founder Fit Statement: ${input.founderFit}
    - Current Stage: ${input.stage}
    
    You look for:
    - Tailwind winds (AI, regulatory changes, behavior shifts)
    - Headwinds (legal risks, platform dependence)
    - Founder leverage (why this is the right generic profile to build this)
    
    Be decisive about the timing verdict.`,
    prompt: `Analyze the timing and leverage for this startup idea: "${input.idea}"`,
  });

  if (!result.output) {
      throw new Error("Failed to generate timing analysis");
  }

  return result.output;
};
