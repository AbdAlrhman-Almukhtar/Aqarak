import pandas as pd
import numpy as np
import argparse

def analyze_outliers(csv_path):
    print(f"Loading {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Basic cleaning (similar to training script)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['area_sqm'] = pd.to_numeric(df['area_sqm'], errors='coerce')
    df = df.dropna(subset=['price', 'area_sqm'])
    
    print(f"\nTotal records: {len(df)}")
    
    # Price Statistics
    print("\n--- Price Statistics ---")
    print(df['price'].describe().apply(lambda x: format(x, 'f')))
    
    # Area Statistics
    print("\n--- Area Statistics ---")
    print(df['area_sqm'].describe().apply(lambda x: format(x, 'f')))
    
    # Price per SQM
    df['price_per_sqm'] = df['price'] / df['area_sqm']
    print("\n--- Price per SQM Statistics ---")
    print(df['price_per_sqm'].describe().apply(lambda x: format(x, 'f')))
    
    # Identify potential outliers using IQR
    Q1 = df['price'].quantile(0.25)
    Q3 = df['price'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    outliers = df[(df['price'] < lower_bound) | (df['price'] > upper_bound)]
    print(f"\nPotential Price Outliers (IQR method): {len(outliers)}")
    print(f"Lower Bound: {lower_bound:,.2f}")
    print(f"Upper Bound: {upper_bound:,.2f}")
    
    print("\nTop 10 Most Expensive Properties:")
    print(df.nlargest(10, 'price')[['price', 'area_sqm', 'city', 'neighborhood', 'property_type']])
    
    print("\nTop 10 Least Expensive Properties:")
    print(df.nsmallest(10, 'price')[['price', 'area_sqm', 'city', 'neighborhood', 'property_type']])

    print("\nTop 10 Highest Price per SQM:")
    print(df.nlargest(10, 'price_per_sqm')[['price', 'area_sqm', 'price_per_sqm', 'city', 'neighborhood', 'property_type']])

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", help="Path to CSV file")
    args = parser.parse_args()
    analyze_outliers(args.csv)
