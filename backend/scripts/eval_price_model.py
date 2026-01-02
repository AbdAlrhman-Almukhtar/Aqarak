import argparse, os, sys, time
from typing import List, Tuple, Iterable
import numpy as np
import pandas as pd
from app.ml.predictor import load_model as _load_model, predict_batch
from app.api import ml_price_router as MLR

def _require_cols(df: pd.DataFrame, cols: List[str]) -> Tuple[pd.DataFrame, List[str]]:
    missing = [c for c in cols if c not in df.columns]
    return df, missing

def _to_norm_records(df: pd.DataFrame) -> List[dict]:
    """Apply router's _normalize row-by-row (adds area_sq handles total_floors->floor for villas)"""
    recs: List[dict] = []
    def _noneify(v): return None if (isinstance(v, float) and not np.isfinite(v)) else v
    for row in df.to_dict(orient="records"):
        row = {k: _noneify(v) for k, v in row.items()}
        recs.append(MLR._normalize(row))
    return recs

def _predict_df(model, df: pd.DataFrame) -> np.ndarray:
    """predict via production preprocessor (predict_batch) in chunks"""
    recs = _to_norm_records(df)
    out: List[float] = []
    B = 10000
    for i in range(0, len(recs), B):
        out.extend(predict_batch(model, recs[i:i+B]))
    return np.asarray(out, dtype=float)

def _metrics(y_true: np.ndarray, y_pred: np.ndarray):
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    err = y_pred - y_true
    mae = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err**2)))
    ss_res = float(np.sum(err**2))
    ss_tot = float(np.sum((y_true - np.mean(y_true))**2))
    r2 = float(1.0 - ss_res/ss_tot) if ss_tot > 0 else float("nan")
    mape = float(np.mean(np.abs(err / np.clip(np.abs(y_true), 1e-9, None))) * 100.0)
    wmape = float(np.sum(np.abs(err)) / np.clip(np.sum(np.abs(y_true)), 1e-9, None) * 100.0)
    return {"n": len(y_true), "MAE": mae, "RMSE": rmse, "R2": r2, "MAPE%": mape, "wMAPE%": wmape}

def _print_overall(tag: str, took_s: float, m: dict):
    print("\n=== Overall ===")
    print(f"n={m['n']}  time={took_s:.2f}s  mode={tag}")
    print(f"R2={m['R2']:.4f}  MAPE={m['MAPE%']:.2f}%  wMAPE={m['wMAPE%']:.2f}%  ACC≈{max(0.0, 100.0 - m['wMAPE%']):.2f}%")

def _print_groupby(df: pd.DataFrame, y_true: np.ndarray, y_pred: np.ndarray, keys: Iterable[str]):
    if not keys:
        return
    g = df.assign(_y=y_true, _p=y_pred).groupby(list(keys), dropna=False)
    rows = []
    for grp, sub in g:
        yt = sub["_y"].to_numpy(dtype=float)
        yp = sub["_p"].to_numpy(dtype=float)
        if len(yt) == 0:
            continue
        m = _metrics(yt, yp)
        label = grp if isinstance(grp, tuple) else (grp,)
        rows.append((*label, len(sub), m["MAE"], m["RMSE"], m["R2"], m["MAPE%"], m["wMAPE%"],
                     float(np.median(yt)), float(np.median(yp))))
    if not rows:
        return
    cols = list(keys) + ["n","MAE","RMSE","R2","MAPE%","wMAPE%","median_true","median_pred"]
    out = pd.DataFrame(rows, columns=cols).sort_values(by="MAE", ascending=False)
    pd.set_option("display.max_rows", 200)
    print(f"\n=== By {', '.join(keys)} ===")
    print(out.to_string(index=False))
    

