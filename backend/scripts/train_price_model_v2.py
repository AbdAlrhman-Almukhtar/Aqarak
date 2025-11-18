import argparse, json, os, uuid, math
from datetime import datetime
import numpy as np, pandas as pd
from joblib import dump
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor

def _parse_building_age(x):
    if pd.isna(x): return np.nan
    s = str(x).strip().lower()
    if s in {"0–11 months","0-11 months","0 to 11 months","0–11 month"}: return 0.5
    bands = {"10–19 years":15,"20–29 years":25,"30–39 years":35,"40–49 years":45,
             "10-19 years":15,"20-29 years":25,"30-39 years":35,"40-49 years":45}
    for k,v in bands.items():
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
    ap.add_argument("--csv", required=True)
    ap.add_argument("--outdir", default="models")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    df = pd.read_csv(args.csv)

    def norm_col(name):
        m = {c.strip().lower().replace(" ","_"): c for c in df.columns}
        return m.get(name, name)

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
    denom = np.clip(bd.replace(0, 1), 1, None)
    X["area_per_bed"] = (X["area_sqm"] / denom).astype(float)
    bins = [0, 60, 90, 120, 160, 220, 10000]
    X["area_bin"] = pd.cut(X["area_sqm"], bins=bins, labels=False, include_lowest=True).astype("float")
    mask = y.notna() & X.notna().all(axis=1)
    X = X[mask]
    y2 = y[mask]
    Xtr, Xte, ytr, yte = train_test_split(X, y2, test_size=0.2, random_state=args.seed)
    rng = np.random.default_rng(args.seed)
    apt_mask = Xtr["property_type"].eq("Apartment").to_numpy()
    drop = rng.random(len(Xtr)) < 0.40
    Xtr.loc[apt_mask & drop, "furn_apt"] = 0.0

    num = ["bedrooms","bathrooms","area_sqm","area_log","area_sq","area_per_bed","floor","building_age","furn_apt","area_bin"]
    cat = ["city","neighborhood","property_type"]

    pre = ColumnTransformer(
        transformers=[
            ("num", "passthrough", num),
            ("oh", _onehot(), cat),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    gbr = GradientBoostingRegressor(
        learning_rate=0.08, n_estimators=500, max_depth=3, random_state=args.seed
    )
    pipe = Pipeline([("prep", pre), ("gbr", gbr)])
    W = _weights(
        Xtr[["area_sqm","property_type","furnished"]]
        .assign(property_type=Xtr["property_type"],
                area_sqm=Xtr["area_sqm"],
                furnished=Xtr["furnished"])
    )
    pipe.fit(Xtr.drop(columns=["furnished"]), ytr, gbr__sample_weight=W)
    pred_te = pipe.predict(Xte.drop(columns=["furnished"]))
    rmse = math.sqrt(mean_squared_error(yte, pred_te))
    mae  = mean_absolute_error(yte, pred_te)
    r2   = r2_score(yte, pred_te)
    mape = float(np.mean(np.abs((yte - pred_te) / np.clip(np.abs(yte), 1.0, None))) * 100)
    mid = uuid.uuid4().hex[:10]
    mpath = os.path.join(args.outdir, f"aqarak_price_model_{mid}.joblib")
    dump(pipe, mpath)
    meta = {
        "model_path": os.path.abspath(mpath),
        "created_at": datetime.utcnow().isoformat()+"Z",
        "model_id": mid,
        "metrics": {
            "MAE_JOD": round(float(mae), 2),
            "RMSE_JOD": round(float(rmse), 2),
            "MAPE_%": round(float(mape), 2),
            "R2": round(float(r2), 4),
            "N_train": int(len(Xtr)),
            "N_test": int(len(Xte)),
        },
        "features": {"numeric": num, "categorical": cat},
        "config": {"apt_furnished_cap_frac": 0.02}
    }
    with open(os.path.join(args.outdir, f"aqarak_price_model_{mid}.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print(json.dumps(meta, indent=2))

if __name__ == "__main__":
    main()