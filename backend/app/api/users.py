from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.user import UserOut
from app.schemas.auth import UserCreate
from app.core.security import hash_password
from app.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True 

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

@router.post("", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="email in use")
    u = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.name is not None:
        user.name = payload.name.strip() or None
    if payload.phone is not None:
        user.phone = payload.phone.strip() or None
    if payload.password:
        user.password_hash = hash_password(payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return db.query(User).order_by(User.id.desc()).all()