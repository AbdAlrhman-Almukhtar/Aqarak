import argparse
import pandas as pd
from numbers_parser import Document
import os

def convert_numbers_to_csv(input_path, output_path):
    print(f"Loading {input_path}...")
    doc = Document(input_path)
    sheets = doc.sheets
    if not sheets:
        print("No sheets found in the document.")
        return
    sheet = sheets[0]
    tables = sheet.tables
    if not tables:
        print("No tables found in the first sheet.")
        return
    table = tables[0]
    data = table.rows(values_only=True)
    if not data:
        print("Table is empty.")
        return
    header = data[0]
    rows = data[1:]
    df = pd.DataFrame(rows, columns=header)
    print(f"Saving to {output_path}...")
    df.to_csv(output_path, index=False)
    print("Done.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert .numbers to .csv")
    parser.add_argument("input", help="Input .numbers file path")
    parser.add_argument("output", help="Output .csv file path")
    args = parser.parse_args()
    convert_numbers_to_csv(args.input, args.output)
