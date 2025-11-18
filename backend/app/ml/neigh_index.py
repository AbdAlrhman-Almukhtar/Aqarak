import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

class NeighborhoodIndex(BaseEstimator, TransformerMixin):
    """
    One numeric feature = median(y) per neighborhood learned on train.
    Unseen neighborhoods -> global median.
    """
    def __init__(self):
        self.map_ = None
        self.fallback_ = None

    def fit(self, X, y=None):
        if y is None:
            raise ValueError("NeighborhoodIndex needs y during fit.")
        col = (X.iloc[:, 0] if isinstance(X, pd.DataFrame)
               else pd.Series(np.asarray(X).ravel())).astype(str)
        s = pd.DataFrame({"neigh": col, "y": np.asarray(y, dtype=float)})
        self.map_ = s.groupby("neigh")["y"].median().to_dict()
        self.fallback_ = float(np.median(s["y"]))
        return self

    def transform(self, X):
        col = (X.iloc[:, 0] if isinstance(X, pd.DataFrame)
               else pd.Series(np.asarray(X).ravel())).astype(str)
        vals = col.map(self.map_).fillna(self.fallback_).to_numpy(dtype=float)
        return vals.reshape(-1, 1)