def _router_predict(model, df_in: pd.DataFrame) -> np.ndarray:
    """
    mirrors ml_price_router.py:
      - normalize rows (adds area_sq, villas total_floors->floor)
      - neighborhood blend
      - market uplift
      - furnished anchor policy (unfurnished % off furnished)
      - floor/story adjustment
    """
    base_recs = _to_norm_records(df_in)
    base_df = pd.DataFrame(base_recs)
    if "furnished" not in base_df.columns:
        base_df["furnished"] = False
    base_df["furnished"] = base_df["furnished"].fillna(False).astype(bool)
    def _set(recs: List[dict], **over):
        out = []
        for r in recs:
            rr = dict(r)
            rr.update(over)
            out.append(rr)
        return out

    recs_t  = _set(base_recs, furnished=True)
    recs_f  = _set(base_recs, furnished=False)
    recs_t0 = _set(recs_t, neighborhood="")
    recs_f0 = _set(recs_f, neighborhood="")
    def _pred(recs: List[dict]) -> np.ndarray:
        out: List[float] = []
        B = 10000
        for i in range(0, len(recs), B):
            out.extend(predict_batch(model, recs[i:i+B]))
        return np.asarray(out, dtype=float)

    y_t  = _pred(recs_t)
    y_f  = _pred(recs_f)
    y_t0 = _pred(recs_t0)
    y_f0 = _pred(recs_f0)
    blend = float(getattr(MLR, "NEIGHBORHOOD_BLEND", 0.85))
    y_t_b = y_t0 + blend * (y_t - y_t0)
    y_f_b = y_f0 + blend * (y_f - y_f0)
    y_t_b = np.array([MLR._market_blend(v, r) for v, r in zip(y_t_b, recs_t)], dtype=float)
    y_f_b = np.array([MLR._market_blend(v, r) for v, r in zip(y_f_b, recs_f)], dtype=float)
    anchor = str(getattr(MLR, "FURNISHED_ANCHOR", "furnished")).lower()
    uf_pct = float(getattr(MLR, "UNFURNISHED_PCT", 0.107))
    want_furnished = base_df["furnished"].values
    if anchor == "furnished":
        y_when_f  = y_t_b
        y_when_uf = y_t_b * (1.0 - max(0.0, min(0.5, uf_pct)))
    else:
        y_when_f, y_when_uf = y_t_b, y_f_b
    y_base = np.where(want_furnished, y_when_f, y_when_uf)
    pts = base_df.get("property_type", pd.Series(["Apartment"] * len(base_df))).tolist()
    fls = base_df.get("floor", pd.Series([None] * len(base_df))).tolist()
    y_final = np.array([MLR._apply_floor_adj(v, f, p) for v, f, p in zip(y_base, fls, pts)], dtype=float)
    return np.maximum(0.0, y_final)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv")
    ap.add_argument("--price-col", default="price")
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--mode", choices=["raw", "router"], default="router")
    ap.add_argument("--groupby", default="")
    args = ap.parse_args()

    df = pd.read_csv(args.csv)

    need = [
        "bedrooms", "bathrooms", "furnished", "area_sqm",
        "floor", "building_age", "city", "neighborhood", "property_type"
    ]
    df, miss = _require_cols(df, need + [args.price_col])
    if miss:
        print(f"Missing columns in CSV: {miss}", file=sys.stderr)
        sys.exit(1)
    df = df.dropna(subset=need + [args.price_col]).copy()
    if args.limit:
        df = df.head(args.limit).copy()
    model_path = os.getenv("AQARAK_MODEL_PATH", os.path.join("models", "aqarak_price_model_latest.joblib"))
    model = _load_model(model_path)
    print(f"[ML] loaded model from: {model_path}")

    t0 = time.time()
    if args.mode == "raw":
        y_pred = _predict_df(model, df)
    else:
        y_pred = _router_predict(model, df)
    took = time.time() - t0

    y_true = df[args.price_col].to_numpy(dtype=float)
    m = _metrics(y_true, y_pred)
    _print_overall(args.mode, took, m)

    keys = [k.strip() for k in args.groupby.split(",") if k.strip()]
    if keys:
        _print_groupby(df, y_true, y_pred, keys)


if __name__ == "__main__":
    main()