// src/types/portfolio.ts
import { z } from 'zod'; // Import Zod here

// Represents raw data from uploaded CSV/TXT files
export interface TickerData {
  ticker: string;
  [key: string]: any; // Allow other CSV fields
}

// --- Filter Criteria Schemas and Types ---

// Define the allowed interval values explicitly for string validation/description
const allowedIntervals = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
    "1y",
    "2y",
    "5y",
    "10y",
] as const; // Use 'as const' for literal types

// Base schema matching the FilterCriteria type, including nullable numbers
// Used internally by AI flow and form validation.
// Changed interval from z.enum to z.string with described allowed values.
export const FilterCriteriaSchema = z.object({
  marketCapMin: z.number().min(0).nullable().describe('Minimum market capitalization (e.g., 10000000000 for $10B). MUST be a number >= 0 or exactly `null`.'),
  volumeMin: z.number().min(0).nullable().describe('Minimum average daily trading volume (e.g., 1000000 for 1M). MUST be a number >= 0 or exactly `null`.'),
  interval: z.string().describe(`The suggested data interval. MUST be one of: "${allowedIntervals.join('", "')}".`),
});

// Criteria used to filter tickers before fetching data (TypeScript type)
// We can use a stricter type here for TypeScript code if needed, derived from the enum-like const
export type FilterCriteria = Omit<z.infer<typeof FilterCriteriaSchema>, 'interval'> & {
    interval: typeof allowedIntervals[number];
};


// --- AI Filter Suggestion Schemas and Types ---

// Define the input schema for the AI flow (currently empty)
export const GetFilterSuggestionsInputSchema = z.object({
  // Optional fields like riskTolerance, goals could be added here
});
export type GetFilterSuggestionsInput = z.infer<typeof GetFilterSuggestionsInputSchema>;


// Define the schema for a single suggestion
// Uses the updated FilterCriteriaSchema with string interval
export const SuggestedFilterSchema = z.object({
  strategy: z.string().describe('Name of the investment strategy (e.g., Large-Cap Growth, Small-Cap Value).'),
  description: z.string().describe('A brief explanation of the strategy and why these filters are suggested.'),
  filters: FilterCriteriaSchema.describe('The suggested filter values for this strategy. Ensure marketCapMin and volumeMin are numbers >= 0 or null, and interval is one of the allowed strings.'),
});
export type SuggestedFilter = z.infer<typeof SuggestedFilterSchema>;


// Define the output schema containing an array of suggestions
export const GetFilterSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestedFilterSchema).min(3).max(5).describe('An array of 3-5 diverse investment strategy filter suggestions.'),
});
// Output type for the AI filter suggestions flow
export type GetFilterSuggestionsOutput = z.infer<typeof GetFilterSuggestionsOutputSchema>;

// --- Portfolio Optimization Types ---

// Supported portfolio optimization methods
export type OptimizationMethod =
  | 'Modern Portfolio Theory'
  | 'Black-Litterman'
  | 'Monte Carlo Simulation'
  | 'Risk Parity'
  | 'Equal Weighting';

// Parameters passed to the backend optimization function
export interface OptimizationParams {
  uploadedFileNames: string[]; // Names of files processed by uploadTickers
  filters: FilterCriteria;
  method: OptimizationMethod;
}

// Represents the allocation of a single asset in the portfolio
export interface AssetAllocation {
  asset: string; // Ticker symbol
  allocation: number; // Percentage (e.g., 25.5 for 25.5%)
  value?: number; // Optional: if displaying actual monetary value
}

// Key performance indicators for the optimized portfolio
export interface PortfolioMetrics {
  expectedReturn: number; // Percentage (e.g., 12.3 for 12.3%)
  risk: number; // Percentage (e.g., standard deviation/volatility, 15.0 for 15.0%)
  sharpeRatio?: number; // Optional, as not all models might produce it
}

// Data point for the efficient frontier chart (Risk vs Return)
export interface RiskReturnChartData {
  risk: number; // Risk percentage
  return: number; // Return percentage
  name?: string; // Optional: portfolio name or identifier for a specific point
}

// The core result object from the portfolio optimization process
export interface OptimizationResult {
  allocations: AssetAllocation[];
  metrics: PortfolioMetrics;
  efficientFrontierData?: RiskReturnChartData[]; // Specifically for Monte Carlo or similar methods
}

// Structure of the response from the optimizePortfolio API endpoint
export interface OptimizationApiResponse {
    results: OptimizationResult;
    warning?: string; // Optional warning message (e.g., rate limit warning)
}

// Represents historical stock data point (used internally by data fetching service)
export interface StockData {
  date: string; // e.g., 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number; // Changed from adjustedClose for consistency with API examples
  volume: number;
}

// Data structure for the allocation bar chart
export interface AllocationChartData {
  name: string; // Asset name (ticker)
  value: number; // Allocation percentage
  fill: string; // Color for the bar (assigned in the component)
}
