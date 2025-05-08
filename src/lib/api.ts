// src/lib/api.ts
import type { OptimizationParams, OptimizationResult, RiskReturnChartData, AssetAllocation, PortfolioMetrics, OptimizationApiResponse } from '@/types/portfolio';
import { getHistoricalData } from "@/services/stock_data"; // Corrected import path
import { yfinanceRateLimiter, delay as rateLimitDelay } from '@/lib/rate-limiter'; // Import the rate limiter and renamed delay

// Simulate API delay - keeping this for mock latency simulation if needed elsewhere
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const MOCK_ASSETS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'BRK-A', 'JPM', 'V', 'JNJ'];

// --- Mock Data Generation (Used if API key is missing or fetching fails) ---
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

function generateEfficientFrontier(): RiskReturnChartData[] {
    const frontier: RiskReturnChartData[] = [];
    for (let i = 0; i < 50; i++) {
        const risk = Math.random() * 20 + 5; // 5% to 25%
        const ret = (risk / 20) * (Math.random() * 10 + 5) + (Math.random() * 5); // Loosely correlated return
        frontier.push({ risk: parseFloat(risk.toFixed(2)), return: parseFloat(ret.toFixed(2)) });
    }
    return frontier.sort((a,b) => a.risk - b.risk);
}
// --- End Mock Data Generation ---


// Wrap the data fetching function from stock_data service with the rate limiter
const rateLimitedFetchStockData = yfinanceRateLimiter.wrapAsync(getHistoricalData);


/**
 * Orchestrates the portfolio optimization process.
 * 1. Fetches stock data for the provided tickers using a rate-limited function.
 * 2. (If real data fetched) Performs optimization calculations based on the selected method.
 * 3. (If data fetching fails or API key is missing) Falls back to generating mock results.
 * 4. Returns the optimization results along with any rate limit warnings.
 * @param params - The optimization parameters including tickers, filters, and method.
 * @returns A promise resolving to the OptimizationApiResponse containing results and potential warnings.
 */
