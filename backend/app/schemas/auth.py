from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
