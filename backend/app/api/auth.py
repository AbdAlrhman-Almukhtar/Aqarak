from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

@router.post("/register", status_code=201)
def register(inp: RegisterIn, db: Session = Depends(get_db)):
    email = inp.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "email already registered")
    u = User(
        email=email,
        name=(inp.name or "").strip() or None,
        password_hash=hash_password(inp.password),
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"id": u.id, "email": u.email}

@router.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = (form.username or "").strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=400, detail="invalid credentials")
    token = create_access_token(
        subject=str(user.id),
        secret=settings.AUTH_SECRET,
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        alg=settings.JWT_ALG,
    )
    return {"access_token": token, "token_type": "bearer"}