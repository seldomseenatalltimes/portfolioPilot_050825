// src/types/portfolio.ts
import { z } from 'zod';

// Represents raw data potentially found in uploaded CSV/TXT files
export interface TickerData {
  ticker: string;
  [key: string]: any; // Allow other CSV fields if present
}

// --- Filter Criteria Schemas and Types ---

// Define the allowed interval values explicitly for validation and description
// These should align with what the UI offers and what the data fetching function supports/maps.
const allowedIntervals = [
    "daily",
    "weekly",
    "monthly",
    "quarterly", // Needs mapping in stock_data.ts if supported by API
    "yearly",    // Needs mapping in stock_data.ts if supported by API
    "1y",        // Needs interpretation (likely derived from daily/weekly)
    "2y",        // Needs interpretation
    "5y",        // Needs interpretation
    "10y",       // Needs interpretation
] as const;

// Base schema used internally for validation (e.g., in forms, AI flow)
// Uses nullable numbers and a string for interval, described with allowed values.
// marketCapMin and volumeMin represent the *full* numerical value (not scaled).
export const FilterCriteriaSchema = z.object({
  marketCapMin: z.number().min(0, "Market Cap must be non-negative").nullable().describe('Minimum market capitalization (e.g., 10000000000 for $10B). MUST be a number >= 0 or exactly `null`.'),
  volumeMin: z.number().min(0, "Volume must be non-negative").nullable().describe('Minimum average daily trading volume (e.g., 1000000 for 1M). MUST be a number >= 0 or exactly `null`.'),
  interval: z.string().refine(val => allowedIntervals.includes(val as any), {
      message: `Interval must be one of: ${allowedIntervals.join(', ')}`
    }).describe(`The suggested data interval. MUST be one of: "${allowedIntervals.join('", "')}".`),
});

// TypeScript type used in the application logic.
// Derives from the schema but enforces the interval as one of the allowed literal types.
export type FilterCriteria = z.infer<typeof FilterCriteriaSchema>;


// --- AI Filter Suggestion Schemas and Types ---

// Input schema for the AI filter suggestions flow (currently accepts no input)
export const GetFilterSuggestionsInputSchema = z.object({
  // Future fields could include user risk tolerance, investment goals, etc.
});
export type GetFilterSuggestionsInput = z.infer<typeof GetFilterSuggestionsInputSchema>;


// Schema for a single AI-generated filter suggestion
// It uses the base FilterCriteriaSchema.
export const SuggestedFilterSchema = z.object({
  strategy: z.string().describe('Name of the investment strategy (e.g., Large-Cap Growth, Small-Cap Value).'),
  description: z.string().describe('A brief explanation of the strategy and why these filters are suggested.'),
  filters: FilterCriteriaSchema.describe('The suggested filter values for this strategy. Ensure marketCapMin and volumeMin are numbers >= 0 or null, and interval is one of the allowed strings.'),
});
export type SuggestedFilter = z.infer<typeof SuggestedFilterSchema>;


// Output schema for the AI filter suggestions flow, containing an array of suggestions.
export const GetFilterSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestedFilterSchema).min(3).max(5).describe('An array of 3-5 diverse investment strategy filter suggestions.'),
});
export type GetFilterSuggestionsOutput = z.infer<typeof GetFilterSuggestionsOutputSchema>;

// --- Portfolio Optimization Types ---

// Supported portfolio optimization methods offered in the UI
export type OptimizationMethod =
  | 'Modern Portfolio Theory'
  | 'Black-Litterman'
  | 'Monte Carlo Simulation'
  | 'Risk Parity'
  | 'Equal Weighting';

// Parameters passed to the core optimization function (`optimizePortfolio`)
export interface OptimizationParams {
  uploadedFileNames: string[]; // List of ticker sources (e.g., filenames)
  filters: FilterCriteria;      // User-selected or AI-suggested filters
  method: OptimizationMethod;   // Chosen optimization algorithm
}

// Represents the allocation of a single asset within the final portfolio
export interface AssetAllocation {
  asset: string;        // Ticker symbol
  allocation: number;   // Percentage (e.g., 25.5 for 25.5%)
}

// Key performance indicators calculated for the optimized portfolio
export interface PortfolioMetrics {
  expectedReturn: number; // Percentage (e.g., 12.3 for 12.3%)
  risk: number;           // Percentage (e.g., standard deviation/volatility, 15.0 for 15.0%)
  sharpeRatio?: number;   // Optional, as not all models might produce it naturally
}

// Represents a single data point for plotting the efficient frontier (Risk vs. Return)
// Primarily used by Monte Carlo simulations.
export interface RiskReturnChartData {
  risk: number;     // Risk percentage (x-axis)
  return: number;   // Return percentage (y-axis)
}

// The core result object returned by the `optimizePortfolio` function
export interface OptimizationResult {
  allocations: AssetAllocation[]; // Calculated asset allocations
  metrics: PortfolioMetrics;        // Calculated performance metrics
  efficientFrontierData?: RiskReturnChartData[]; // Optional data for efficient frontier chart
}

// Structure of the response expected from the `optimizePortfolio` API endpoint/function.
// Includes the results and an optional warning message (e.g., for rate limiting).
export interface OptimizationApiResponse {
    results: OptimizationResult;
    warning?: string;
}

// --- Data Service Types ---

// Represents a single historical data point for a stock
// This is the format expected *from* the data fetching service (`src/services/stock_data.ts`).
export interface StockData {
  date: string;       // e.g., 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;   // Adjusted close price
  volume: number;
}

// --- Charting Data Structures ---

// Data structure specifically formatted for the Allocation Bar Chart component
export interface AllocationChartData {
  name: string;   // Asset name (ticker)
  value: number;  // Allocation percentage
  fill: string;   // Color for the bar (assigned dynamically in the chart component)
}
