from pydantic import BaseModel
from datetime import datetime

class FavoriteOut(BaseModel):
    id: int
    user_id: int
    property_id: int
    created_at: datetime
    class Config:
        from_attributes = True