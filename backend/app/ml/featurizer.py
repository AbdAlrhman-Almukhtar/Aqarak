from typing import Optional
import numpy as np, pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

class FeatureBuilder(BaseEstimator, TransformerMixin):
    def __init__(self, train_mode: bool=False, seed: int=42,
                 apt_furn_dropout: float=0.7, hv_furn_dropout: float=0.8):
        self.train_mode = train_mode
        self.seed = seed
        self.apt_furn_dropout = float(apt_furn_dropout)
        self.hv_furn_dropout  = float(hv_furn_dropout)

    def _ensure_defaults(self):
        if not hasattr(self, "train_mode"): self.train_mode = False
        if not hasattr(self, "seed"): self.seed = 42
        if not hasattr(self, "apt_furn_dropout"): self.apt_furn_dropout = 0.7
        if not hasattr(self, "hv_furn_dropout"):  self.hv_furn_dropout  = 0.8

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series]=None):
        self._ensure_defaults()
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        self._ensure_defaults()
        df = X.copy()

        def bin_beds(v):
            try: n=float(v)
            except: return "unk"
            return "studio/1" if n<=1 else "2-3" if n<=3 else "4-5" if n<=5 else "6+"
        def bin_baths(v):
            try: n=float(v)
            except: return "unk"
            return "1" if n<=1 else "2" if n<=2 else "3" if n<=3 else "4+"
        df["bedrooms_bin"]=df["bedrooms"].map(bin_beds)
        df["bathrooms_bin"]=df["bathrooms"].map(bin_baths)
        floor = pd.to_numeric(df["floor"], errors="coerce")
        ptype = df["property_type"].astype(str).str.title()
        df["floor_is_ground"]=((ptype=="Apartment") & (floor.fillna(999)==0)).astype(int)
        hv = ptype.isin(["House","Villa","Townhouse"])
        df["hv_floor"]  = (hv * floor.fillna(0)).astype(float)
        df["hv_floor2"] = df["hv_floor"]**2
        area = pd.to_numeric(df["area_sqm"], errors="coerce").clip(lower=0)
        df["area_log"]=np.log1p(area)
        furn = df["furnished"].fillna(False).astype(bool)
        apt = (ptype=="Apartment")
        rng = np.random.default_rng(self.seed) if self.train_mode else None
        apt_mask = (rng.random(len(df)) > self.apt_furn_dropout) if self.train_mode else np.ones(len(df), bool)
        hv_mask  = (rng.random(len(df)) > self.hv_furn_dropout)  if self.train_mode else np.ones(len(df), bool)
        df["apt_furnished"] = np.where(
            apt & apt_mask, np.where(furn, "Furnished","Unfurnished"),
            np.where(apt, "NA", "NA")
        )
        df["hv_furnished"] = np.where(
            hv & hv_mask, np.where(furn, "Furnished","Unfurnished"),
            np.where(hv, "NA", "NA")
        )
        return df

    def __getstate__(self):
        d = self.__dict__.copy()
        d["train_mode"] = False
        return d

    def __setstate__(self, state):
        self.__dict__.update(state)
        self._ensure_defaults()
