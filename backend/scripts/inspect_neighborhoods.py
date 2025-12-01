import pandas as pd
import argparse

def inspect_neighborhoods(csv_path):
    print(f"Loading {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Basic cleaning
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['area_sqm'] = pd.to_numeric(df['area_sqm'], errors='coerce')
    
    # Filter valid data (same as training)
    df = df[df['price'].between(10000, 5000000)]
    df = df[df['area_sqm'].between(20, 20000)]
    
    df['price_per_sqm'] = df['price'] / df['area_sqm']
    df = df[df['price_per_sqm'].between(100, 10000)]
    
    # Group by neighborhood
    stats = df.groupby(['city', 'neighborhood']).agg(
        count=('price', 'count'),
        mean_price=('price', 'mean'),
        mean_psqm=('price_per_sqm', 'mean'),
        min_psqm=('price_per_sqm', 'min'),
        max_psqm=('price_per_sqm', 'max')
    ).reset_index()
    
    # Sort by mean_psqm descending
    print("\n--- Top 20 Most Expensive Neighborhoods (by Price/SQM) ---")
    print(stats.sort_values('mean_psqm', ascending=False).head(20).to_string(index=False))
    
    print("\n--- Top 20 Least Expensive Neighborhoods (by Price/SQM) ---")
    print(stats.sort_values('mean_psqm', ascending=True).head(20).to_string(index=False))

    print("\n--- Neighborhoods with few samples (< 5) ---")
    low_sample = stats[stats['count'] < 5].sort_values('count')
    print(f"Total neighborhoods with < 5 samples: {len(low_sample)}")
    print(low_sample.head(20).to_string(index=False))

if __name__ == "__main__":
    inspect_neighborhoods("data/all-cleaned-data_v3.csv")
