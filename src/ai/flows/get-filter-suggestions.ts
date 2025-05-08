// src/ai/flows/get-filter-suggestions.ts
'use server';
/**
 * @fileOverview Provides AI-generated filter suggestions for investment strategies.
 *
 * - getFilterSuggestions - Function to retrieve filter suggestions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FilterCriteria } from '@/types/portfolio'; // Import base type for internal use

// --- Internal Schema Definitions ---

// Base schema matching the FilterCriteria type, including nullable numbers
const FilterCriteriaSchema = z.object({
  marketCapMin: z.number().positive().nullable().describe('The minimum market capitalization as a full number (e.g., 10000000000 for $10 Billion, 500000000 for $500 Million). Use null if not applicable.'),
  volumeMin: z.number().positive().nullable().describe('The minimum average daily trading volume as a full number (e.g., 1000000 for 1 Million, 500000 for 500k). Use null if not applicable.'),
  interval: z.enum([
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
    "1y",
    "2y",
    "5y",
    "10y",
  ]).describe('The suggested data interval (must be one of the listed values).'),
});

// Define the input schema (currently empty, can be extended later)
const GetFilterSuggestionsInputSchema = z.object({
  // Optional fields like riskTolerance, goals could be added here
});
// Input type used internally by the flow
type GetFilterSuggestionsInputInternal = z.infer<typeof GetFilterSuggestionsInputSchema>;


// Define the schema for a single suggestion
// Exporting this specifically for type inference in src/types/portfolio.ts
export const SuggestedFilterSchema = z.object({
  strategy: z.string().describe('Name of the investment strategy (e.g., Large-Cap Growth, Small-Cap Value).'),
  description: z.string().describe('A brief explanation of the strategy and why these filters are suggested.'),
  filters: FilterCriteriaSchema.describe('The suggested filter values for this strategy. Ensure marketCapMin and volumeMin are full numbers or null.'),
});


// Define the output schema containing an array of suggestions
// Exporting this specifically for type inference in src/types/portfolio.ts
export const GetFilterSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestedFilterSchema).min(3).max(5).describe('An array of 3-5 diverse investment strategy filter suggestions.'),
});
// Output type used internally by the flow
type GetFilterSuggestionsOutputInternal = z.infer<typeof GetFilterSuggestionsOutputSchema>;

// --- End Internal Schema Definitions ---


// Define the Genkit prompt
const suggestionsPrompt = ai.definePrompt({
  name: 'getFilterSuggestionsPrompt',
  input: { schema: GetFilterSuggestionsInputSchema },
  output: { schema: GetFilterSuggestionsOutputSchema },
  prompt: `You are a helpful financial assistant. Your task is to suggest filter settings for different common investment strategies based on market capitalization, trading volume, and data interval.

Provide 3 to 5 diverse suggestions suitable for a portfolio analysis tool. For each suggestion, include:
1.  A clear 'strategy' name (e.g., "Large-Cap Growth", "Small-Cap Value", "Dividend Focus", "Low Volatility", "Technology Sector").
2.  A brief 'description' explaining the strategy and the reasoning behind the suggested filters (1-2 sentences).
3.  The specific 'filters' object including:
    *   'marketCapMin': The minimum market capitalization as a **full number** (e.g., 10000000000 for $10 Billion, 500000000 for $500 Million). Use \`null\` if no minimum is typically applied for the strategy.
    *   'volumeMin': The minimum average daily trading volume as a **full number** (e.g., 1000000 for 1 Million, 500000 for 500k). Use \`null\` if no minimum is typically applied.
    *   'interval': The recommended data interval (must be one of: "daily", "weekly", "monthly", "quarterly", "yearly", "1y", "2y", "5y", "10y"). Choose an interval appropriate for the strategy's time horizon (e.g., daily/weekly for short-term, monthly/yearly for long-term).

Example Output Structure (must follow the JSON schema exactly):
\`\`\`json
{
  "suggestions": [
    {
      "strategy": "Large-Cap Growth",
      "description": "Focuses on large companies expected to grow faster than the market. Requires significant market cap and trading volume for stability and liquidity.",
      "filters": {
        "marketCapMin": 10000000000,
        "volumeMin": 1000000,
        "interval": "daily"
      }
    },
    {
      "strategy": "Small-Cap Value",
      "description": "Targets smaller companies potentially undervalued by the market. Lower market cap threshold, volume might be less critical.",
      "filters": {
        "marketCapMin": 300000000,
        "volumeMin": 200000,
        "interval": "weekly"
      }
    }
    // ... more suggestions (total 3-5)
  ]
}
\`\`\`

Ensure the output strictly adheres to the JSON schema provided for GetFilterSuggestionsOutput. Only provide numerical values or \`null\` for marketCapMin and volumeMin. Select intervals from the allowed list.
`,
});

// Define the Genkit flow
const getFilterSuggestionsFlow = ai.defineFlow(
  {
    name: 'getFilterSuggestionsFlow',
    inputSchema: GetFilterSuggestionsInputSchema,
    outputSchema: GetFilterSuggestionsOutputSchema,
  },
  async (input: GetFilterSuggestionsInputInternal): Promise<GetFilterSuggestionsOutputInternal> => {
    const { output } = await suggestionsPrompt(input);

    if (!output) {
        throw new Error('AI failed to generate filter suggestions.');
    }

    // Optional: Add extra validation or refinement here if needed
    if (!output.suggestions || output.suggestions.length === 0) {
         throw new Error('AI returned no suggestions.');
    }

    return output;
  }
);

// Import the correct types from the shared types file for the exported function signature
import type { GetFilterSuggestionsInput, GetFilterSuggestionsOutput } from '@/types/portfolio';

// Exported wrapper function for UI consumption
export async function getFilterSuggestions(input: GetFilterSuggestionsInput): Promise<GetFilterSuggestionsOutput> {
  // Cast the input if necessary, though here it's currently an empty object so it matches
  return getFilterSuggestionsFlow(input as GetFilterSuggestionsInputInternal);
}
