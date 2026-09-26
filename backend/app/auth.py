import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
EXPIRE = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(value): return pwd.hash(value)
def verify_password(value, hashed): return pwd.verify(value, hashed)
def hash_otp(value): return pwd.hash(value)
def verify_otp(value, hashed): return pwd.verify(value, hashed)

def create_access_token(user_id):
    exp = datetime.utcnow() + timedelta(minutes=EXPIRE)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)
