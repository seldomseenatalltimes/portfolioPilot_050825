// src/ai/flows/get-filter-suggestions.ts
'use server';
/**
 * @fileOverview Provides AI-generated filter suggestions for investment strategies.
 *
 * - getFilterSuggestions - Function to retrieve filter suggestions.
 * - GetFilterSuggestionsInput - Input type for the flow.
 * - GetFilterSuggestionsOutput - Output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
    GetFilterSuggestionsInputSchema, // Import schema for internal use
    GetFilterSuggestionsOutputSchema, // Import schema for internal use
    type GetFilterSuggestionsInput, // Import type for export
    type GetFilterSuggestionsOutput // Import type for export
} from '@/types/portfolio';

// --- Define the Genkit prompt ---
// Uses schemas imported from '@/types/portfolio'
const suggestionsPrompt = ai.definePrompt({
  name: 'getFilterSuggestionsPrompt',
  input: { schema: GetFilterSuggestionsInputSchema }, // Use imported schema
  output: { schema: GetFilterSuggestionsOutputSchema }, // Use imported schema
  prompt: `You are a helpful financial assistant. Your task is to suggest filter settings for different common investment strategies based on market capitalization, trading volume, and data interval.

Provide 3 to 5 diverse suggestions suitable for a portfolio analysis tool. For each suggestion, include:
1.  A clear 'strategy' name (e.g., "Large-Cap Growth", "Small-Cap Value", "Dividend Focus", "Low Volatility", "Technology Sector").
2.  A brief 'description' explaining the strategy and the reasoning behind the suggested filters (1-2 sentences).
3.  The specific 'filters' object including:
    *   'marketCapMin': The minimum market capitalization as a **full number** (e.g., 10000000000 for $10 Billion). If no minimum applies, the value MUST be exactly \`null\`. **Do not use 0 or omit the field if no minimum applies.**
    *   'volumeMin': The minimum average daily trading volume as a **full number** (e.g., 1000000 for 1 Million). If no minimum applies, the value MUST be exactly \`null\`. **Do not use 0 or omit the field if no minimum applies.**
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
       "strategy": "Income Focus (Any Cap)",
       "description": "Targets established companies paying dividends, often found across various market caps. Liquidity (volume) is still important.",
       "filters": {
         "marketCapMin": null,
         "volumeMin": 500000,
         "interval": "monthly"
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

Ensure the output strictly adheres to the JSON schema provided for GetFilterSuggestionsOutput. For marketCapMin and volumeMin, provide either a numerical value >= 0 OR the JSON value \`null\`. Select intervals only from the allowed list ["daily", "weekly", "monthly", "quarterly", "yearly", "1y", "2y", "5y", "10y"].
`,
});

// --- Define the Genkit flow ---
// Internal type alias for clarity within the flow definition
type GetFilterSuggestionsInputInternal = z.infer<typeof GetFilterSuggestionsInputSchema>;
type GetFilterSuggestionsOutputInternal = z.infer<typeof GetFilterSuggestionsOutputSchema>;

const getFilterSuggestionsFlow = ai.defineFlow(
  {
    name: 'getFilterSuggestionsFlow',
    inputSchema: GetFilterSuggestionsInputSchema, // Use imported schema
    outputSchema: GetFilterSuggestionsOutputSchema, // Use imported schema
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

    // Explicitly validate nullability for marketCapMin/volumeMin as per schema
    output.suggestions.forEach(suggestion => {
      if (typeof suggestion.filters.marketCapMin !== 'number' && suggestion.filters.marketCapMin !== null) {
        throw new Error(`AI returned invalid type for marketCapMin in strategy "${suggestion.strategy}": expected number or null.`);
      }
       if (typeof suggestion.filters.volumeMin !== 'number' && suggestion.filters.volumeMin !== null) {
        throw new Error(`AI returned invalid type for volumeMin in strategy "${suggestion.strategy}": expected number or null.`);
      }
    });


    return output;
  }
);


// --- Exported Function and Types ---

// Exported wrapper function for UI consumption
// Uses the imported TypeScript types for its signature
export async function getFilterSuggestions(input: GetFilterSuggestionsInput): Promise<GetFilterSuggestionsOutput> {
  // Cast the input if necessary, though here it's currently an empty object so it matches
  return getFilterSuggestionsFlow(input as GetFilterSuggestionsInputInternal);
}

// Re-export the input/output types for convenience
export type { GetFilterSuggestionsInput, GetFilterSuggestionsOutput };
