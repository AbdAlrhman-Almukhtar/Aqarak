from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.security import decode_token
from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)
def get_current_user(token: Optional[str] =Depends(oauth2_scheme),db :Session=Depends(get_db)) -> User:
    if not token:
        raise HTTPException(status_code=401,  detail="Not authenticated")
    try:
        user_id = decode_token(token,settings.AUTH_SECRET)
    except Exception:
        raise HTTPException(status_code=401,detail="invalid token")
    user = db.get(User, int(user_id)) if user_id else None
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    return user

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        user_id = decode_token(token, settings.AUTH_SECRET)
        return db.get(User, int(user_id)) if user_id else None
    except Exception:
        return None

