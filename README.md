# PortfolioPilot

PortfolioPilot is a Next.js application designed to help users optimize their investment portfolios using various financial models. Upload your ticker data, apply filters, select an optimization method, and view the results including metrics, allocations, and charts. You can also download a comprehensive report of the optimization results.

## Features

*   **Ticker Data Upload:** Upload one or more CSV or TXT files containing stock ticker symbols.
*   **Data Filtering:** Filter tickers based on minimum market capitalization and minimum average trading volume. Select the historical data interval (daily, weekly, monthly, yearly, etc.).
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
4.  **Optimize:** Click the "Optimize Portfolio" button. The application will process the data and run the selected optimization model using real financial data (if configured).
5.  **View Results:** Once the optimization is complete, the results section will display:
    *   Key performance metrics.
    *   A table showing the suggested asset allocations.
    *   Charts visualizing the allocation breakdown and risk vs. return (if applicable).
6.  **Download Report:** Click the "Download Report" button and select your preferred format (DOCX, PDF, or XLSX) to save a detailed report.
7.  **Reset:** Click the "Reset All" button to clear all uploaded files, filter settings, selected method, and results.

## Connecting to Real Financial Data

This application is set up with mock API functions for demonstration purposes. To use real financial data, you need to:

1.  **Choose a Financial Data Provider:** Select an API provider like Alpha Vantage, IEX Cloud, Polygon.io, Financial Modeling Prep, etc.
2.  **Obtain API Key:** Sign up for the chosen service and get your API key.
3.  **Store API Key Securely:** Use environment variables (e.g., in a `.env.local` file) to store your API key. Never commit your API key directly into the code.
    *   Example `.env.local`:
        ```
        ALPHA_VANTAGE_API_KEY=YOUR_API_KEY_HERE
        ```
4.  **Modify API Functions:**
    *   Edit the functions within `src/lib/api.ts` (and potentially create new functions in `src/services/`).
    *   Replace the mock data generation logic in `optimizePortfolio` with actual API calls to fetch historical stock prices, market cap, volume, etc., based on the user's inputs (tickers, interval).
    *   Ensure the `uploadTickers` function correctly handles the uploaded files if the API requires specific input formats.
    *   Refer to your chosen API provider's documentation for specific endpoints and data formats.
5.  **Implement Optimization Logic:** Integrate the fetched real data into the chosen portfolio optimization algorithm(s).
6.  **Handle Errors and Rate Limits:** Add robust error handling for API failures and be mindful of the provider's usage limits.

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **UI Components:** Shadcn/ui
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **Form Handling:** React Hook Form, Zod
*   **State Management:** React State, Context (implicitly via hooks)
*   **File Handling:** Browser File API, jsPDF, jspdf-autotable, xlsx, file-saver, html-to-docx (via Server Action)
*   **Financial Data:** Integration with external APIs required (e.g., Alpha Vantage, IEX Cloud).

## Development

To run the application locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **(Optional) Set Up Environment Variables:** Create a `.env.local` file in the project root and add your financial data API key(s) if you are connecting to real data:
    ```
    # Example for Alpha Vantage
    ALPHAVANTAGE_API_KEY=YOUR_API_KEY_HERE
    ```
3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

*(Note: Genkit is configured but not actively used in the current core optimization features shown.)*
```