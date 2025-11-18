from datetime import datetime, timedelta, timezone
from typing import Iterable, Optional
from jose import jwt
from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt", "bcrypt_sha256", "pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return _pwd.hash(password)

def verify_password(plain: str, password_hash: str) -> bool:
    return _pwd.verify(plain, password_hash)

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