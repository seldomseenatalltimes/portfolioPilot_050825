# PortfolioPilot

PortfolioPilot is a Next.js application designed to help users optimize their investment portfolios using various financial models. Upload your ticker data, apply filters, select an optimization method, and view the results including metrics, allocations, and charts. You can also download a comprehensive report of the optimization results.

**Important Note:** This application is currently set up with **mock data** for demonstration purposes. To perform real portfolio analysis, you **must** integrate it with a financial data API.

## Features

*   **Ticker Data Upload:** Upload one or more CSV or TXT files containing stock ticker symbols.
*   **Data Filtering:** Filter tickers based on minimum market capitalization and minimum average trading volume. Select the historical data interval (daily, weekly, monthly, yearly, 1y, 2y, 5y, 10y).
*   **Optimization Methods:** Choose from several portfolio optimization models:
    *   Modern Portfolio Theory (MPT)
    *   Black-Litterman
    *   Monte Carlo Simulation
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

## How to Use

1.  **Upload Data:** Click the "Upload Ticker File(s)" input or drag and drop your CSV or TXT files containing ticker symbols onto the designated area. You can upload multiple files.
2.  **Apply Filters (Optional):**
    *   Enter minimum values for Market Capitalization and Volume if desired.
    *   Select the desired historical Data Interval from the dropdown.
3.  **Select Optimization Method:** Choose the portfolio optimization model you want to use from the dropdown list.
4.  **Optimize:** Click the "Optimize Portfolio" button. The application will process the data and run the selected optimization model using **mock financial data** (unless you integrate a real API).
5.  **View Results:** Once the optimization is complete, the results section will display the simulated outcomes:
    *   Key performance metrics.
    *   A table showing the suggested asset allocations.
    *   Charts visualizing the allocation breakdown and risk vs. return (if applicable).
6.  **Download Report:** Click the "Download Report" button and select your preferred format (DOCX, PDF, or XLSX) to save a detailed report based on the simulated results.
7.  **Reset:** Click the "Reset All" button to clear all uploaded files, filter settings, selected method, and results.

## Connecting to Real Financial Data

**This step is necessary for the application to provide meaningful results.**

1.  **Choose a Financial Data Provider:** Select an API provider like [Alpha Vantage](https://www.alphavantage.co/), [IEX Cloud](https://iexcloud.io/), [Polygon.io](https://polygon.io/), [Financial Modeling Prep](https://financialmodelingprep.com/), etc.
2.  **Obtain API Key:** Sign up for the chosen service and get your API key.
3.  **Store API Key Securely:** Use environment variables (e.g., in a `.env.local` file) to store your API key. Never commit your API key directly into the code.
    *   Example `.env.local`:
        ```
        ALPHAVANTAGE_API_KEY=YOUR_API_KEY_HERE
        # Or for another provider
        # IEX_CLOUD_API_KEY=YOUR_IEX_KEY_HERE
        ```
4.  **Modify API Functions:**
    *   Edit the functions within `src/lib/api.ts` (and potentially create new functions in `src/services/`).
    *   **Specifically, update the `optimizePortfolio` function:**
        *   Replace the mock data generation logic (e.g., `generateRandomAllocations`, `generateRandomMetrics`) with actual API calls to fetch historical stock prices, market cap, volume, etc., based on the user's inputs (tickers, interval). You'll need to choose an API library (like `alphavantage` for Node.js) or use `fetch` directly.
        *   Integrate the fetched real data into the chosen portfolio optimization algorithm(s). You might need to install and use financial modeling libraries (e.g., in Python if using a Python backend, or find suitable JavaScript libraries).
    *   Ensure the `uploadTickers` function correctly handles the uploaded files if the API requires specific input formats (currently it only validates file types).
    *   Refer to your chosen API provider's documentation for specific endpoints and data formats.
5.  **Implement Rate Limiting:**
    *   The application includes a basic rate limiter utility in `src/lib/rate-limiter.ts`.
    *   **Wrap your actual API data fetching calls** within the `optimizePortfolio` function (or related service functions) using the `yfinanceRateLimiter.wrapAsync` decorator or manually check `yfinanceRateLimiter.requestPermission()` before each call that counts towards the API limit. Adjust the limits in the rate limiter file based on your chosen API provider's constraints.
6.  **Handle Errors and Rate Limits:** Add robust error handling for API failures (network issues, invalid tickers, API key errors) and handle rate limit exceeded scenarios gracefully (e.g., inform the user, implement delays).

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **UI Components:** Shadcn/ui
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **Form Handling:** React Hook Form, Zod
*   **State Management:** React State, Context (implicitly via hooks)
*   **File Handling:** Browser File API, jsPDF, jspdf-autotable, xlsx, file-saver, html-to-docx (via Server Action)
*   **Financial Data:** **Integration with external APIs required** (currently uses mock data).
*   **Rate Limiting:** Basic in-memory rate limiter utility included.

## Development

To run the application locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **(Required for Real Data) Set Up Environment Variables:** Create a `.env.local` file in the project root and add your financial data API key(s):
    ```
    # Example for Alpha Vantage
    ALPHAVANTAGE_API_KEY=YOUR_API_KEY_HERE
    ```
3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

*(Note: Genkit is configured but not actively used in the core optimization features shown.)*
