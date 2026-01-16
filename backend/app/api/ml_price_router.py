import os
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from app.ml.predictor import load_model, predict_one

router = APIRouter(prefix="/ml/price", tags=["ml:price"])

PTYPES = {"Apartment", "House", "Townhouse", "Villa", "Farm"}

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_MODEL = BASE_DIR / "models" / "aqarak_price_model_latest.joblib"
MODEL_PATH = Path(os.getenv("AQARAK_MODEL_PATH", str(DEFAULT_MODEL))).expanduser()
NEIGHBORHOOD_BLEND = 0.85
FURNISHED_ALL_PTYPES = True
FURNISHED_ANCHOR = "furnished"
UNFURNISHED_PCT = 0.107
APT_FURNISHED_CAP = 0.15
APT_FURNISHED_FLOOR = 0.08
APT_FURNISHED_BOOST = 2.0

APT_GF_PREMIUM = 0.11
APT_UP_STEP = 0.035
APT_B1_DROP = 0.20
APT_DOWN_STEP = 0.035
APT_UP_CAP= 0.20
APT_DOWN_CAP= 0.35
HV_STORIES_STEP = 0.05
HV_STORIES_CAP  = 0.15
MARKET_BLEND= 0.35

_PSQM_BASE = {
    ("amman", "abdoun", "apartment"): 950.0,
    ("amman", "khalda", "apartment"): 700.0,
    ("amman", "jubihaa", "apartment"): 520.0,
    ("amman", "khalda", "villa"): 900.0,
}
_PSQM_CITY_FALLBACK = {"amman": 500.0}
_PSQM_GLOBAL_FALLBACK = 450.0

_model = None
def _get_model():
    global _model
    if _model is None:
        p = MODEL_PATH
        models_dir = BASE_DIR / "models"
        try:
            target_missing = p.is_symlink() and not p.resolve().exists()
        except Exception:
            target_missing = False
        if (not p.exists()) or target_missing:
            cands = sorted(
                models_dir.glob("aqarak_price_model_*.joblib"),
                key=lambda x: x.stat().st_mtime,
                reverse=True,
            )
            if not cands:
                raise FileNotFoundError(f"No model found at {MODEL_PATH} or in {models_dir}")
            p = cands[0]
        _model = load_model(str(p))
    return _model

class PriceInput(BaseModel):
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=0)
    area_sqm: float = Field(gt=0)
    floor: Optional[float] = None
    total_floors: Optional[float] = None
    building_age: Optional[float] = None
    city: str
    neighborhood: str
    property_type: str
    furnished: bool

    @field_validator("property_type")
    @classmethod
    def _ptype(cls, v: str):
        v2 = v.strip().title()
        if v2 not in PTYPES:
            raise ValueError(f"property_type must be one of {sorted(PTYPES)}")
        return v2


def _normalize(d: dict) -> dict:
    if "neighborhood" in d:
        d["neighborhood"] = _fix_neighborhood(d["neighborhood"])

    pt = str(d.get("property_type","")).title()
    if pt in {"House","Villa","Townhouse"} and d.get("floor") is None:
        tf = d.get("total_floors")
        if tf is not None:
            d["floor"] = tf
    d.pop("total_floors", None)
    try:
        a = float(d.get("area_sqm", None))
        if a > 0:
            d["area_sq"] = a * a
    except (TypeError, ValueError):
        pass
    
    return d
    
def _norm(s) -> str:
    return str(s or "").strip().lower()
def _psqm_baseline(payload: dict) -> float:
    city = _norm(payload.get("city"))
    nb   = _norm(payload.get("neighborhood"))
    pt   = _norm(payload.get("property_type"))
    v = _PSQM_BASE.get((city, nb, pt))
    if v: return float(v)
    v = _PSQM_BASE.get((city, nb, "*")) or _PSQM_BASE.get((city, "*", pt))
    if v: return float(v)
    if city in _PSQM_CITY_FALLBACK:
        return float(_PSQM_CITY_FALLBACK[city])
    return float(_PSQM_GLOBAL_FALLBACK)

