import pandas as pd
from typing import List

def get_unique_tickers_from_csv(csv_file_path: str, ticker_column_name: str = 'Ticker') -> List[str]:
    """
    Reads a CSV file, extracts tickers from a specified column,
    filters out duplicates, and returns a list of unique tickers.

    Args:
        csv_file_path (str): The path to the consolidated CSV file.
        ticker_column_name (str): The name of the column containing the tickers.
                                  Defaults to 'Ticker'.

    Returns:
        List[str]: A list of unique ticker symbols.

    Raises:
        FileNotFoundError: If the CSV file does not exist.
        KeyError: If the ticker column name is not found in the CSV.
        Exception: For other pandas-related errors during CSV processing or data handling.
    """
    try:
        df = pd.read_csv(csv_file_path)
    except FileNotFoundError:
        raise FileNotFoundError(f"Error: The file '{csv_file_path}' was not found.")
    except pd.errors.EmptyDataError:
        return []  # CSV is empty or contains only whitespace
    except Exception as e: # Catch other pandas read errors (like ParserError)
        raise Exception(f"An error occurred while reading the CSV file '{csv_file_path}': {e}")

    try:
        if ticker_column_name not in df.columns:
            raise KeyError(
                f"Column '{ticker_column_name}' not found in the CSV file. "
                f"Available columns are: {', '.join(df.columns)}"
            )

        tickers_series = df[ticker_column_name]

        # Drop missing values (NaN or None), convert to string, strip whitespace,
        # and filter out empty strings.
        processed_tickers = tickers_series.dropna().astype(str).str.strip()
        valid_tickers = processed_tickers[processed_tickers != '']
        
        # Get unique tickers. pandas.Series.unique() preserves order of appearance.
        unique_tickers = list(valid_tickers.unique())

        return unique_tickers
    except KeyError as e: # Handles the specific KeyError from column check
        # This re-raises the KeyError created above if the column isn't found.
        raise e
    except Exception as e: # Handles other errors during processing (e.g., astype conversion)
        raise Exception(f"An error occurred while processing data from '{csv_file_path}': {e}")

if __name__ == '__main__':
    # Example usage:
    # Create a dummy CSV file for testing
    dummy_data = {
        'Ticker': ['AAPL', 'MSFT', 'AAPL', 'GOOG', None, 'TSLA', 'MSFT', 'AMZN', '', '  SPY  ', 'BRK.A'],
        'Price': [150, 250, 152, 2700, 10, 700, 255, 3300, 20, 400, 300000],
        'Volume': [1000,2000,1500,500, 30, 3000,2200,600, 40, 5000, 100]
    }
    dummy_df = pd.DataFrame(dummy_data)
    dummy_csv_path = 'dummy_tickers.csv'
    dummy_df.to_csv(dummy_csv_path, index=False)

    print(f"Created dummy CSV: {dummy_csv_path}")

    try:
        # Test with default ticker column name
        print(f"\nTesting with default ticker column ('Ticker'):")
        unique_tickers_default = get_unique_tickers_from_csv(dummy_csv_path)
        print(f"Unique tickers found: {unique_tickers_default}")
        # Expected: ['AAPL', 'MSFT', 'GOOG', 'TSLA', 'AMZN', 'SPY', 'BRK.A']

        # Test with a custom ticker column name
        dummy_data_custom_col = {'Symbol': ['NVDA', 'NVDA', 'AMD', None, 'INTC', '  '], 'OtherData': [1,2,3,4,5,6]}
        dummy_df_custom = pd.DataFrame(dummy_data_custom_col)
        custom_csv_path = 'dummy_custom_tickers.csv'
        dummy_df_custom.to_csv(custom_csv_path, index=False)
        print(f"\nTesting with custom ticker column ('Symbol'):")
        unique_tickers_custom = get_unique_tickers_from_csv(custom_csv_path, ticker_column_name='Symbol')
        print(f"Unique tickers from custom column: {unique_tickers_custom}")
        # Expected: ['NVDA', 'AMD', 'INTC']


        # Test with a non-existent file
        print(f"\nTesting with non-existent file:")
        try:
            get_unique_tickers_from_csv('non_existent_file.csv')
        except FileNotFoundError as e:
            print(f"Caught expected error: {e}")

        # Test with a CSV missing the ticker column
        print(f"\nTesting with CSV missing the ticker column:")
        dummy_data_no_ticker_col = {'Name': ['Apple', 'Microsoft'], 'Value': [100, 200]}
        dummy_df_no_ticker = pd.DataFrame(dummy_data_no_ticker_col)
        no_ticker_csv_path = 'dummy_no_ticker.csv'
        dummy_df_no_ticker.to_csv(no_ticker_csv_path, index=False)
        try:
            get_unique_tickers_from_csv(no_ticker_csv_path, ticker_column_name='Ticker')
        except KeyError as e:
            print(f"Caught expected error: {e}")

        # Test with an empty CSV (truly empty file)
        print(f"\nTesting with an empty CSV (no headers, no data):")
        empty_csv_path = 'empty_tickers.csv'
        with open(empty_csv_path, 'w') as f:
            pass 
        tickers_from_empty = get_unique_tickers_from_csv(empty_csv_path)
        print(f"Tickers from empty CSV: {tickers_from_empty}") # Should be []

        # Test with a CSV that has only headers (empty data)
        print(f"\nTesting with a CSV that has only headers (empty data):")
        empty_data_csv_path = 'empty_data_tickers.csv'
        with open(empty_data_csv_path, 'w') as f:
            f.write('Ticker,Price\n')
        tickers_from_empty_data = get_unique_tickers_from_csv(empty_data_csv_path)
        print(f"Tickers from empty data CSV: {tickers_from_empty_data}") # Should be []
        
        # Test with a CSV that has the ticker column but all values are NaN or empty
        print(f"\nTesting with a CSV where all ticker values are invalid:")
        all_invalid_tickers_data = {'Ticker': [None, '', '  ', None], 'Price': [1,2,3,4]}
        all_invalid_df = pd.DataFrame(all_invalid_tickers_data)
        all_invalid_csv_path = 'all_invalid_tickers.csv'
        all_invalid_df.to_csv(all_invalid_csv_path, index=False)
        tickers_from_all_invalid = get_unique_tickers_from_csv(all_invalid_csv_path)
        print(f"Tickers from all invalid CSV: {tickers_from_all_invalid}") # Should be []


    except Exception as e:
        print(f"An unexpected error occurred during example usage: {e}")
    finally:
        # Clean up dummy files
        import os
        if os.path.exists(dummy_csv_path):
            os.remove(dummy_csv_path)
        if os.path.exists(custom_csv_path): 
            os.remove(custom_csv_path)
        if os.path.exists(no_ticker_csv_path):
            os.remove(no_ticker_csv_path)
        if os.path.exists(empty_csv_path):
            os.remove(empty_csv_path)
        if os.path.exists(empty_data_csv_path):
            os.remove(empty_data_csv_path)
        if os.path.exists(all_invalid_csv_path):
            os.remove(all_invalid_csv_path)
        print("\nCleaned up dummy files.")
