// src/services/stock_data.ts
'use server'; // Ensure this runs on the server as it accesses process.env

import type { StockData } from '@/types/portfolio';

// --- Configuration ---
// Use environment variable for API key. Replace 'ALPHAVANTAGE_API_KEY'
// if using a different provider.
const apiKey = process.env.ALPHAVANTAGE_API_KEY;
const MOCK_FETCH_DELAY_MS = 50; // Simulate slight delay for mock data

/**
 * Generates mock stock data for a single ticker.
 * Used as a fallback when the API key is missing or fetching fails.
 * @param ticker The stock ticker symbol (for logging purposes).
 * @returns An array of mock StockData objects.
 */
function generateMockData(ticker: string): StockData[] {
    console.warn(`WARN: Using mock data for ${ticker} as API key is missing or fetch failed.`);
    // Return a small, consistent set of mock data for demonstration
    return [
        { date: '2024-01-01', open: 150, high: 155, low: 148, close: 152, adjClose: 152, volume: 1000000 },
        { date: '2024-01-02', open: 152, high: 154, low: 151, close: 153, adjClose: 153, volume: 1200000 },
        { date: '2024-01-03', open: 153, high: 156, low: 152, close: 155, adjClose: 155, volume: 1100000 },
        // Add more mock data points if needed
    ];
}


/**
 * Fetches historical stock data for a given ticker and interval using Alpha Vantage API.
 * If the API key (ALPHAVANTAGE_API_KEY) is not set in the environment variables,
 * it logs a warning and returns mock data.
 *
 * @param ticker The stock ticker symbol (e.g., "AAPL").
 * @param interval The data interval string (e.g., 'daily', 'weekly', 'monthly').
 *                 This function currently maps these to Alpha Vantage functions.
 * @returns A promise resolving to an array of StockData objects (real or mock).
 * @throws An error if the API fetch fails and mock data fallback is not applicable.
 */
export async function getHistoricalData(ticker: string, interval: string): Promise<StockData[]> {
    if (!apiKey) {
        console.warn("API Key (ALPHAVANTAGE_API_KEY) is missing. Set it in .env.local to fetch real data.");
        await new Promise(resolve => setTimeout(resolve, MOCK_FETCH_DELAY_MS)); // Simulate delay
        return generateMockData(ticker); // Fallback to mock data
    }

    console.log(`Attempting to fetch real data for ${ticker} (Interval: ${interval}) from Alpha Vantage...`);

    // Map user-friendly interval names to Alpha Vantage API function names
    const functionMap: { [key: string]: string } = {
        'daily': 'TIME_SERIES_DAILY_ADJUSTED',
        'weekly': 'TIME_SERIES_WEEKLY_ADJUSTED',
        'monthly': 'TIME_SERIES_MONTHLY_ADJUSTED',
        // Add mappings for 'quarterly', 'yearly', '1y', '2y', '5y', '10y' if Alpha Vantage supports
        // equivalent functions or if you need to derive them from daily/weekly/monthly data.
        // For now, default to daily for unmapped intervals.
    };
    const avFunction = functionMap[interval] || 'TIME_SERIES_DAILY_ADJUSTED'; // Default to daily

    // Determine output size based on interval (adjust as needed)
    // 'compact' returns last 100 points, 'full' returns up to 20 years
    const outputSize = ['daily', 'weekly', 'monthly'].includes(interval) ? 'compact' : 'full';

    const apiUrl = `https://www.alphavantage.co/query?function=${avFunction}&symbol=${ticker}&outputsize=${outputSize}&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);

        // Check for network errors
        if (!response.ok) {
             console.error(`HTTP error fetching data for ${ticker}! status: ${response.status} ${response.statusText}`);
             // Fallback to mock data on HTTP errors (like 404 Not Found, 5xx Server Errors)
             await new Promise(resolve => setTimeout(resolve, MOCK_FETCH_DELAY_MS));
             return generateMockData(ticker);
        }

        const data = await response.json();

        // Check for Alpha Vantage specific error messages or rate limit info
        if (data["Error Message"]) {
            console.error(`Alpha Vantage API Error for ${ticker}:`, data["Error Message"]);
            // Fallback to mock data on API-level errors
            await new Promise(resolve => setTimeout(resolve, MOCK_FETCH_DELAY_MS));
            return generateMockData(ticker);
        }
        if (data["Note"] && data["Note"].includes("API call frequency")) {
             console.warn(`Alpha Vantage Rate Limit potentially hit for ${ticker}:`, data["Note"]);
             // Fallback to mock data if rate limited
            await new Promise(resolve => setTimeout(resolve, MOCK_FETCH_DELAY_MS));
            return generateMockData(ticker);
        }

        // Determine the correct key for time series data (varies by function)
        const timeSeriesKey = Object.keys(data).find(key => key.includes("Time Series"));

        if (!timeSeriesKey || !data[timeSeriesKey]) {
             console.warn(`No time series data found in the response for ${ticker} from Alpha Vantage.`);
             // Return empty array if API returns no data but no explicit error
             return [];
        }

        const timeSeries = data[timeSeriesKey];
        const formattedData: StockData[] = Object.keys(timeSeries).map(date => {
            const dailyData = timeSeries[date];
            return {
                date,
                open: parseFloat(dailyData["1. open"]),
                high: parseFloat(dailyData["2. high"]),
                low: parseFloat(dailyData["3. low"]),
                close: parseFloat(dailyData["4. close"]),
                adjClose: parseFloat(dailyData["5. adjusted close"]), // Key for adjusted data
                volume: parseInt(dailyData["6. volume"], 10), // Ensure base 10
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort chronologically

        console.log(`Successfully fetched and processed ${formattedData.length} data points for ${ticker}`);
        return formattedData;

    } catch (error) {
        console.error(`Critical error fetching or processing data for ${ticker}:`, error);
        // Fallback to mock data on unexpected errors (e.g., network issues before response, JSON parsing errors)
        await new Promise(resolve => setTimeout(resolve, MOCK_FETCH_DELAY_MS));
        return generateMockData(ticker);
        // OR: Re-throw if you want the calling function (`optimizePortfolio`) to handle the failure more drastically.
        // throw error;
    }
}

// Potential future functions:
// export async function getMarketCap(ticker: string): Promise<number | null> { ... }
// export async function getCurrentVolume(ticker: string): Promise<number | null> { ... }
