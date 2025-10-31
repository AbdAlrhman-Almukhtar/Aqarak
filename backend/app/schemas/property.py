from typing import Optional
from pydantic import BaseModel, conint, confloat, ConfigDict

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: Optional[confloat(gt=0)] = None  # type: ignore
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    bedrooms: Optional[conint(ge=0)] = None  # type: ignore
    bathrooms: Optional[conint(ge=0)] = None  # type: ignore
    area_sqm: Optional[conint(ge=0)] = None  # type: ignore
    owner_id: int


class PropertyOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqm: Optional[int] = None
    is_active: bool
    owner_id: int

    model_config = ConfigDict(from_attributes=True)


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqm: Optional[float] = None
    is_active: Optional[bool] = None