# PortfolioPilot

PortfolioPilot is a Next.js application designed to help users optimize their investment portfolios using various financial models. Upload your ticker data, apply filters, get AI-powered filter suggestions, select an optimization method, and view the results including metrics, allocations, and charts. You can also download a comprehensive report of the optimization results.

**Important Note:** This application demonstrates integration with the **Alpha Vantage API** for fetching stock data. You **must** obtain your own free API key from Alpha Vantage and set it as an environment variable for the data fetching to work. Without a key, the application will use limited mock data.

## Features

*   **Ticker Data Upload:** Upload one or more CSV or TXT files containing stock ticker symbols.
*   **Data Filtering:** Filter tickers based on minimum market capitalization and minimum average trading volume. Select the historical data interval (daily, weekly, monthly, etc.).
*   **AI Filter Suggestions:** Get suggestions for filter criteria based on common investment strategies (e.g., Growth Focus, Balanced, Low Volatility) powered by Genkit and Google AI.
*   **Optimization Methods:** Choose from several portfolio optimization models:
    *   Modern Portfolio Theory (MPT)
    *   Black-Litterman
    *   Monte Carlo Simulation (includes efficient frontier visualization)
    *   Risk Parity
    *   Equal Weighting
*   **Results Visualization:**
    *   View key portfolio metrics (Expected Return, Risk/Volatility, Sharpe Ratio).
    *   See the calculated asset allocations in a clear table.
    *   Visualize allocations with a bar chart.
    *   Analyze risk vs. return with a scatter plot (for applicable models like Monte Carlo).
*   **Report Download:** Download the complete optimization results and parameters in various formats:
    *   Microsoft Word (.docx)
    *   PDF (.pdf)
    *   Microsoft Excel (.xlsx)
*   **Reset Functionality:** Easily clear all inputs, files, and results to start a new analysis.
*   **Rate Limiting Awareness:** Includes a utility to manage API call frequency and provides warnings when nearing limits (configured for Alpha Vantage free tier limits).

## How to Use

1.  **Upload Data:** Click the "Upload Ticker File(s)" input or drag and drop your CSV or TXT files containing ticker symbols onto the designated area. You can upload multiple files.
2.  **Apply Filters (Optional):**
    *   Enter minimum values for Market Capitalization (in Hundreds of Millions) and Volume (in Millions) if desired.
    *   Select the desired historical Data Interval from the dropdown.
    *   **Alternatively:** Click "Get AI Filter Suggestions" to see AI-generated filter presets based on different investment strategies. Click "Apply Filters" on a suggestion to use it.
3.  **Select Optimization Method:** Choose the portfolio optimization model you want to use from the dropdown list.
4.  **Optimize:** Click the "Optimize Portfolio" button. The application will process the data, fetch historical data using your Alpha Vantage API key (or use mock data if the key is missing), and run the selected optimization model.
5.  **View Results:** Once the optimization is complete, the results section will display the outcomes:
    *   Key performance metrics.
    *   A table showing the suggested asset allocations.
    *   Charts visualizing the allocation breakdown and risk vs. return (if applicable).
    *   *Note: Results are based on the fetched data (real or mock).*
6.  **Download Report:** Click the "Download Report" button and select your preferred format (DOCX, PDF, or XLSX) to save a detailed report based on the generated results.
7.  **Reset:** Click the "Reset All" button to clear all uploaded files, filter settings, selected method, and results.

## Connecting to Real Financial Data (Alpha Vantage Setup)

**This step is necessary for the application to provide meaningful results.**

1.  **Get an Alpha Vantage API Key:** Go to [Alpha Vantage](https://www.alphavantage.co/) and get a free API key.
2.  **Store API Key Securely:** Create a `.env.local` file in the project root (if it doesn't exist). Add your API key to this file:
    ```
    ALPHAVANTAGE_API_KEY=YOUR_API_KEY_HERE
    ```
    **Important:** Do not commit the `.env.local` file or your API key to version control. The `.gitignore` file should already be configured to ignore `.env*.local`.
3.  **Run the Application:** Start the development server (`npm run dev`). The application will automatically use the API key from the environment variable when fetching data in `src/services/stock_data.ts`. If the key is missing, it will fall back to mock data and log a warning.

**Adapting to Other Data Providers:**

If you want to use a different financial data provider:

1.  **Obtain API Key:** Get the API key for your chosen provider.
2.  **Update Environment Variable:** Store the new key in `.env.local` (e.g., `YOUR_PROVIDER_API_KEY=...`).
3.  **Modify `src/services/stock_data.ts`:**
    *   Update the `getHistoricalData` function.
    *   Read the correct environment variable (e.g., `process.env.YOUR_PROVIDER_API_KEY`).
    *   Change the `fetch` call to use the correct API endpoint and parameters for your provider.
    *   Adjust the data parsing logic to match the structure of the response from your provider.
    *   Ensure the function returns data in the `StockData[]` format expected by the application or adapt the calling code.
4.  **Modify `src/lib/rate-limiter.ts`:**
    *   Update the `RateLimiter` constructor call within the file:
        ```typescript
        const yfinanceRateLimiter = new RateLimiter({
          requestsPerHour: YOUR_PROVIDER_HOURLY_LIMIT, // e.g., 500
          requestsPerDay: YOUR_PROVIDER_DAILY_LIMIT,  // e.g., 10000
          warningThresholdPercent: 0.1, // Or adjust as needed
        });
        ```
    *   Replace `YOUR_PROVIDER_HOURLY_LIMIT` and `YOUR_PROVIDER_DAILY_LIMIT` with the actual limits of your chosen API provider's plan. This ensures the rate limit warnings and potential delays are accurate.
5.  **Update API Call Wrapping in `src/lib/api.ts`:**
    *   The `getHistoricalData` function is already wrapped by `yfinanceRateLimiter.wrapAsync` in `src/lib/api.ts`. Ensure this wrapping remains if you modify `getHistoricalData`. If you create *new* functions in `stock_data.ts` that make API calls, wrap those new functions similarly using `yfinanceRateLimiter.wrapAsync`.

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **AI Integration:** Genkit, Google AI (for filter suggestions)
*   **UI Components:** Shadcn/ui
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **Form Handling:** React Hook Form, Zod
*   **State Management:** React State, Hooks
*   **File Handling:** Browser File API, jsPDF, jspdf-autotable, xlsx, file-saver, html-to-docx (via Server Action)
*   **Financial Data:** Alpha Vantage API (integration provided), Mock data fallback
*   **Rate Limiting:** Custom in-memory rate limiter utility (`src/lib/rate-limiter.ts`)

## Development

To run the application locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **(Required for Real Data) Set Up Environment Variables:** Create a `.env.local` file in the project root and add your Alpha Vantage API key:
    ```
    ALPHAVANTAGE_API_KEY=YOUR_API_KEY_HERE
    ```
3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

*(Note: Genkit is configured and used for the AI Filter Suggestions feature.)*
