import { generateText, Output } from 'ai';
import { marketAnalysisSchema } from '../schemas';
import { IdeaIntake } from '../types';
import { google } from "@ai-sdk/google";

export const analyzeMarket = async (input: IdeaIntake) => {
  const result = await generateText({
    model: google('gemini-2.5-flash'),
    output: Output.object({ schema: marketAnalysisSchema }),
    system: `You are a ruthless Market Researcher.
    Your goal is to validate if the PROBLEM is real and if the MARKET is accessible.
    
    Context:
    - Target User: ${input.targetUser}
    - Stated Problem: ${input.problem}
    - Known Alternatives: ${input.alternatives}
    
    You must be:
    - Critical (don't sugarcoat saturation)
    - Specific (name actual competitors if they exist)
    - Objective (assess the severity of the pain point honestly)

    Produce BOTH:
    1) existing_alternatives: short competitor + weakness pairs
    2) competitor_profiles: 2-5 structured profiles with threat levels and differentiation notes

    Competitor profile quality bar:
    - Use realistic competitor names and concise descriptions
    - If URL/funding is unknown, return null
    - Keep strengths/weaknesses concrete, not generic
    - threatLevel must reflect direct competitive pressure on this idea
    
    Do not be a "yes-man". If the idea is in a crowded red ocean, say so.`,
    prompt: `Analyze the market for this startup idea: "${input.idea}"`,
  });

  if (!result.output) {
      throw new Error("Failed to generate market analysis");
  }

  return result.output;
};
