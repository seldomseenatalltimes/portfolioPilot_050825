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
}

/**
 * Asynchronously retrieves historical stock data for a given ticker.
 *
 * @param ticker The stock ticker symbol.
 * @param filters Optional filters to apply when fetching data.
 * @returns A promise that resolves to an array of StockData objects.
 */
export async function getStockData(
  ticker: string,
  filters?: StockDataFilters
): Promise<StockData[]> {
  // TODO: Implement this by calling the yfinance API.

  return [
    {
      date: '2024-01-01',
      open: 150.0,
      high: 155.0,
      low: 148.0,
      close: 152.0,
      adjClose: 152.0,
      volume: 1000000,
    },
    {
      date: '2024-01-02',
      open: 152.0,
      high: 154.0,
      low: 151.0,
      close: 153.0,
      adjClose: 153.0,
      volume: 1200000,
    },
  ];
}
