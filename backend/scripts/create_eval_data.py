import pandas as pd
import numpy as np

def clean_data_for_eval(input_path, output_path):
    print(f"Loading {input_path}...")
    df = pd.read_csv(input_path)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['area_sqm'] = pd.to_numeric(df['area_sqm'], errors='coerce')
    initial_len = len(df)
    df = df[df['price'] >= 10000]
    df = df[df['price'] <= 5000000]
    df = df[df['area_sqm'] >= 20]
    df = df[df['area_sqm'] <= 20000]
    df['price_per_sqm'] = df['price'] / df['area_sqm']
    df = df[df['price_per_sqm'] >= 100]
    df = df[df['price_per_sqm'] <= 10000]
    df = df.drop(columns=['price_per_sqm'])
    
    print(f"Filtered {initial_len - len(df)} outliers.")
    print(f"Saving cleaned data to {output_path}...")
    df.to_csv(output_path, index=False)

if __name__ == "__main__":
    clean_data_for_eval("data/all-cleaned-data_v3.csv", "data/eval-cleaned-data.csv")
