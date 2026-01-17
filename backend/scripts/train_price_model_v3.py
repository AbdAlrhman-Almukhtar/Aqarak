import argparse, json, os, uuid, math, logging
from datetime import datetime
import numpy as np, pandas as pd
from joblib import dump
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split, RandomizedSearchCV
import xgboost as xgb
from category_encoders import TargetEncoder

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def _parse_building_age(x):
    if pd.isna(x): return np.nan
    s = str(x).strip().lower()
    if s in {"0–11 months","0-11 months","0 to 11 months","0–11 month"}: return 0.5
    bands = {
        "1-5 years": 3, "5-10 years": 7.5, "10-19 years": 15,
        "20-29 years": 25, "30-39 years": 35, "40-49 years": 45
    }
    for k, v in bands.items():
        if k in s: return float(v)
    if "year" in s:
        try: return float("".join(ch for ch in s if ch.isdigit() or ch==".")) 
        except: return np.nan
    try: return float(s)
    except: return np.nan

def _bool(v):
    if isinstance(v, (bool, np.bool_)): return bool(v)
    s = str(v).strip().lower()
    return s in {"1","true","yes","y","t","فurnished","مفروش"}

def _weights(df: pd.DataFrame) -> np.ndarray:
    w = np.ones(len(df), dtype=float)
    is_ap = df["property_type"].str.title().eq("Apartment")
    furn = df["furnished"].astype(bool)
    w *= np.where(is_ap & furn, 0.6, 1.0)
    rank = df["area_sqm"].rank(pct=True)
    w *= 0.7 + 0.6 * rank
    w = np.clip(w, 0.2, 3.0)
    w *= len(w) / w.sum()
    return w

