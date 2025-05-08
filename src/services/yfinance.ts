/**
 * @fileOverview Service for interacting with financial data APIs (mock implementation).
 * This service currently provides mock stock data. In a real application,
 * it would interact with a financial data provider like Yahoo Finance
 * (potentially via a backend API or a suitable Node.js library).
 */

/**
 * Represents historical stock data for a given ticker.
 */
export interface StockData {
  /**
   * The date of the stock data.
   */
  date: string;
  /**
   * The opening price of the stock.
   */
  open: number;
  /**
   * The highest price of the stock during the day.
   */
  high: number;
  /**
   * The lowest price of the stock during the day.
   */
  low: number;
  /**
   * The closing price of the stock.
   */
  close: number;
  /**
   * The adjusted closing price of the stock.
   */
  adjClose: number;
  /**
   * The volume of shares traded.
   */
  volume: number;
}

/**
 * Represents the filters for fetching stock data.
 */
export interface StockDataFilters {
  /**
   * The market cap of the stock.
   */
  marketCap?: number;
  /**
   * The volume of the stock.
   */
  volume?: number;
  /**
   * The start date for the historical data (e.g., 'YYYY-MM-DD').
   */
  startDate?: string;
  /**
   * The end date for the historical data (e.g., 'YYYY-MM-DD').
   */
  endDate?: string;
  /**
   * The interval for the data points (e.g., '1d', '1wk', '1mo').
   */
  interval?: string;
}

/**
 * Asynchronously retrieves historical stock data for a given ticker.
 *
 * **Note:** This is currently a mock implementation. In a production environment,
 * this function would call a real financial data API (e.g., yfinance via a
 * backend service or a different Node.js library).
 *
 * @param ticker The stock ticker symbol.
 * @param filters Optional filters to apply when fetching data (currently ignored by mock).
 * @returns A promise that resolves to an array of mock StockData objects.
 */
export async function getStockData(
  ticker: string,
  filters?: StockDataFilters
): Promise<StockData[]> {
  console.log(
    `Mock Fetching data for ${ticker} with filters:`,
    JSON.stringify(filters)
  );
  // --- Mock Implementation ---
  // Replace this section with the actual API call in a real application.
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

  const mockData: StockData[] = [
    {
      date: '2024-01-01',
      open: 150.0 + Math.random() * 10,
      high: 155.0 + Math.random() * 10,
      low: 148.0 + Math.random() * 5,
      close: 152.0 + Math.random() * 8,
      adjClose: 152.0 + Math.random() * 8,
      volume: 1000000 + Math.random() * 500000,
    },
    {
      date: '2024-01-02',
      open: 152.0 + Math.random() * 10,
      high: 154.0 + Math.random() * 10,
      low: 151.0 + Math.random() * 5,
      close: 153.0 + Math.random() * 8,
      adjClose: 153.0 + Math.random() * 8,
      volume: 1200000 + Math.random() * 600000,
    },
    {
      date: '2024-01-03',
      open: 153.0 + Math.random() * 10,
      high: 156.0 + Math.random() * 10,
      low: 152.0 + Math.random() * 5,
      close: 155.0 + Math.random() * 8,
      adjClose: 155.0 + Math.random() * 8,
      volume: 1100000 + Math.random() * 550000,
    },
  ];
  // --- End Mock Implementation ---

  return mockData;
}
