# Aqarak Price Prediction Model Documentation

## Overview
The Aqarak Price Prediction Model estimates the market value of residential properties (Apartments, Villas, etc.) in Jordan based on their physical characteristics and location.

## Model Architecture
- **Algorithm**: XGBoost Regressor (Extreme Gradient Boosting).
- **Type**: Ensemble Learning (Gradient Boosting on Decision Trees).
- **Optimization**: Hyperparameters are tuned using `RandomizedSearchCV` to find the best configuration for the specific dataset.

## Features
The model uses a combination of numeric and categorical features:

### Numeric Features
1.  **bedrooms**: Number of bedrooms.
2.  **bathrooms**: Number of bathrooms.
3.  **area_sqm**: Total area in square meters.
4.  **area_log**: Logarithm of area (helps with skewness).
5.  **area_sq**: Square of area (captures non-linear relationships).
6.  **area_per_bed**: Interaction term (Area / Bedrooms).
7.  **floor**: Floor number.
8.  **building_age**: Age of the building in years.
9.  **furn_apt**: Interaction term (Furnished status * Apartment type).
10. **area_bin**: Binned area category.

### Categorical Features
1.  **city**: City name (One-Hot Encoded).
2.  **neighborhood**: Neighborhood name (One-Hot Encoded).
3.  **property_type**: Type of property (Apartment, Villa, etc.) (One-Hot Encoded).

## Training Process

### Prerequisites
Ensure you have the required dependencies installed:
```bash
pip install -r requirements.txt
```
(Make sure `xgboost` is in your `requirements.txt`)

### Running the Training Script
To train a new model, run the `train_price_model_v3.py` script:

```bash
python -m scripts.train_price_model_v3 --csv path/to/your/data.csv
```

### Arguments
- `--csv`: (Required) Path to the training CSV file.
- `--outdir`: Directory to save the model and metadata (default: `models`).
- `--seed`: Random seed for reproducibility (default: `42`).
- `--trials`: Number of hyperparameter search trials (default: `20`). Higher numbers take longer but may find better parameters.

### Output
The script will output two files in the `models` directory:
1.  `aqarak_price_model_xgb_<id>.joblib`: The trained model pipeline.
2.  `aqarak_price_model_xgb_<id>.json`: Metadata containing metrics, best parameters, and feature list.

## Evaluation Metrics
The model is evaluated using the following metrics:
- **MAE (Mean Absolute Error)**: Average absolute difference between predicted and actual price (in JOD). Lower is better.
- **RMSE (Root Mean Squared Error)**: Penalizes large errors more than MAE. Lower is better.
- **MAPE (Mean Absolute Percentage Error)**: Average percentage error. Lower is better.
- **R2 Score**: Explains how well the model captures the variance in the data (0 to 1). Higher is better.

## Integration
The model is saved as a standard scikit-learn pipeline (wrapping XGBoost) and can be loaded using `joblib.load()`.
The inference logic in `app/ml/predictor.py` is compatible with this pipeline structure.
