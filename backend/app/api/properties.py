import importlib
from typing import Optional, List, Set
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, Response, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func, text, cast as sa_cast, literal
from sqlalchemy.types import Text
from app.db.session import get_db
from app.db.models import Property, PropertyImage, User,Favorite
from app.schemas.property import PropertyCreate, PropertyOut, PropertyUpdate
from app.deps import get_current_user, get_optional_user
from app.api.ml_price_router import (
    PriceInput as MLPriceInput,
)

router = APIRouter(prefix="/properties", tags=["properties"])

@router.get("/statistics")
def get_property_stats(db: Session = Depends(get_db)):
    # Total active properties
    total_count = db.query(func.count(Property.id)).filter(Property.is_active.is_(True)).scalar() or 0
    
    # Average price of properties for sale
    avg_sale = db.query(func.avg(Property.price)).filter(
        Property.is_active.is_(True),
        Property.is_for_sale.is_(True)
    ).scalar() or 0

    # Average price of properties for rent
    avg_rent = db.query(func.avg(Property.rent_price)).filter(
        Property.is_active.is_(True),
        Property.is_for_rent.is_(True)
    ).scalar() or 0

    # Counts
    sale_count = db.query(func.count(Property.id)).filter(
        Property.is_active.is_(True),
        Property.is_for_sale.is_(True)
    ).scalar() or 0

    rent_count = db.query(func.count(Property.id)).filter(
        Property.is_active.is_(True),
        Property.is_for_rent.is_(True)
    ).scalar() or 0
    
    # Unique neighborhoods count
    neighbors_count = db.query(func.count(func.distinct(Property.neighborhood))).filter(Property.is_active.is_(True)).scalar() or 0
    
    return {
        "total": total_count,
        "sale": {
            "count": sale_count,
            "avg_price": round(float(avg_sale), 2) if avg_sale else 0
        },
        "rent": {
            "count": rent_count,
            "avg_price": round(float(avg_rent), 2) if avg_rent else 0
        },
        "neighborhoods": neighbors_count
    }

ORDER_MAP = {
    "id": Property.id,
    "price": Property.price,
    "rent_price": Property.rent_price,
    "area_sqm": Property.area_sqm,
    "bedrooms": Property.bedrooms,
}

TRGM_LIMIT = 0.20


def _rank(q: str):
    empty_txt = literal("", Text())
    city = func.coalesce(sa_cast(Property.city, Text), empty_txt)
    neigh = func.coalesce(sa_cast(Property.neighborhood, Text), empty_txt)
    title = func.coalesce(sa_cast(Property.title, Text), empty_txt)
    return func.greatest(
        func.similarity(city, q),
        func.similarity(neigh, q),
        func.similarity(title, q),
    )


def _favorite_id_set(db: Session, user_id: int, prop_ids: List[int]) -> Set[int]:
    if not prop_ids:
        return set()
    rows = (
        db.query(Favorite.property_id)
        .filter(Favorite.user_id == user_id, Favorite.property_id.in_(prop_ids))
        .all()
    )
    return {pid for (pid,) in rows}


