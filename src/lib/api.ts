import type { OptimizationParams, OptimizationResult, RiskReturnChartData, AssetAllocation, PortfolioMetrics } from '@/types/portfolio';

// Simulate API delay
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
  allocations.push({ asset: assetsToUse[assetsToUse.length - 1], allocation: parseFloat(remainingPercentage.toFixed(2)) });
  
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


export async function optimizePortfolio(params: OptimizationParams): Promise<OptimizationResult> {
  await delay(1500); // Simulate network latency

  console.log('Optimizing portfolio with params:', params);

  // Simulate different results based on method
  let allocations = generateRandomAllocations(Math.floor(Math.random() * 6) + 3); // 3 to 8 assets
  let metrics = generateRandomMetrics();
  let efficientFrontierData: RiskReturnChartData[] | undefined = undefined;

  if (params.method === 'Monte Carlo Simulation') {
    efficientFrontierData = generateEfficientFrontier();
  } else if (params.method === 'Equal Weighting') {
    const numAssets = allocations.length;
    const equalAllocation = 100 / numAssets;
    allocations = allocations.map(alloc => ({ ...alloc, allocation: parseFloat(equalAllocation.toFixed(2)) }));
    // Recalculate last asset allocation to ensure sum is 100
    let sum = allocations.slice(0, -1).reduce((acc, curr) => acc + curr.allocation, 0);
    allocations[allocations.length - 1].allocation = parseFloat((100 - sum).toFixed(2));
  }
  
  // Simulate failure sometimes
  // if (Math.random() < 0.1) {
  //   throw new Error("Simulated API error: Optimization failed.");
  // }

  return {
    allocations,
    metrics,
    efficientFrontierData
  };
}

// Mock for file upload processing, in a real scenario this would send the file to the backend.
export async function uploadTickers(file: File): Promise<{fileName: string, message: string}> {
  await delay(1000);
  console.log('Uploading file:', file.name, file.size, file.type);
  
  if (!file.name.endsWith('.csv')) {
    throw new Error("Invalid file type. Please upload a CSV file.");
  }

  // Simulate success
  return { fileName: file.name, message: `File "${file.name}" processed successfully.` };
}
