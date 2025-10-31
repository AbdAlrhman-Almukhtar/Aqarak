from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.schemas.user import UserOut
from app.schemas.auth import UserCreate
from app.core.security import hash_password
from app.deps import get_current_user  # add

router = APIRouter(prefix="/users", tags=["users"])

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

@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),  # require auth
):
    return db.query(User).order_by(User.id.desc()).all()