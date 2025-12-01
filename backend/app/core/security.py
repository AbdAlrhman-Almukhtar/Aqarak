import os
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Iterable, Optional
from jose import jwt

_SECRET = os.getenv("AUTH_SECRET")
_ALG = os.getenv("JWT_ALG", "HS256")
_EXPIRE = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(
    *,
    subject: str,
    secret: str,
    minutes: int = 60,
    alg: str = "HS256",
) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=minutes)
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, secret, algorithm=alg)

def decode_token(
    token: str,
    secret: str,
    algorithms: Optional[Iterable[str]] = ("HS256",),
) -> str:
    data = jwt.decode(token, secret, algorithms=list(algorithms) if algorithms else ["HS256"])
    return data.get("sub") or ""