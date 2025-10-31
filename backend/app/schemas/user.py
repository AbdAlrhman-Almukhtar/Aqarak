from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
