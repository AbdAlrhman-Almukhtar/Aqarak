import os, joblib, numpy as np, pandas as pd
from typing import Dict, Any, List, Optional
from app.ml.neigh_index import NeighborhoodIndex 

_MODEL = None

def _alias_neigh_index_for_pickle():
    import sys, types
    sys.modules.setdefault("__mp_main__", types.ModuleType("__mp_main__"))
    setattr(sys.modules["__mp_main__"], "NeighborhoodIndex",NeighborhoodIndex)

def _parse_building_age(v):
    if pd.isna(v): 
        return np.nan
    s=str(v).strip().lower()
    if s in {"0–11 months", "0-11 months"}: 
        return 0.5
    per={"10–19 years":15,"10-19 years": 15,"20–29 years": 25,"20-29 years": 25,"30–39 years": 35,"30-39 years": 35,"40–49 years": 45,"40-49 years": 45}
    for k, val in per.items():
        if k in s: return float(val)
    if "year" in s:
        digits = "".join(ch for ch in s if ch.isdigit() or ch==".")
        try: 
            return float(digits) if digits else np.nan
        except:
            return np.nan
    try: 
        return float(s)
    except: 
        return np.nan

def _to_bool(v):
    if isinstance(v, (bool, np.bool_)): return bool(v)
    s = str(v).strip().lower()
    return s in {"1","true","yes","y","t","فurnished","مفروش"}

def _build_frame(rows: List[Dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    cols = ["bedrooms","bathrooms","area_sqm","floor","building_age",
            "city","neighborhood","property_type","furnished"]
    for c in cols:
        if c not in df.columns:
            df[c] = (False if c == "furnished" else np.nan)
    df["bedrooms"]= pd.to_numeric(df["bedrooms"], errors="coerce").fillna(0)
    df["bathrooms"]= pd.to_numeric(df["bathrooms"], errors="coerce").fillna(1)
    df["area_sqm"]= pd.to_numeric(df["area_sqm"], errors="coerce").fillna(0)
    df["floor"]= pd.to_numeric(df["floor"], errors="coerce").fillna(0)
    df["building_age"]  = df["building_age"].map(_parse_building_age).fillna(5)
    df["city"]= df["city"].astype(str)
    df["neighborhood"]  = df["neighborhood"].astype(str)
    df["property_type"] = df["property_type"].astype(str).str.title()
    df["furnished"]= df["furnished"].map(_to_bool)
    area = df["area_sqm"].clip(lower=0)
    df["area_log"] = np.log1p(area)
    df["area_sq"] = np.square(area)
    bd=df["bedrooms"]
    denom=np.clip(bd.replace(0,1),1,None)
    df["area_per_bed"] = (area/denom).astype(float)
    bins = [0,60,90,120,160,220,10000]
    df["area_bin"]=pd.cut(area, bins=bins,labels=False,include_lowest=True).astype("float")
    is_apartment=df["property_type"].eq("Apartment").astype(int)
    df["furn_apt"]=(df["furnished"].astype(int) *  is_apartment).astype(float)
    return df

def load_model(model_path:Optional[str] = None):
    global _MODEL
    if not model_path:
        model_path = os.getenv("AQARAK_MODEL_PATH")
    if not model_path:
        raise RuntimeError("Model path not provided and AQARAK_MODEL_PATH not set")
    mp = os.path.abspath(model_path)
    _alias_neigh_index_for_pickle()
    _MODEL = joblib.load(mp)
    print(f"[ML] loaded model from: {mp}")
    return _MODEL

def predict_batch(model, rows: List[Dict[str, Any]]) -> np.ndarray:
    x=_build_frame(rows)
    y=model.predict(x)
    y = np.expm1(y)
    return np.asarray(y,dtype=float)

def predict_one(model, row: Dict[str, Any]) -> float:
    return float(predict_batch(model, [row])[0])