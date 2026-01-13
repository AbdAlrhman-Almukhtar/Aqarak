from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.db.session import get_db
from app.db.models import Favorite, Property
from app.deps import get_current_user
from app.schemas.property import PropertyOut

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.post("/{property_id}", status_code=201)
def add_favorite(
    property_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    prop = db.get(Property, property_id)
    if not prop or not prop.is_active:
        raise HTTPException(404, "property not found")
    exists = (
        db.query(Favorite)
        .filter(Favorite.user_id == user.id, Favorite.property_id == property_id)
        .first()
    )
    if exists:
        return {"ok": True, "id": exists.id}  
    fav = Favorite(user_id=user.id, property_id=property_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return {"ok": True, "id": fav.id}

@router.delete("/{property_id}", status_code=204)
def remove_favorite(
    property_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    fav = (
        db.query(Favorite)
        .filter(Favorite.user_id == user.id, Favorite.property_id == property_id)
        .first()
    )
    if not fav:
        raise HTTPException(404, "not found")
    db.delete(fav)
    db.commit()
    return

@router.get("", response_model=List[PropertyOut])
def list_favorites(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    q = (
        db.query(Property)
        .join(Favorite, Favorite.property_id == Property.id)
        .filter(Favorite.user_id == user.id)
        .options(joinedload(Property.images))
        .order_by(desc(Favorite.created_at), desc(Property.id))
    )
    rows = q.offset((page - 1) * page_size).limit(page_size).all()
    out: List[Dict[str, Any]] = []
    for r in rows:
        d = PropertyOut.model_validate(r, from_attributes=True).model_dump()
        d["is_favorited"] = True
        
        # Handle images properly
        imgs = sorted(r.images, key=lambda x: x.sort_order)
        d["images"] = [i.url for i in imgs]
        # Set cover_image: either one with is_cover=True, or the first image, or None
        d["cover_image"] = next((i.url for i in imgs if i.is_cover), d["images"][0] if d["images"] else None)
        
        out.append(d)
    return out