def _onehot(**kw):
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False, **kw)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False, **kw)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True, help="Path to the training CSV file")
    ap.add_argument("--outdir", default="models", help="Directory to save the model and metadata")
    ap.add_argument("--seed", type=int, default=42, help="Random seed")
    ap.add_argument("--trials", type=int, default=20, help="Number of hyperparameter search trials")
    args = ap.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    logger.info(f"Loading data from {args.csv}...")
    df = pd.read_csv(args.csv)

    def norm_col(name):
        m = {c.strip().lower().replace(" ","_"): c for c in df.columns}
        return m.get(name, name)
    logger.info("Preprocessing data...")
    y = pd.to_numeric(df[norm_col("price")], errors="coerce")
    prop = df[norm_col("property_type")].astype(str).str.title()
    city = df[norm_col("city")].astype(str)
    neigh = df[norm_col("neighborhood")].astype(str)
    bedrooms = pd.to_numeric(df.get(norm_col("bedrooms")), errors="coerce")
    bathrooms = pd.to_numeric(df.get(norm_col("bathrooms")), errors="coerce")
    area = pd.to_numeric(df.get(norm_col("area_sqm")), errors="coerce")
    floor = pd.to_numeric(df.get(norm_col("floor")), errors="coerce")
    ba_raw = df.get(norm_col("building_age"))
    building_age = ba_raw.map(_parse_building_age) if ba_raw is not None else np.nan
    furn_raw = df.get(norm_col("furnished"))
    furnished = furn_raw.map(_bool) if furn_raw is not None else False
    is_apartment = prop.eq("Apartment").astype(int)
    furn_apt = (furnished.astype(int) * is_apartment).astype(float)
    X = pd.DataFrame({
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "area_sqm": area,
        "area_log": np.log1p(area),
        "area_sq": np.square(np.clip(area, 0, None)),
        "floor": floor,
        "building_age": building_age,
        "furn_apt": furn_apt,
        "city": city,
        "neighborhood": neigh,
        "property_type": prop,
        "furnished": furnished.astype(bool), 
    })

    bd = X["bedrooms"].fillna(0)
    ba = X["bathrooms"].replace(0, 1).fillna(1)
    denom = np.clip(bd.replace(0, 1), 1, None)
    X["area_per_bed"] = (X["area_sqm"] / denom).astype(float)
    X["bed_per_bath"] = (bd / ba).astype(float)
    
    bins = [0, 60, 90, 120, 160, 220, 10000]
    X["area_bin"] = pd.cut(X["area_sqm"], bins=bins, labels=False, include_lowest=True).astype("float")
    mask = y.notna() & X.notna().all(axis=1)
    X = X[mask]
    y2 = y[mask]
    df_train = X.copy()
    df_train['price'] = y2
    
    initial_len = len(df_train)
    
    df_train = df_train[df_train['price'] >= 10000]  
    df_train = df_train[df_train['price'] <= 5000000]
    df_train = df_train[df_train['area_sqm'] >= 20]
    df_train = df_train[df_train['area_sqm'] <= 20000]
    df_train['price_per_sqm'] = df_train['price'] / df_train['area_sqm']
    df_train = df_train[df_train['price_per_sqm'] >= 100]
    df_train = df_train[df_train['price_per_sqm'] <= 10000] 
    df_train = df_train.drop(columns=['price_per_sqm'])

    logger.info(f"Dropped {initial_len - len(df_train)} rows due to outlier filtering.")
    
    X = df_train.drop(columns=['price'])
    y2 = df_train['price']

    logger.info(f"Dataset size after cleaning: {len(X)}")
    Xtr, Xte, ytr, yte = train_test_split(X, y2, test_size=0.2, random_state=args.seed)
    ytr_log = np.log1p(ytr)
    rng = np.random.default_rng(args.seed)
    apt_mask = Xtr["property_type"].eq("Apartment").to_numpy()
    drop = rng.random(len(Xtr)) < 0.40
    Xtr.loc[apt_mask & drop, "furn_apt"] = 0.0
    
    num = ["bedrooms","bathrooms","area_sqm","area_log","area_sq","area_per_bed","bed_per_bath","floor","building_age","furn_apt","area_bin"]
    te_feats = ["city","neighborhood"]
    oh_feats = ["property_type"]

    pre = ColumnTransformer(
        transformers=[
            ("num", "passthrough", num),
            ("te", TargetEncoder(smoothing=10), te_feats),
            ("oh", _onehot(), oh_feats),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    xgb_model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_jobs=-1,
        random_state=args.seed
    )

    pipeline = Pipeline([("prep", pre), ("xgb", xgb_model)])
    logger.info("Starting hyperparameter tuning...")
    param_dist = {
        'xgb__n_estimators': [500, 800, 1000, 1500, 2000, 2500, 3000],
        'xgb__learning_rate': [0.005, 0.01, 0.02, 0.03, 0.05, 0.1],
        'xgb__max_depth': [4, 5, 6, 7, 8, 9, 10, 12],
        'xgb__min_child_weight': [1, 3, 5, 7],
        'xgb__subsample': [0.6, 0.7, 0.8, 0.9],
        'xgb__colsample_bytree': [0.5, 0.6, 0.7, 0.8],
        'xgb__gamma': [0, 0.1, 0.2, 0.3]
    }
    W_train = _weights(
        Xtr[["area_sqm","property_type","furnished"]]
        .assign(property_type=Xtr["property_type"],
                area_sqm=Xtr["area_sqm"],
                furnished=Xtr["furnished"])
    )
    search = RandomizedSearchCV(
        pipeline,
        param_distributions=param_dist,
        n_iter=50,
        scoring='neg_mean_absolute_error',
        cv=3,
        verbose=1,
        random_state=args.seed,
        n_jobs=-1
    )
    search.fit(Xtr.drop(columns=["furnished"]), ytr_log, xgb__sample_weight=W_train)

    best_model = search.best_estimator_
    logger.info(f"Best parameters found: {search.best_params_}")
    logger.info("Evaluating best model...")
    pred_log = best_model.predict(Xte.drop(columns=["furnished"]))
    pred_te = np.expm1(pred_log)
    rmse = math.sqrt(mean_squared_error(yte, pred_te))
    mae  = mean_absolute_error(yte, pred_te)
    r2   = r2_score(yte, pred_te)
    mape = float(np.mean(np.abs((yte - pred_te) / np.clip(np.abs(yte), 1.0, None))) * 100)
    logger.info(f"Test Metrics (ALL): MAE={mae:.2f}, RMSE={rmse:.2f}, R2={r2:.4f}, MAPE={mape:.2f}%")
    
    # here where we calculate metrics
    is_apt_test = Xte['property_type'].str.title() == 'Apartment'
    if is_apt_test.any():
        y_apt_true = yte[is_apt_test]
        y_apt_pred = pred_te[is_apt_test]
        
        apt_mae = mean_absolute_error(y_apt_true, y_apt_pred)
        apt_rmse = math.sqrt(mean_squared_error(y_apt_true, y_apt_pred))
        apt_r2 = r2_score(y_apt_true, y_apt_pred)
        apt_mape = float(np.mean(np.abs((y_apt_true - y_apt_pred) / np.clip(np.abs(y_apt_true), 1.0, None))) * 100)
        
        logger.info(f"Test Metrics (APARTMENTS ONLY): MAE={apt_mae:.2f}, RMSE={apt_rmse:.2f}, R2={apt_r2:.4f}, MAPE={apt_mape:.2f}%")
    else:
        apt_mae, apt_rmse, apt_r2, apt_mape = 0, 0, 0, 0

    mid = uuid.uuid4().hex[:10]
    mpath = os.path.join(args.outdir, f"aqarak_price_model_xgb_{mid}.joblib")
    dump(best_model, mpath)    
    meta = {
        "model_path": os.path.abspath(mpath),
        "created_at": datetime.utcnow().isoformat()+"Z",
        "model_id": mid,
        "model_type": "XGBoost",
        "metrics": {
            "MAE_JOD": round(float(mae), 2),
            "RMSE_JOD": round(float(rmse), 2),
            "MAPE_%": round(float(mape), 2),
            "R2": round(float(r2), 4),
            "APARTMENT_METRICS": {
                "MAE_JOD": round(float(apt_mae), 2),
                "RMSE_JOD": round(float(apt_rmse), 2),
                "R2": round(float(apt_r2), 4),
                "MAPE_%": round(float(apt_mape), 2),
            },
            "N_train": int(len(Xtr)),
            "N_test": int(len(Xte)),
        },
        "best_params": search.best_params_,
        "features": {"numeric": num, "target_encoded": te_feats, "onehot": oh_feats},
        "config": {"apt_furnished_cap_frac": 0.02}
    }
    
    json_path = os.path.join(args.outdir, f"aqarak_price_model_xgb_{mid}.json")
    with open(json_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(json.dumps(meta, indent=2))
    logger.info(f"Model saved to {mpath}")

if __name__ == "__main__":
    main()
