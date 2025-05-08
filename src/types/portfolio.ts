export interface TickerData {
  ticker: string;
  [key: string]: any; // Allow other CSV fields
}

export interface FilterCriteria {
  marketCapMin?: number | null;
  volumeMin?: number | null;
  interval: 'daily' | 'weekly' | 'monthly';
}

export type OptimizationMethod =
  | 'Modern Portfolio Theory'
  | 'Black-Litterman'
  | 'Monte Carlo Simulation'
  | 'Risk Parity'
  | 'Equal Weighting';

export interface OptimizationParams {
  uploadedFileName: string; // Or actual processed ticker data
  filters: FilterCriteria;
  method: OptimizationMethod;
}

export interface AssetAllocation {
  asset: string;
  allocation: number; // Percentage
  value?: number; // Optional: if displaying actual value
}

export interface PortfolioMetrics {
  expectedReturn: number; // Percentage
  risk: number; // Percentage (e.g., volatility)
  sharpeRatio?: number;
}

export interface OptimizationResult {
  allocations: AssetAllocation[];
  metrics: PortfolioMetrics;
  efficientFrontierData?: RiskReturnChartData[]; // For Monte Carlo
}

export interface AllocationChartData {
  name: string; // Asset name
  value: number; // Allocation percentage
  fill: string; // Color for the bar
}

export interface RiskReturnChartData {
  risk: number;
  return: number;
  name?: string; // portfolio name or asset name
}
