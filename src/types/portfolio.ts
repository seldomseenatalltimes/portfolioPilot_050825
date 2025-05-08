// src/types/portfolio.ts
import type { z } from 'genkit';
import type { GetFilterSuggestionsOutputSchema, SuggestedFilterSchema } from '@/ai/flows/get-filter-suggestions'; // Import schema types only for inference

// Represents raw data from uploaded CSV/TXT files
export interface TickerData {
  ticker: string;
  [key: string]: any; // Allow other CSV fields
}

// Criteria used to filter tickers before fetching data
export interface FilterCriteria {
  marketCapMin?: number | null; // Stored as full number (e.g., 10_000_000_000 for $10B)
  volumeMin?: number | null;    // Stored as full number (e.g., 1_000_000 for 1M)
  interval:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly'
    | '1y'
    | '2y'
    | '5y'
    | '10y';
}

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
  adjClose: number;
  volume: number;
}

// Data structure for the allocation bar chart
export interface AllocationChartData {
  name: string; // Asset name (ticker)
  value: number; // Allocation percentage
  fill: string; // Color for the bar (assigned in the component)
}


// --- AI Filter Suggestion Types ---

// Input type for the AI filter suggestions flow (currently empty)
export interface GetFilterSuggestionsInput {
  // Optional fields like riskTolerance, goals could be added here
}

// Type for a single AI suggestion, matching the Zod schema output
export type SuggestedFilter = z.infer<typeof SuggestedFilterSchema>;

// Output type for the AI filter suggestions flow, matching the Zod schema output
export type GetFilterSuggestionsOutput = z.infer<typeof GetFilterSuggestionsOutputSchema>;

// Combined type for a suggestion used in the UI, adding strategy/description to FilterCriteria
export type SuggestedFilterCriteria = FilterCriteria & {
  strategy: string;
  description: string;
};
