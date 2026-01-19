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

class ForgotPasswordIn(BaseModel):
    email: EmailStr

class ResetPasswordIn(BaseModel):
    token: str
    new_password: str

from datetime import datetime, timedelta, timezone
import random
from app.services.email import email_service
from app.core.security import create_access_token, verify_password, hash_password
from jose import jwt, JWTError

class VerifyOTPIn(BaseModel):
    email: EmailStr
    otp: str

@router.post("/register", status_code=201)
async def register(inp: RegisterIn, db: Session = Depends(get_db)):
    email = inp.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "Email already registered")
    otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    u = User(
        email=email,
        name=(inp.name or "").strip() or None,
        phone=inp.phone.strip(),
        password_hash=hash_password(inp.password),
        is_verified=False,
        otp_code=otp,
        otp_expires_at=expires_at
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    
    await email_service.send_otp_email(u.email, otp)
    return {"id": u.id, "email": u.email, "message": "OTP sent to email"}

@router.post("/verify-otp")
def verify_otp(inp: VerifyOTPIn, db: Session = Depends(get_db)):
    email = inp.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        return {"message": "User already verified"}
        
    if not user.otp_code or not user.otp_expires_at:
        raise HTTPException(status_code=400, detail="No OTP pending")
    now = datetime.now(timezone.utc)
    if user.otp_expires_at < now:
        raise HTTPException(status_code=400, detail="OTP expired")
        
    if user.otp_code != inp.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    token = create_access_token(
        subject=str(user.id),
        secret=settings.AUTH_SECRET,
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        alg=settings.JWT_ALG,
    )
    
    return {"message": "Email verified successfully", "access_token": token, "token_type": "bearer"}

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

@router.post("/forgot-password")
async def forgot_password(inp: ForgotPasswordIn, db: Session = Depends(get_db)):
    email = inp.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    
    # We always return 200 to avoid email harvesting
    if user:
        reset_token = create_access_token(
            subject=str(user.id),
            secret=settings.AUTH_SECRET,
            minutes=60, # Reset token expires in 1 hour
            alg=settings.JWT_ALG
        )
        await email_service.send_password_reset_email(user.email, reset_token)
        
    return {"message": "If an account exists with this email, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(inp: ResetPasswordIn, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(inp.token, settings.AUTH_SECRET, algorithms=[settings.JWT_ALG])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = hash_password(inp.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}