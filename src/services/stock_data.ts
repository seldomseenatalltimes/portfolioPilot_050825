// src/services/stock_data.ts
'use server'; // Ensure this runs on the server if fetching requires API keys

// NOTE: This file contains commented-out example code for fetching real data.
// You need to:
// 1. Choose an API provider (e.g., Alpha Vantage, IEX Cloud).
// 2. Get an API key and store it securely (e.g., in .env.local).
// 3. Install any necessary client libraries (e.g., `npm install node-fetch`).
// 4. Uncomment and adapt the code below for your chosen provider.
// 5. Integrate this function into `src/lib/api.ts`.

import type { StockData } from '@/types/portfolio'; // Assuming StockData type exists

// Example using environment variable for API key
const apiKey = process.env.ALPHAVANTAGE_API_KEY; // Or your chosen provider's key variable

/**
 * Fetches historical stock data for a given ticker and interval.
 * If an API key is not provided, it falls back to returning mock data.
 * @param ticker The stock ticker symbol.
 * @param interval The data interval (e.g., 'daily', 'weekly'). Needs mapping to API specifics.
 * @returns A promise resolving to an array of StockData objects or throws an error if API fetch fails.
 */
export async function getHistoricalData(ticker: string, interval: string): Promise<StockData[]> {
    if (!apiKey) {
        console.error("API Key is missing. Set ALPHAVANTAGE_API_KEY (or your provider's key) in .env.local to fetch real data.");
        // Fallback to mock data instead of throwing an error
        console.warn(`WARN: Using mock data for ${ticker} as API key is missing.`);
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate slight delay for mock
        return [
          { date: '2024-01-01', open: 150, high: 155, low: 148, close: 152, adjClose: 152, volume: 1000000 },
          { date: '2024-01-02', open: 152, high: 154, low: 151, close: 153, adjClose: 153, volume: 1200000 },
          { date: '2024-01-03', open: 153, high: 156, low: 152, close: 155, adjClose: 155, volume: 1100000 },
        ];
    }

    console.log(`Attempting to fetch real data for ${ticker} with interval ${interval}...`);

    // --- EXAMPLE IMPLEMENTATION (Needs Adaptation) ---
    // Replace this section with your actual API call logic.
    // This example uses Alpha Vantage structure but needs error handling, interval mapping, etc.

    /*
    // Map your interval to Alpha Vantage function names (example)
    const avFunction = interval === 'daily' ? 'TIME_SERIES_DAILY_ADJUSTED' :
                       interval === 'weekly' ? 'TIME_SERIES_WEEKLY_ADJUSTED' :
                       'TIME_SERIES_DAILY_ADJUSTED'; // Default or handle error

    const apiUrl = `https://www.alphavantage.co/query?function=${avFunction}&symbol=${ticker}&outputsize=compact&apikey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status} for ${ticker}`);
        }
        const data = await response.json();

        if (data["Error Message"]) {
            console.error(`Alpha Vantage API Error for ${ticker}:`, data["Error Message"]);
            throw new Error(`API Error for ${ticker}: ${data["Error Message"]}`);
        }

        const timeSeriesKey = Object.keys(data).find(key => key.includes("Time Series"));
        if (!timeSeriesKey || !data[timeSeriesKey]) {
             console.warn(`No time series data found for ${ticker} from Alpha Vantage.`);
             // Fallback to mock data or empty array if API returns no data but no error
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
                adjClose: parseFloat(dailyData["5. adjusted close"]), // Ensure correct key
                volume: parseInt(dailyData["6. volume"]),
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort chronologically

        console.log(`Successfully fetched ${formattedData.length} data points for ${ticker}`);
        return formattedData;

    } catch (error) {
        console.error(`Error fetching or processing data for ${ticker}:`, error);
        // Depending on requirements, you might return mock data on failure or re-throw
        // Re-throwing ensures the error is surfaced to the caller
        throw error; // Re-throw the error to be handled by the caller (e.g., optimizePortfolio)
    }
    */

    // --- END EXAMPLE IMPLEMENTATION ---

    // Return mock data if the API fetch logic is still commented out or fails without throwing
    console.warn(`WARN: Using mock data for ${ticker} as real API fetch logic might be commented out or failed silently.`);
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate slight delay for mock
    return [
        { date: '2024-01-01', open: 150, high: 155, low: 148, close: 152, adjClose: 152, volume: 1000000 },
        { date: '2024-01-02', open: 152, high: 154, low: 151, close: 153, adjClose: 153, volume: 1200000 },
        { date: '2024-01-03', open: 153, high: 156, low: 152, close: 155, adjClose: 155, volume: 1100000 },
    ];
}

// You might add other functions here, e.g., getMarketCap, getVolume, etc.