def _market_blend(y: float, payload: dict) -> float:
    """Lift predictions toward area×neighborhood per-sqm floor"""
    try:
        area = float(payload.get("area_sqm") or 0.0)
    except Exception:
        area = 0.0
    if area <= 0 or y <= 0:
        return y
    psqm_floor = max(1.0, _psqm_baseline(payload))
    y_market = psqm_floor * area
    if y_market <= y:
        return y
    ratio = y_market / y
    return float(y * (ratio ** MARKET_BLEND))  

def _apply_neigh_blend(model, payload: dict, blend: float) -> float:
    neutral = dict(payload); neutral["neighborhood"] = ""
    y0 = float(predict_one(model, neutral))
    y1 = float(predict_one(model, payload))
    y = float(y0 + blend * (y1 - y0))
    return _market_blend(y, payload)

def _apt_floor_factor(floor) -> float:
    try:
        f = int(round(float(floor)))
    except Exception:
        return 1.0
    if f == 0:
        return 1.0 + APT_GF_PREMIUM
    if f > 0:
        steps = max(0, f - 1)
        drop = min(APT_UP_CAP, steps * APT_UP_STEP)
        return max(0.0, 1.0 - drop)
    if f == -1:
        return max(0.0, 1.0 - APT_B1_DROP)
    extra = abs(f) - 1
    base = max(0.0, 1.0 - APT_B1_DROP)
    factor = base * ((1.0 - APT_DOWN_STEP) ** extra)
    min_cap = 1.0 - APT_B1_DROP - APT_DOWN_CAP
    return max(min_cap, factor)

def _hv_stories_factor(floor) -> float:
    try:
        stories = max(1, int(round(float(floor or 1))))
    except Exception:
        stories = 1
    inc = min(HV_STORIES_CAP, (stories - 1) * HV_STORIES_STEP)
    return 1.0 + inc

def _apply_floor_adj(y: float, floor, pt) -> float:
    if str(pt).title() == "Apartment":
        return float(max(0.0, y) * _apt_floor_factor(floor))
    if str(pt).title() in {"House", "Villa", "Townhouse"}:
        return float(max(0.0, y) * _hv_stories_factor(floor))
    return float(max(0.0, y))

def _predict_controlled(model, payload: dict) -> float:
    base = {k: v for k, v in payload.items() if v is not None}
    pt = str(base.get("property_type", "")).strip().title()
    p_t = dict(base); p_t["furnished"] = True
    p_f = dict(base); p_f["furnished"] = False
    y_t = _apply_neigh_blend(model, p_t, NEIGHBORHOOD_BLEND)
    y_f = _apply_neigh_blend(model, p_f, NEIGHBORHOOD_BLEND)
    apply_furn = FURNISHED_ALL_PTYPES or pt == "Apartment"
    if not apply_furn:
        y = y_t if base.get("furnished", False) else y_f
        return _apply_floor_adj(y, base.get("floor"), pt)
    if FURNISHED_ANCHOR == "furnished":
        if base.get("furnished", False):
            return _apply_floor_adj(y_t, base.get("floor"), pt)
        uf = y_t * (1.0 - UNFURNISHED_PCT)
        return _apply_floor_adj(uf, base.get("floor"), pt)
    mid = 0.5 * (y_t + y_f)
    cap_amt   = abs(APT_FURNISHED_CAP)   * max(1.0, mid)
    floor_amt = abs(APT_FURNISHED_FLOOR) * max(1.0, mid)
    raw_delta = (y_t - y_f) * max(0.0, APT_FURNISHED_BOOST)
    target = (min(max(raw_delta, floor_amt), cap_amt)
              if raw_delta >= 0 else
              max(min(raw_delta, -floor_amt), -cap_amt))
    final_f  = _apply_floor_adj(y_f + target,  base.get("floor"), pt)
    final_uf = _apply_floor_adj(y_t - target,  base.get("floor"), pt)
    return float(final_f if base.get("furnished", False) else final_uf)

@router.post("/predict")
def predict(inp: PriceInput):
    try:
        payload = _normalize(inp.model_dump())
        y = _predict_controlled(_get_model(), payload)
        return {"price_jod": round(max(0.0, y), 2)}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))