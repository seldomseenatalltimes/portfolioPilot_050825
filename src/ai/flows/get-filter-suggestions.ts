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
    type GetFilterSuggestionsOutput, // Import type for export
    FilterCriteriaSchema, // Import FilterCriteriaSchema to access interval details if needed (e.g., allowed values)
} from '@/types/portfolio';

// --- Define the Genkit prompt ---
// Uses schemas imported from '@/types/portfolio'
const suggestionsPrompt = ai.definePrompt({
  name: 'getFilterSuggestionsPrompt',
  input: { schema: GetFilterSuggestionsInputSchema }, // Use imported schema
  output: { schema: GetFilterSuggestionsOutputSchema }, // Use imported schema
  prompt: `You are a helpful financial assistant. Your task is to suggest filter settings (market capitalization, trading volume, data interval) suitable for different common investment strategies used in portfolio analysis and optimization. The goal is to provide diverse starting points for users with varying risk tolerances and goals.

Provide 3 to 5 diverse suggestions. For each suggestion, include:
1.  A clear 'strategy' name (e.g., "Growth Focus (Higher Risk/Return)", "Balanced Portfolio", "Low Volatility Focus", "Small-Cap Value", "Broad Market Diversification").
2.  A brief 'description' explaining the strategy, its typical risk profile, and the reasoning behind the suggested filters (1-2 sentences).
3.  The specific 'filters' object including:
    *   'marketCapMin': The minimum market capitalization as a **full number** (e.g., 10000000000 for $10 Billion). If no minimum applies (e.g., for broad diversification), the value MUST be exactly \`null\`. **Do not use 0 or omit the field if no minimum applies.**
    *   'volumeMin': The minimum average daily trading volume as a **full number** (e.g., 1000000 for 1 Million) to ensure liquidity. If no specific minimum applies (beyond basic liquidity which might be implied), the value MUST be exactly \`null\`. **Do not use 0 or omit the field if no minimum applies.**
    *   'interval': The recommended data interval as a string. It MUST be one of: "daily", "weekly", "monthly", "quarterly", "yearly", "1y", "2y", "5y", "10y". Choose an interval appropriate for the strategy's typical analysis horizon (e.g., daily/weekly for higher frequency analysis, monthly/yearly for long-term).

Example Output Structure (must follow the JSON schema exactly):
\`\`\`json
{
  "suggestions": [
    {
      "strategy": "Growth Focus (Higher Risk/Return)",
      "description": "Targets companies with high growth potential, often smaller or in volatile sectors. Higher risk tolerance assumed. Daily/Weekly interval for closer monitoring.",
      "filters": {
        "marketCapMin": 500000000,
        "volumeMin": 500000,
        "interval": "daily"
      }
    },
    {
       "strategy": "Balanced Portfolio (Moderate Risk)",
       "description": "Aims for a mix of growth and stability, typically focusing on mid-to-large cap companies. Monthly interval suitable for regular review.",
       "filters": {
         "marketCapMin": 5000000000,
         "volumeMin": 1000000,
         "interval": "monthly"
       }
    },
    {
      "strategy": "Low Volatility Focus",
      "description": "Prioritizes stability and capital preservation, often focusing on large, established companies in defensive sectors. Longer interval suitable for stability analysis.",
      "filters": {
        "marketCapMin": 20000000000,
        "volumeMin": 800000,
        "interval": "monthly"
      }
    },
    {
      "strategy": "Broad Market Diversification",
      "description": "Aims for wide diversification across market caps, suitable for equal weighting or simple index-like approaches. Minimal filters applied.",
      "filters": {
        "marketCapMin": null,
        "volumeMin": 100000,
        "interval": "daily"
      }
    }
    // ... potentially one more suggestion if diverse enough
  ]
}
\`\`\`

Ensure the output strictly adheres to the JSON schema provided for GetFilterSuggestionsOutput.
- 'suggestions' must be an array with 3 to 5 items.
- For 'marketCapMin' and 'volumeMin' in the 'filters' object, provide either a numerical value >= 0 OR the JSON value \`null\`.
- Select 'interval' only from the allowed list: ["daily", "weekly", "monthly", "quarterly", "yearly", "1y", "2y", "5y", "10y"].
- Provide diverse strategies covering different risk profiles or objectives.
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
    // Use the correct prompt variable name 'suggestionsPrompt'
    const { output } = await suggestionsPrompt(input);

    if (!output) {
        throw new Error('AI failed to generate filter suggestions.');
    }

    // Optional: Add extra validation or refinement here if needed
    if (!output.suggestions || output.suggestions.length < 3 || output.suggestions.length > 5) {
         throw new Error(`AI returned an invalid number of suggestions (${output.suggestions?.length ?? 0}). Expected 3-5.`);
    }

    // Explicitly validate nullability and type for marketCapMin/volumeMin as per schema
    output.suggestions.forEach(suggestion => {
      if (typeof suggestion.filters.marketCapMin !== 'number' && suggestion.filters.marketCapMin !== null) {
        throw new Error(`AI returned invalid type for marketCapMin in strategy "${suggestion.strategy}": expected number or null.`);
      }
      if(suggestion.filters.marketCapMin !== null && suggestion.filters.marketCapMin < 0) {
         throw new Error(`AI returned invalid value for marketCapMin in strategy "${suggestion.strategy}": must be >= 0 or null.`);
      }

       if (typeof suggestion.filters.volumeMin !== 'number' && suggestion.filters.volumeMin !== null) {
        throw new Error(`AI returned invalid type for volumeMin in strategy "${suggestion.strategy}": expected number or null.`);
      }
       if(suggestion.filters.volumeMin !== null && suggestion.filters.volumeMin < 0) {
         throw new Error(`AI returned invalid value for volumeMin in strategy "${suggestion.strategy}": must be >= 0 or null.`);
      }
      // Validate interval string against allowed values
      const allowedIntervals: readonly string[] = ["daily", "weekly", "monthly", "quarterly", "yearly", "1y", "2y", "5y", "10y"];
      if (!allowedIntervals.includes(suggestion.filters.interval)) {
         throw new Error(`AI returned invalid interval "${suggestion.filters.interval}" in strategy "${suggestion.strategy}". Allowed values: ${allowedIntervals.join(', ')}`);
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
