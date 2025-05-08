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
4.  **Optimize:** Click the "Optimize Portfolio" button. The application will process the data and run the selected optimization model.
5.  **View Results:** Once the optimization is complete, the results section will display:
    *   Key performance metrics.
    *   A table showing the suggested asset allocations.
    *   Charts visualizing the allocation breakdown and risk vs. return (if applicable).
6.  **Download Report:** Click the "Download Report" button and select your preferred format (DOCX, PDF, or XLSX) to save a detailed report.
7.  **Reset:** Click the "Reset All" button to clear all uploaded files, filter settings, selected method, and results.

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **UI Components:** Shadcn/ui
*   **Styling:** Tailwind CSS
*   **Charting:** Recharts
*   **Form Handling:** React Hook Form, Zod
*   **State Management:** React State, Context (implicitly via hooks)
*   **Backend Simulation:** Mock API functions within the Next.js app
*   **File Handling:** Browser File API, jsPDF, jspdf-autotable, xlsx, file-saver, html-to-docx (via Server Action)

## Development

To run the application locally:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

*(Note: Genkit is configured but not actively used in the current core optimization features shown.)*
```