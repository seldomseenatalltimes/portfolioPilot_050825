// src/lib/api.ts
import type { OptimizationParams, OptimizationResult, RiskReturnChartData, AssetAllocation, PortfolioMetrics, OptimizationApiResponse } from '@/types/portfolio';
import { getHistoricalData } from "@/services/stock_data"; // Corrected import path
import { yfinanceRateLimiter, delay as rateLimitDelay } from '@/lib/rate-limiter'; // Import the rate limiter and renamed delay

// Simulate API delay - keeping this for mock latency simulation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const MOCK_ASSETS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'BRK-A', 'JPM', 'V', 'JNJ'];

function generateRandomAllocations(numAssets: number): AssetAllocation[] {
  let remainingPercentage = 100;
  const allocations: AssetAllocation[] = [];
  const assetsToUse = MOCK_ASSETS.slice(0, numAssets);

  for (let i = 0; i < assetsToUse.length - 1; i++) {
    const randomAlloc = Math.random() * (remainingPercentage / (assetsToUse.length - i));
    allocations.push({ asset: assetsToUse[i], allocation: parseFloat(randomAlloc.toFixed(2)) });
    remainingPercentage -= randomAlloc;
  }
  // Ensure the last allocation makes the total 100%
   if (assetsToUse.length > 0) {
       allocations.push({ asset: assetsToUse[assetsToUse.length - 1], allocation: parseFloat(remainingPercentage.toFixed(2)) });
   }

  return allocations.sort((a, b) => b.allocation - a.allocation);
}

function generateRandomMetrics(): PortfolioMetrics {
  return {
    expectedReturn: parseFloat((Math.random() * 15 + 5).toFixed(2)), // 5% to 20%
    risk: parseFloat((Math.random() * 20 + 5).toFixed(2)), // 5% to 25%
    sharpeRatio: parseFloat((Math.random() * 1.5 + 0.5).toFixed(2)), // 0.5 to 2.0
  };
}

// Wrap the data fetching function with the rate limiter
const rateLimitedFetchStockData = yfinanceRateLimiter.wrapAsync(getHistoricalData);

function generateEfficientFrontier(): RiskReturnChartData[] {
    const frontier: RiskReturnChartData[] = [];
    for (let i = 0; i < 50; i++) {
        const risk = Math.random() * 20 + 5; // 5% to 25%
        const ret = (risk / 20) * (Math.random() * 10 + 5) + (Math.random() * 5); // Loosely correlated return
        frontier.push({ risk: parseFloat(risk.toFixed(2)), return: parseFloat(ret.toFixed(2)) });
    }
    return frontier.sort((a,b) => a.risk - b.risk);
}


export async function optimizePortfolio(params: OptimizationParams): Promise<OptimizationApiResponse> {
  console.log('Optimizing portfolio with params:', params);

  // --- Rate Limiter Integration Point ---
  // In a real implementation, fetch data for each ticker using the rate-limited function.
  // This example simulates fetching data for a limited number of mock assets.
  const tickersToFetch = MOCK_ASSETS.slice(0, 5); // Simulate fetching for first 5 assets
  const allStockData = {};
  let rateLimitWarning: string | undefined = undefined;

  try {
      console.log(`Fetching data for tickers: ${tickersToFetch.join(', ')} using rate-limited fetch...`);
      for (const ticker of tickersToFetch) {
          console.log(`Attempting to fetch data for ${ticker}`);
          // Use the rate-limited function. It will automatically handle delays if needed.
          // In a real app, use the actual tickers from processedFileNames
          // We assume getHistoricalData handles its own errors internally now or throws them
          const stockData = await rateLimitedFetchStockData(ticker, params.filters.interval);
          allStockData[ticker] = stockData;
          console.log(`Successfully fetched data for ${ticker} (or used mock/fallback)`);
      }
      console.log("Finished fetching all required stock data.");

      // Check rate limit status *after* the fetching loop
      rateLimitWarning = yfinanceRateLimiter.checkThresholds();

  } catch (error) {
       console.error("Error during rate-limited data fetching:", error);
       // Specific handling for rate limit errors if the wrapper throws them
       if (error instanceof Error && error.message.includes('Rate limit reached')) {
           throw error; // Re-throw the specific rate limit error
       }
       // Handle other potential errors during fetching
       throw new Error(`Failed to fetch stock data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  // --- End Rate Limiter Integration Point ---

  // Simulate processing delay AFTER fetching data
  await delay(500); // Reduced delay as fetching simulation now includes potential rate limit waits

  // --- Mock Result Generation (Using fetched mock data conceptually) ---
  // In a real scenario, use 'allStockData' to perform actual optimization calculations.
  // For now, we still generate random results for demonstration.

  let allocations = generateRandomAllocations(tickersToFetch.length); // Use the number of assets we attempted to fetch
  let metrics = generateRandomMetrics();
  let efficientFrontierData: RiskReturnChartData[] | undefined = undefined;

  if (params.method === 'Monte Carlo Simulation') {
    efficientFrontierData = generateEfficientFrontier();
  } else if (params.method === 'Equal Weighting') {
    const numAssets = allocations.length;
     if (numAssets > 0) {
        const equalAllocation = 100 / numAssets;
        allocations = allocations.map(alloc => ({ ...alloc, allocation: parseFloat(equalAllocation.toFixed(2)) }));
        // Adjust last asset to ensure sum is exactly 100 due to potential floating point inaccuracies
        let sum = allocations.slice(0, -1).reduce((acc, curr) => acc + curr.allocation, 0);
        allocations[allocations.length - 1].allocation = parseFloat((100 - sum).toFixed(2));
    } else {
        allocations = []; // Handle case with zero assets
    }
  }

  const results: OptimizationResult = {
      allocations,
      metrics,
      efficientFrontierData
  };

  // Return both results and any warning
  return {
      results,
      warning: rateLimitWarning
  };
}

// Mock for file upload processing, in a real scenario this would send the files to the backend.
export async function uploadTickers(files: File[]): Promise<{processedFileNames: string[], message: string}> {
  await delay(500); // Reduced delay for upload simulation

  const processedFileNames: string[] = [];
  let invalidFiles: string[] = [];

  for (const file of files) {
    console.log('Processing file:', file.name, file.size, file.type);
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      invalidFiles.push(file.name);
      console.warn(`Invalid file type for ${file.name}. Please upload a CSV or TXT file.`);
    } else {
      processedFileNames.push(file.name);
    }
  }

  let message = "";
  if (processedFileNames.length > 0) {
      message = `${processedFileNames.length} file(s) processed successfully: ${processedFileNames.join(', ')}.`;
       if (invalidFiles.length > 0) {
            message += ` Skipped invalid files: ${invalidFiles.join(', ')}.`;
       }
  } else if (files.length > 0 && invalidFiles.length > 0) {
       throw new Error(`Invalid file type(s): ${invalidFiles.join(', ')}. Please upload only CSV or TXT files.`);
  } else if (files.length === 0){
     message = "No files were uploaded.";
     // It's debatable whether this should be an error or just a message.
     // For now, let it proceed but the optimize button will be disabled.
  } else {
     message = "No valid files found to process." // Should likely be an error state upstream
  }


  // Simulate success
  return {
    processedFileNames,
    message
  };
}

