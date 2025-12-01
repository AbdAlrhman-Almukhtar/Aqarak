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
    phone: str

from app.services.email import email_service
from app.core.security import create_access_token, verify_password, hash_password
from jose import jwt, JWTError

@router.post("/register", status_code=201)
async def register(inp: RegisterIn, db: Session = Depends(get_db)):
    email = inp.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "email already registered")
    u = User(
        email=email,
        name=(inp.name or "").strip() or None,
        phone=inp.phone.strip(),
        password_hash=hash_password(inp.password),
        is_verified=False
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    
    verification_token = create_access_token(
        subject=str(u.id),
        secret=settings.AUTH_SECRET,
        minutes=1440,
        alg=settings.JWT_ALG
    )
    
    await email_service.send_verification_email(u.email, verification_token)
    
    return {"id": u.id, "email": u.email, "message": "Verification email sent"}

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[settings.JWT_ALG])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email already verified"}
    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}

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