export async function optimizePortfolio(params: OptimizationParams): Promise<OptimizationApiResponse> {
  console.log('Optimizing portfolio with params:', params);

  // --- Rate Limiter and Data Fetching ---
  // In a real implementation, fetch data for each ticker from `params.uploadedFileNames`
  // This example simulates fetching for a limited number of mock assets IF real fetching fails.
  const tickersToFetch = params.uploadedFileNames.length > 0 ? params.uploadedFileNames : MOCK_ASSETS.slice(0, 5); // Use uploaded tickers or fallback mocks
  const allStockData = {};
  let rateLimitWarning: string | undefined = undefined;
  let dataFetchedSuccessfully = true;

  try {
      console.log(`Fetching data for tickers: ${tickersToFetch.join(', ')} using rate-limited fetch...`);
      for (const ticker of tickersToFetch) {
          console.log(`Attempting to fetch data for ${ticker}`);
          // Use the rate-limited function wrapping the actual API call in stock_data.ts
          const stockData = await rateLimitedFetchStockData(ticker, params.filters.interval);
          if (stockData && stockData.length > 0) { // Check if data was actually returned
            allStockData[ticker] = stockData;
            console.log(`Successfully fetched data for ${ticker}`);
          } else {
            console.warn(`No data received for ${ticker}, potentially falling back to mock data later.`);
            // Optionally mark data as partially failed if needed
          }
      }
      console.log("Finished fetching stock data attempt.");

      // Check rate limit status *after* the fetching loop
      rateLimitWarning = yfinanceRateLimiter.checkThresholds();

      // Check if *any* real data was successfully fetched. If not, we'll use mocks.
      if (Object.keys(allStockData).length === 0 && tickersToFetch.length > 0) {
          console.warn("No real stock data could be fetched for any ticker. Falling back to mock results.");
          dataFetchedSuccessfully = false;
      }

  } catch (error) {
       console.error("Error during rate-limited data fetching:", error);
       // Handle specific rate limit errors if the wrapper throws them explicitly
       if (error instanceof Error && error.message.includes('Rate limit reached')) {
           // Rate limit exceeded, potentially inform the user or handle differently
           rateLimitWarning = rateLimitWarning ? `${rateLimitWarning} ${error.message}` : error.message;
           // Decide if we should proceed with partial data or fail completely
           // For now, we will fall back to mocks if *any* fetch failed severely.
           dataFetchedSuccessfully = false;
           console.warn("Rate limit likely reached or other fetching error. Falling back to mock results.");
       } else if (error instanceof Error && error.message.includes('API Key is missing')) {
           // API key missing is handled by stock_data.ts returning mocks, but catch here just in case
           dataFetchedSuccessfully = false;
           console.warn("API Key is missing. Falling back to mock results.");
           // Don't throw here, let it proceed to mock data generation
       }
       else {
           // Handle other potential errors during fetching
           dataFetchedSuccessfully = false;
           console.error(`Unhandled error fetching stock data: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to mock results.`);
           // Don't throw, proceed to mock generation
       }
  }
  // --- End Rate Limiter and Data Fetching ---

  // --- Result Generation ---
  let results: OptimizationResult;

  if (dataFetchedSuccessfully) {
    // --- REAL OPTIMIZATION LOGIC (Placeholder) ---
    // In a real scenario, use the data in 'allStockData' to perform
    // actual portfolio optimization calculations based on `params.method`.
    // This would involve financial libraries or algorithms.
    console.log("Performing optimization calculations with fetched data...");
    // For demonstration, we still generate random results *based on the structure* of real data.
    // Replace this with your actual calculation logic.
    let allocations = generateRandomAllocations(Object.keys(allStockData).length || tickersToFetch.length);
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
          if(allocations.length > 0) { // Ensure there is a last asset
            allocations[allocations.length - 1].allocation = parseFloat((100 - sum).toFixed(2));
          }
      } else {
          allocations = []; // Handle case with zero assets
      }
    }
     results = {
        allocations,
        metrics,
        efficientFrontierData
     };
     console.log("Generated results based on fetched data structure.");
    // --- End REAL OPTIMIZATION LOGIC ---
  } else {
    // --- Mock Result Generation (Fallback) ---
    console.log("Generating mock optimization results due to data fetching issues.");
    results = {
      allocations: generateRandomAllocations(tickersToFetch.length),
      metrics: generateRandomMetrics(),
      efficientFrontierData: params.method === 'Monte Carlo Simulation' ? generateEfficientFrontier() : undefined,
    };
     console.log("Generated mock results.");
    // --- End Mock Result Generation ---
  }


  // Return results and any warning
  return {
      results,
      warning: rateLimitWarning
  };
}

/**
 * Processes uploaded ticker files.
 * Currently only validates file types (CSV/TXT) and returns their names.
 * In a real scenario, this might involve parsing files server-side or more complex validation.
 * @param files - An array of File objects uploaded by the user.
 * @returns A promise resolving to an object containing processed file names and a status message.
 */
export async function uploadTickers(files: File[]): Promise<{processedFileNames: string[], message: string}> {
  console.log(`Processing ${files.length} uploaded files...`);
  // Removed artificial delay

  const processedFileNames: string[] = [];
  let invalidFiles: string[] = [];

  for (const file of files) {
    console.log('Validating file:', file.name, file.size, file.type);
    // Basic validation based on extension
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      invalidFiles.push(file.name);
      console.warn(`Invalid file type for ${file.name}. Allowed types: CSV, TXT.`);
    } else {
      processedFileNames.push(file.name); // Store the original name for reference
    }
  }

  let message = "";
  if (processedFileNames.length > 0) {
      message = `${processedFileNames.length} valid file(s) ready for processing: ${processedFileNames.join(', ')}.`;
       if (invalidFiles.length > 0) {
            message += ` Skipped invalid files (wrong type): ${invalidFiles.join(', ')}.`;
       }
  } else if (files.length > 0 && invalidFiles.length > 0) {
       // If only invalid files were uploaded
       throw new Error(`Invalid file type(s): ${invalidFiles.join(', ')}. Please upload only CSV or TXT files.`);
  } else if (files.length === 0){
     message = "No files were uploaded.";
     // Let the UI handle the state where no files are present
  } else {
     // This case should ideally not be reached if the above logic is sound
     message = "No valid files found to process.";
  }

  console.log("File validation complete. Message:", message);
  // Return the names of the files deemed valid (by extension)
  return {
    processedFileNames,
    message
  };
}
