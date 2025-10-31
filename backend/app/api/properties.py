from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc, func, text
from app.db.session import get_db
from app.db.models import Property, User
from app.schemas.property import PropertyCreate, PropertyOut, PropertyUpdate
from app.deps import get_current_user

router = APIRouter(prefix="/properties", tags=["properties"])

ORDER_MAP = {
    "id": Property.id,
    "price": Property.price,
    "area_sqm": Property.area_sqm,
    "bedrooms": Property.bedrooms,
}

TRGM_LIMIT = 0.2

def _rank(q: str):
    return func.coalesce(
        func.greatest(
            func.similarity(func.coalesce(Property.city, ""), q),
            func.similarity(func.coalesce(Property.neighborhood, ""), q),
            func.similarity(func.coalesce(Property.title, ""), q),
        ),
        0.0,
    )

@router.get("/count")
def property_count(db: Session = Depends(get_db), q: Optional[str] = None, city: Optional[str] = None):
    qset = db.query(Property).filter(Property.is_active.is_(True))
    if q:
        db.execute(text("SELECT set_limit(:lim)"), {"lim": TRGM_LIMIT})
        qset = qset.filter(_rank(q) > TRGM_LIMIT)
    if city:
        qset = qset.filter(Property.city.ilike(f"%{city}%"))
    return {"count": qset.count()}


@router.post("", response_model=PropertyOut, status_code=201)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.id != payload.owner_id:
        raise HTTPException(status_code=403, detail="owner mismatch")
    if not db.get(User, payload.owner_id):
        raise HTTPException(status_code=404, detail="owner not found")

    p = Property(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("", response_model=list[PropertyOut])
def list_properties(
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
    q: Optional[str] = Query(None, description="free-text search"),
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms_min: Optional[int] = None,
    bedrooms_max: Optional[int] = None,
    area_min: Optional[float] = None,
    area_max: Optional[float] = None,
    sort: str = Query("-id", regex="^-?(id|price|area_sqm|bedrooms)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    qset = db.query(Property).filter(Property.is_active.is_(True))

    if city:
        qset = qset.filter(Property.city.ilike(f"%{city}%"))
    if min_price is not None:
        qset = qset.filter(Property.price >= min_price)
    if max_price is not None:
        qset = qset.filter(Property.price <= max_price)
    if bedrooms_min is not None:
        qset = qset.filter(Property.bedrooms >= bedrooms_min)
    if bedrooms_max is not None:
        qset = qset.filter(Property.bedrooms <= bedrooms_max)
    if area_min is not None:
        qset = qset.filter(Property.area_sqm >= area_min)
    if area_max is not None:
        qset = qset.filter(Property.area_sqm <= area_max)

    desc_order = sort.startswith("-")
    field = sort[1:] if desc_order else sort
    col = ORDER_MAP[field]

    if q:
        db.execute(text("SELECT set_limit(:lim)"), {"lim": TRGM_LIMIT})
        rank = _rank(q)
        qset = qset.filter(rank > TRGM_LIMIT)
        qset = qset.order_by(rank.desc().nulls_last(),
                             (desc(col) if desc_order else asc(col)).nulls_last())
    else:
        qset = qset.order_by((desc(col) if desc_order else asc(col)).nulls_last())

    offset = (page - 1) * page_size
    return qset.offset(offset).limit(page_size).all()


@router.get("/{prop_id}", response_model=PropertyOut)
def get_property(prop_id: int, db: Session = Depends(get_db), _user=Depends(get_current_user)):
    p = db.get(Property, prop_id)
    if not p:
        raise HTTPException(status_code=404, detail="not found")
    return p


@router.patch("/{prop_id}", response_model=PropertyOut)
def update_property(
    prop_id: int,
    payload: PropertyUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    p = db.get(Property, prop_id)
    if not p:
        raise HTTPException(status_code=404, detail="not found")
    if p.owner_id != user.id:
        raise HTTPException(status_code=403, detail="not owner")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{prop_id}", status_code=204)
def delete_property(
    prop_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    p = db.get(Property, prop_id)
    if not p:
        raise HTTPException(status_code=404, detail="not found")
    if p.owner_id != user.id:
        raise HTTPException(status_code=403, detail="not owner")

    db.delete(p)
    db.commit()
    return