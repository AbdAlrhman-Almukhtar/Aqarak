from typing import Optional
from pydantic import BaseModel, conint, confloat, ConfigDict, field_validator, model_validator

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_for_sale: bool = True
    price: Optional[confloat(gt=0)] = None  # type: ignore
    is_for_rent: bool = False
    rent_price: Optional[confloat(gt=0)] = None  # type: ignore
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    bedrooms: Optional[conint(ge=0)] = None  # type: ignore
    bathrooms: Optional[conint(ge=0)] = None  # type: ignore
    area_sqm: Optional[conint(ge=0)] = None  # type: ignore
    owner_id: int

    @field_validator("price", "rent_price", "area_sqm", "bedrooms", "bathrooms", mode="before")
    def _empty_to_none(cls, v):
        return None if v == "" or v is None else v

    @field_validator("price", mode="before")
    def _to_float_price(cls, v):
        return float(v) if v is not None else v

    @field_validator("rent_price", mode="before")
    def _to_float_rent_price(cls, v):
        return float(v) if v is not None else v

    @field_validator("is_for_sale", "is_for_rent", mode="before")
    def _boolify(cls, v):
        return bool(v)

    @model_validator(mode="after")
    def _check_offer_flags(self):
        if not (self.is_for_sale or self.is_for_rent):
            raise ValueError("At least one of is_for_sale or is_for_rent must be True.")
        if self.is_for_sale and self.price is None:
            raise ValueError("price is required when is_for_sale is True.")
        if self.is_for_rent and self.rent_price is None:
            raise ValueError("rent_price is required when is_for_rent is True.")
        return self


class PropertyOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_for_sale: bool
    price: Optional[float] = None
    is_for_rent: bool
    rent_price: Optional[float] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqm: Optional[int] = None
    is_active: bool
    owner_id: int
    is_favorited: Optional[bool] = None
    model_config = ConfigDict(from_attributes=True)
class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_for_sale: Optional[bool] = None
    price: Optional[float] = None
    is_for_rent: Optional[bool] = None
    rent_price: Optional[float] = None
    city: Optional[str] = None
    neighborhood: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_sqm: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("price", "rent_price", "area_sqm", "bedrooms", "bathrooms", mode="before")
    def _empty_to_none_update(cls, v):
        return None if v == "" or v is None else v

    @field_validator("price", "rent_price", mode="before")
    def _to_float(cls, v):
        return float(v) if v is not None else v