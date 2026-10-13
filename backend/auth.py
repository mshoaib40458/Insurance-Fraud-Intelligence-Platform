"""
Authentication Service
JWT-based auth with bcrypt password hashing.
3 default users: admin, analyst, investigator
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

# ── Config ─────────────────────────────────────────────────────────────────────
SECRET_KEY  = os.getenv("JWT_SECRET_KEY", "sentinel-ai-super-secret-key-2024-fraud-platform")
ALGORITHM   = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ── In-memory user store (replace with DB in production) ──────────────────────
USERS_DB = {
    "admin": {
        "username":      "admin",
        "full_name":     "System Administrator",
        "email":         "admin@sentinel-ai.io",
        "role":          "Administrator",
        "hashed_password": pwd_context.hash("admin123"),
        "disabled":      False,
    },
    "analyst": {
        "username":      "analyst",
        "full_name":     "Risk Intelligence Officer",
        "email":         "analyst@sentinel-ai.io",
        "role":          "Analyst",
        "hashed_password": pwd_context.hash("analyst123"),
        "disabled":      False,
    },
    "investigator": {
        "username":      "investigator",
        "full_name":     "Fraud Investigator",
        "email":         "investigator@sentinel-ai.io",
        "role":          "Investigator",
        "hashed_password": pwd_context.hash("invest123"),
        "disabled":      False,
    },
}

# ── Schemas ────────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         dict

class UserOut(BaseModel):
    username:  str
    full_name: str
    email:     str
    role:      str

# ── Helpers ────────────────────────────────────────────────────────────────────
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_user(username: str) -> Optional[dict]:
    return USERS_DB.get(username)

def authenticate_user(username: str, password: str) -> Optional[dict]:
    user = get_user(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ── Dependency: get current user from token ───────────────────────────────────
def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user(username)
    if user is None or user.get("disabled"):
        raise credentials_exception
    return user

def require_role(*roles: str):
    """Factory: returns a dependency that enforces role membership."""
    def checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user['role']}' is not permitted for this action.",
            )
        return current_user
    return checker
