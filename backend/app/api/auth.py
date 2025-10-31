from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.security import verify_password, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=400, detail="invalid credentials")
    token = create_access_token(
        subject=str(user.id),
        secret=settings.AUTH_SECRET,
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        alg=settings.JWT_ALG,
    )
    return {"access_token": token, "token_type": "bearer"}