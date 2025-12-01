import os
import logging
from typing import List
from email.message import EmailMessage
import aiosmtplib
from pydantic import EmailStr

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_username = os.getenv("MAIL_USERNAME", "")
        self.smtp_password = os.getenv("MAIL_PASSWORD", "")
        self.smtp_from = os.getenv("MAIL_FROM", "noreply@aqarak.com")
        self.smtp_port = int(os.getenv("MAIL_PORT", 587))
        self.smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
        self.smtp_tls = True

    async def send_verification_email(self, email: str, token: str):
        """
        Send verification email to the user using aiosmtplib.
        """
        verify_url = f"http://localhost:5173/verify-email?token={token}"
        
        html_content = f"""
        <html>
            <body>
                <h1>Verify your email</h1>
                <p>Welcome to Aqarak! Please click the link below to verify your email address:</p>
                <a href="{verify_url}">Verify Email</a>
                <p>Or copy this link: {verify_url}</p>
            </body>
        </html>
        """

        message = EmailMessage()
        message["From"] = self.smtp_from
        message["To"] = email
        message["Subject"] = "Verify your Aqarak account"
        message.set_content("Please verify your email: " + verify_url)
        message.add_alternative(html_content, subtype="html")

        if not self.smtp_username or not self.smtp_password:
            logger.info(f"DEV MODE: Email to {email} suppressed (no credentials).")
            logger.info(f"VERIFICATION LINK: {verify_url}")
            print(f"\n[DEV EMAIL] To: {email}\n[DEV EMAIL] Link: {verify_url}\n")
            return

        try:
            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=self.smtp_tls,
                username=self.smtp_username,
                password=self.smtp_password,
            )
            logger.info(f"Verification email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")

email_service = EmailService()
