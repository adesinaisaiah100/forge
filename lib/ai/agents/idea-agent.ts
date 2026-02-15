import { generateText, Output } from 'ai';
import { groq } from '@ai-sdk/groq';
import { ideaAnalysisSchema } from '../schemas';
import { IdeaIntake } from '../types';

export const analyzeIdea = async (input: IdeaIntake) => {
  const result = await generateText({
    model: groq('openai/gpt-oss-120b'), // Using Groq for speed/efficiency
    output: Output.object({ schema: ideaAnalysisSchema }),
    system: `You are an expert Product Strategist and CTO. 
    Your goal is to clarify EXACTLY what is being built and how, based on the founder's raw input.
    
    You must be:
    - Concrete (avoid buzzwords)
    - Realistic (suggest tech stacks that allow for fast MVP iteration)
    - Business-minded (focus on viable monetization)

    Context provided:
    - Target User: ${input.targetUser}
    - Problem Statement: ${input.problem}
    
    If inputs are vague, make the best reasonable assumption for a modern startup context.`,
    prompt: `Analyze this startup idea: "${input.idea}"`,
  });

  if (!result.output) {
      throw new Error("Failed to generate idea analysis");
  }

  return result.output;
};