@router.get("/search")
def search_properties(
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
    q: Optional[str] = Query(None),
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rent: Optional[float] = None,
    max_rent: Optional[float] = None,
    bedrooms_min: Optional[int] = None,
    bedrooms_max: Optional[int] = None,
    area_min: Optional[float] = None,
    area_max: Optional[float] = None,
    is_for_sale: Optional[bool] = None,
    is_for_rent: Optional[bool] = None,
    property_type: Optional[str] = None,
    furnished: Optional[bool] = None,
    floor_min: Optional[int] = None,
    floor_max: Optional[int] = None,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    sort: str = Query("-id", regex="^-?(id|price|rent_price|area_sqm|bedrooms)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    base = db.query(Property).filter(Property.is_active.is_(True))

    if is_for_sale is not None:
        base = base.filter(Property.is_for_sale.is_(is_for_sale))
    if is_for_rent is not None:
        base = base.filter(Property.is_for_rent.is_(is_for_rent))

    if min_price is not None:
        base = base.filter(Property.price >= min_price)
    if max_price is not None:
        base = base.filter(Property.price <= max_price)
    if min_rent is not None:
        base = base.filter(Property.rent_price >= min_rent)
    if max_rent is not None:
        base = base.filter(Property.rent_price <= max_rent)

    if bedrooms_min is not None:
        base = base.filter(Property.bedrooms >= bedrooms_min)
    if bedrooms_max is not None:
        base = base.filter(Property.bedrooms <= bedrooms_max)
    if area_min is not None:
        base = base.filter(Property.area_sqm >= area_min)
    if area_max is not None:
        base = base.filter(Property.area_sqm <= area_max)
    if city:
        base = base.filter(Property.city.ilike(f"%{city}%"))

    if property_type:
        base = base.filter(Property.property_type == property_type)
    if furnished is not None:
        base = base.filter(Property.furnished.is_(furnished))
    
    if floor_min is not None:
        base = base.filter(Property.floor >= floor_min)
    if floor_max is not None:
        base = base.filter(Property.floor <= floor_max)
        
    if age_min is not None:
        base = base.filter(Property.building_age >= age_min)
    if age_max is not None:
        base = base.filter(Property.building_age <= age_max)

    using_trgm = False
    if q:
        try:
            db.execute(text("SELECT set_limit(:lim)"), {"lim": TRGM_LIMIT})
            r = _rank(q)
            base = base.filter(r > TRGM_LIMIT)
            using_trgm = True
        except Exception:
            db.rollback()
            ilike = f"%{q}%"
            base = base.filter(
                func.coalesce(Property.city, "").ilike(ilike)
                | func.coalesce(Property.neighborhood, "").ilike(ilike)
                | func.coalesce(Property.title, "").ilike(ilike)
            )

    subq = base.subquery()
    overall = db.query(
        func.count(subq.c.id),
        func.avg(subq.c.price),
        func.min(subq.c.price),
        func.max(subq.c.price),
        func.avg(subq.c.rent_price),
        func.min(subq.c.rent_price),
        func.max(subq.c.rent_price),
    ).one()

    total = int(overall[0] or 0)
    avg_sale, min_sale, max_sale = overall[1], overall[2], overall[3]
    avg_rent, min_rent_v, max_rent_v = overall[4], overall[5], overall[6]
    total_pages = (total + page_size - 1) // page_size if page_size else 1

    sale_count = (
        db.query(func.count(subq.c.id)).filter(subq.c.is_for_sale.is_(True)).scalar() or 0
    )
    rent_count = (
        db.query(func.count(subq.c.id)).filter(subq.c.is_for_rent.is_(True)).scalar() or 0
    )

    desc_order = sort.startswith("-")
    field = sort[1:] if desc_order else sort
    col = ORDER_MAP[field]

    if q and using_trgm:
        try:
            r = _rank(q)
            base = base.order_by(
                r.desc().nulls_last(),
                (desc(col) if desc_order else asc(col)).nulls_last(),
            )
        except Exception:
            db.rollback()
            base = base.order_by((desc(col) if desc_order else asc(col)).nulls_last())
    else:
        base = base.order_by((desc(col) if desc_order else asc(col)).nulls_last())

    rows = base.offset((page - 1) * page_size).limit(page_size).all()
    prop_ids = [r.id for r in rows]
    fav_set = _favorite_id_set(db, _user.id, prop_ids)

    items = []
    for r in rows:
        d = PropertyOut.model_validate(r, from_attributes=True).model_dump()
        d["is_favorited"] = (r.id in fav_set)
        
        imgs = sorted(r.images, key=lambda x: x.sort_order)
        d["images"] = [i.url for i in imgs]
        d["cover_image"] = next((i.url for i in imgs if i.is_cover), d["images"][0] if d["images"] else None)
        
        if r.owner:
            d["lister_name"] = r.owner.name or r.owner.email
            d["lister_contact"] = r.owner.phone or r.owner.email
        
        items.append(d)

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "stats": {
            "sale": {
                "count": int(sale_count),
                "avg_price": float(avg_sale) if avg_sale is not None else None,
                "min_price": float(min_sale) if min_sale is not None else None,
                "max_price": float(max_sale) if max_sale is not None else None,
            },
            "rent": {
                "count": int(rent_count),
                "avg_rent": float(avg_rent) if avg_rent is not None else None,
                "min_rent": float(min_rent_v) if min_rent_v is not None else None,
                "max_rent": float(max_rent_v) if max_rent_v is not None else None,
            },
        },
        "data": items,
    }


@router.get("/count")
def property_count(
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    city: Optional[str] = None,
):
    qset = db.query(Property).filter(Property.is_active.is_(True))
    if q:
        qset = qset.filter(_rank(q) > TRGM_LIMIT)
    if city:
        qset = qset.filter(Property.city.ilike(f"%{city}%"))
    return {"count": qset.count()}


@router.get("/me", response_model=List[PropertyOut])
def list_my_properties(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    rows = (
        db.query(Property)
        .filter(Property.owner_id == user.id)
        .order_by(desc(Property.id))
        .all()
    )
    
    prop_ids = [r.id for r in rows]
    fav_set = _favorite_id_set(db, user.id, prop_ids)

    out = []
    for r in rows:
        d = PropertyOut.model_validate(r, from_attributes=True).model_dump()
        d["is_favorited"] = (r.id in fav_set)
        
        imgs = sorted(r.images, key=lambda x: x.sort_order)
        d["images"] = [i.url for i in imgs]
        d["cover_image"] = next((i.url for i in imgs if i.is_cover), d["images"][0] if d["images"] else None)
        
        out.append(d)
    return out


@router.post("", response_model=PropertyOut, status_code=201)
def create_property(
    payload: PropertyCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    data = payload.model_dump()
    data['owner_id'] = user.id
    
    p = Property(**data)
    db.add(p)
    db.commit()
    db.refresh(p)

    d = PropertyOut.model_validate(p, from_attributes=True).model_dump()
    d["is_favorited"] = False
    d["images"] = []
    d["cover_image"] = None
    if p.owner:
        d["lister_name"] = p.owner.name or p.owner.email
        d["lister_contact"] = p.owner.phone or p.owner.email
    return d


@router.get("", response_model=List[PropertyOut])
def list_properties(
    db: Session = Depends(get_db),
    _user=Depends(get_optional_user),
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
        rank = _rank(q)
        qset = qset.filter(rank > TRGM_LIMIT)
        qset = qset.order_by(
            rank.desc().nulls_last(),
            (desc(col) if desc_order else asc(col)).nulls_last(),
        )
    else:
        qset = qset.order_by((desc(col) if desc_order else asc(col)).nulls_last())

    rows = qset.offset((page - 1) * page_size).limit(page_size).all()
    prop_ids = [r.id for r in rows]
    fav_set = _favorite_id_set(db, _user.id, prop_ids) if _user else set()

    out: List[dict] = []
    for r in rows:
        d = PropertyOut.model_validate(r, from_attributes=True).model_dump()
        d["is_favorited"] = (r.id in fav_set)
        
        imgs = sorted(r.images, key=lambda x: x.sort_order)
        d["images"] = [i.url for i in imgs]
        d["cover_image"] = next((i.url for i in imgs if i.is_cover), d["images"][0] if d["images"] else None)
        
        out.append(d)

    return out


@router.get("/{prop_id}", response_model=PropertyOut)
def get_property(
    prop_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_optional_user),
):
    p = db.get(Property, prop_id)
    if not p:
        raise HTTPException(status_code=404, detail="not found")

    d = PropertyOut.model_validate(p, from_attributes=True).model_dump()
    d["is_favorited"] = bool(
        _user and db.query(Favorite)
        .filter(Favorite.user_id == _user.id, Favorite.property_id == p.id)
        .first()
    )
    
    imgs = sorted(p.images, key=lambda x: x.sort_order)
    d["images"] = [i.url for i in imgs]
    d["cover_image"] = next((i.url for i in imgs if i.is_cover), d["images"][0] if d["images"] else None)
    
    if p.owner:
        d["lister_name"] = p.owner.name or p.owner.email
        d["lister_contact"] = p.owner.phone or p.owner.email
        
    return d


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

    d = PropertyOut.model_validate(p, from_attributes=True).model_dump()
    d["is_favorited"] = bool(
        user and db.query(Favorite)
        .filter(Favorite.user_id == user.id, Favorite.property_id == p.id)
        .first()
    )
    
    imgs = sorted(p.images, key=lambda x: x.sort_order)
    d["images"] = [i.url for i in imgs]
    d["cover_image"] = next((i.url for i in imgs if i.is_cover), d["images"][0] if d["images"] else None)
    
    return d


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
    return Response(status_code=204)


@router.post("/{prop_id}/images", status_code=201)
async def add_property_image(
    prop_id: int,
    file: UploadFile = File(...),
    is_cover: bool = False,
    sort_order: int = 0,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    p = db.get(Property, prop_id)
    if not p:
        raise HTTPException(404, "not found")
    if p.owner_id != user.id:
        raise HTTPException(403, "not owner")

    suffix = Path(file.filename).suffix or ".jpg"
    if suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        raise HTTPException(400, "unsupported file type")

    content = await file.read()
    
    from app.services.s3 import get_s3_service
    s3 = get_s3_service()
    url = s3.upload_file(
        file_content=content,
        filename=file.filename,
        content_type=file.content_type or "image/jpeg",
        folder="property-images"
    )

    if is_cover:
        db.query(PropertyImage).filter(PropertyImage.property_id == prop_id).update(
            {PropertyImage.is_cover: False}
        )

    img = PropertyImage(
        property_id=prop_id,
        url=url,
        is_cover=bool(is_cover),
        sort_order=int(sort_order or 0),
    )
    db.add(img)
    db.commit()
    db.refresh(img)

    return {"id": img.id, "url": img.url, "is_cover": img.is_cover, "sort_order": img.sort_order}


@router.get("/{prop_id}/images")
def list_property_images(
    prop_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_optional_user),
):
    imgs = (
        db.query(PropertyImage)
        .filter(PropertyImage.property_id == prop_id)
        .order_by(PropertyImage.sort_order.asc(), PropertyImage.id.asc())
        .all()
    )
    return [
        {"id": i.id, "url": i.url, "is_cover": i.is_cover, "sort_order": i.sort_order}
        for i in imgs
    ]


@router.patch("/{prop_id}/images/{img_id}")
def update_property_image(
    prop_id: int,
    img_id: int,
    is_cover: Optional[bool] = None,
    sort_order: Optional[int] = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    p = db.get(Property, prop_id)
    if not p:
        raise HTTPException(404, "not found")
    if p.owner_id != user.id:
        raise HTTPException(403, "not owner")

    img = db.get(PropertyImage, img_id)
    if not img or img.property_id != prop_id:
        raise HTTPException(404, "image not found")

    if is_cover:
        db.query(PropertyImage).filter(PropertyImage.property_id == prop_id).update(
            {PropertyImage.is_cover: False}
        )
        img.is_cover = True

    if sort_order is not None:
        img.sort_order = int(sort_order)

    db.commit()
    db.refresh(img)
    return {"id": img.id, "url": img.url, "is_cover": img.is_cover, "sort_order": img.sort_order}


@router.delete("/{prop_id}/images/{img_id}", status_code=204)
def delete_property_image(
    prop_id: int,
    img_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    p = db.get(Property, prop_id)
    if not p:
        raise HTTPException(404, "not found")
    if p.owner_id != user.id:
        raise HTTPException(403, "not owner")

    img = db.get(PropertyImage, img_id)
    if not img or img.property_id != prop_id:
        raise HTTPException(404, "image not found")

    db.delete(img)
    db.commit()
    return Response(status_code=204)

@router.post("/estimate")
def estimate_price(inp: MLPriceInput):
    try:
        ml = importlib.import_module("app.api.ml_price_router")
        payload = ml._normalize(inp.model_dump())
        pt = str(payload.get("property_type", "")).title()
        if payload.get("floor") is None:
            payload["floor"] = 2.0 if pt == "Apartment" else 1.0
        if payload.get("building_age") is None:
            payload["building_age"] = 10.0

        y = ml._predict_controlled(ml._get_model(), payload)
        return {"price_jod": round(max(0.0, y), 2)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))