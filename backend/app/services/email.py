import logging
import asyncio
from email.message import EmailMessage
import aiosmtplib
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self._set_config()

    def _set_config(self):
        self.smtp_username = settings.stripped_mail_username
        self.smtp_password = settings.stripped_mail_password
        self.smtp_from = settings.stripped_mail_from
        self.smtp_port = settings.MAIL_PORT
        self.smtp_server = settings.MAIL_SERVER
        self.use_tls = self.smtp_port == 465
        self.start_tls = self.smtp_port == 587
        
    async def _send(self, message: EmailMessage):
        """Helper to send email with proper STARTTLS/TLS settings and timeout."""
        self._set_config()
        
        if not self.smtp_username or not self.smtp_password:
            print("[EMAIL SERVICE] Skip sending: No credentials found.")
            return False

        try:
            print(f"[EMAIL SERVICE] Attempting to send (From: {self.smtp_from}) via {self.smtp_server}:{self.smtp_port}...")
            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                use_tls=self.use_tls,
                start_tls=self.start_tls,
                timeout=15, 
            )
            print(f"[EMAIL SERVICE] Success! Email sent successfully to {message['To']}.")
            return True
        except asyncio.TimeoutError:
            print(f"[EMAIL SERVICE] Error: SMTP connection timed out on {self.smtp_server}:{self.smtp_port}")
            raise
        except Exception as e:
            print(f"[EMAIL SERVICE] Error during send: {e}")
            raise

    async def send_otp_email(self, email: str, otp_code: str):
        html_content = f"""
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h1 style="color: #2563eb;">Verify your email</h1>
                    <p>Welcome to Aqarak! Use the following One-Time Password (OTP) to verify your email address. This code will expire in 10 minutes.</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; text-align: center; margin: 30px 0;">{otp_code}</div>
                    <p style="font-size: 14px; color: #666;">If you did not request this code, please ignore this email.</p>
                </div>
            </body>
        </html>
        """

        message = EmailMessage()
        message["From"] = self.smtp_from
        message["To"] = email
        message["Subject"] = "Your Aqarak Verification Code"
        message.set_content(f"Your verification code is: {otp_code}")
        message.add_alternative(html_content, subtype="html")

        try:
            await self._send(message)
        except Exception as e:
            logger.error(f"Failed to send OTP email: {e}")

    async def send_password_reset_email(self, email: str, token: str):
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        html_content = f"""
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h1 style="color: #2563eb;">Reset your password</h1>
                    <p>We received a request to reset your password. Click the button below to choose a new one:</p>
                    <a href="{reset_url}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Reset Password</a>
                    <p style="margin-top: 20px; font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
                    <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #2563eb; word-break: break-all;">{reset_url}</p>
                </div>
            </body>
        </html>
        """

        message = EmailMessage()
        message["From"] = self.smtp_from
        message["To"] = email
        message["Subject"] = "Reset your Aqarak password"
        message.set_content(f"Please reset your password: {reset_url}")
        message.add_alternative(html_content, subtype="html")

        try:
            await self._send(message)
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")

email_service = EmailService()
