import os, smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
load_dotenv()

def send_otp_email(to_email, otp):
    host = os.getenv("SMTP_HOST")
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("SMTP_FROM", username)
    if not all([host, username, password, sender]):
        print(f"[DEV ONLY] OTP for {to_email}: {otp}")
        return
    msg = EmailMessage()
    msg["Subject"] = "StockSense Password Reset OTP"
    msg["From"] = sender
    msg["To"] = to_email
    msg.set_content(f"Your StockSense OTP is {otp}. It expires soon.")
    with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587"))) as server:
        server.starttls()
        server.login(username, password)
        server.send_message(msg)
