import hashlib
import os
import uuid
import datetime
from typing import Optional, Dict

SECRET_KEY = os.getenv("JWT_SECRET", "health_copilot_super_secret_jwt_key_2026")

def hash_password(password: str) -> str:
    # PBKDF2 HMAC SHA256 password hashing
    salt = b"health_copilot_salt_2026"
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000).hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(user_id: str, email: str) -> str:
    # Token format for session validation
    now = int(datetime.datetime.utcnow().timestamp())
    expires = now + (30 * 24 * 60 * 60) # 30 days
    payload = f"{user_id}:{email}:{expires}"
    signature = hashlib.sha256(f"{payload}:{SECRET_KEY}".encode("utf-8")).hexdigest()[:16]
    return f"token_{payload}:{signature}"

def verify_access_token(token: str) -> Optional[Dict[str, str]]:
    try:
        if not token.startswith("token_"):
            return None
        raw = token[6:]
        payload, signature = raw.rsplit(":", 1)
        expected_sig = hashlib.sha256(f"{payload}:{SECRET_KEY}".encode("utf-8")).hexdigest()[:16]
        if signature != expected_sig:
            return None
        user_id, email, expires_str = payload.split(":")
        if int(datetime.datetime.utcnow().timestamp()) > int(expires_str):
            return None
        return {"user_id": user_id, "email": email}
    except Exception:
        return None
