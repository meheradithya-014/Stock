import os, random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, OTP
from ..schemas import SignupRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from ..auth import hash_password, verify_password, create_access_token, hash_otp, verify_otp
from ..services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email, password_hash=hash_password(data.password), role=data.role)
    db.add(user); db.commit(); db.refresh(user)
    return {"message": "User created", "user_id": user.id}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return {"access_token": create_access_token(user.id), "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "If the email exists, an OTP has been sent."}
    for old in db.query(OTP).filter(OTP.email == data.email, OTP.used == False).all():
        old.used = True
    otp = f"{random.randint(0,999999):06d}"
    expires = datetime.utcnow() + timedelta(minutes=int(os.getenv("OTP_EXPIRE_MINUTES", "10")))
    db.add(OTP(email=data.email, otp_hash=hash_otp(otp), expires_at=expires))
    db.commit()
    send_otp_email(data.email, otp)
    return {"message": "If the email exists, an OTP has been sent."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = db.query(OTP).filter(OTP.email == data.email, OTP.used == False).order_by(OTP.id.desc()).first()
    if not record or record.expires_at < datetime.utcnow() or not verify_otp(data.otp, record.otp_hash):
        raise HTTPException(400, "Invalid or expired OTP")
    user = db.query(User).filter(User.email == data.email).first()
    if not user: raise HTTPException(400, "Invalid request")
    user.password_hash = hash_password(data.new_password)
    record.used = True
    db.commit()
    return {"message": "Password reset successful"}
