import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_from = os.getenv("SMTP_FROM", f"HealthCopilot <{self.smtp_user or 'no-reply@healthcopilot.com'}>")

    def is_configured(self) -> bool:
        return bool(self.smtp_user and self.smtp_password)

    def send_otp_email(self, recipient_email: str, otp_code: str, recipient_name: str = "Valued Patient") -> Tuple[bool, str]:
        """
        Sends an OTP verification email to recipient_email via SMTP.
        Returns (success, detail_message).
        """
        if not recipient_email or "@" not in recipient_email:
            return False, "Invalid email address format."

        if not self.is_configured():
            print(f"[EmailService Warning] SMTP credentials not set (SMTP_USER/SMTP_PASSWORD). OTP code is {otp_code}")
            return False, "SMTP credentials not configured in environment."

        subject = f"Your HealthCopilot Verification Code: {otp_code}"
        
        # Plain text body
        text_content = f"""
Hello {recipient_name},

Your HealthCopilot verification code is: {otp_code}

This code is valid for 10 minutes. Please do not share this code with anyone.

If you did not request this code, please ignore this message.

HealthCopilot Healthcare Team
https://healthcopilot.org
        """.strip()

        # HTML body with rich design
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HealthCopilot OTP Verification</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
    .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }}
    .header {{ background-color: #0f2e5a; padding: 28px 24px; text-align: center; color: #ffffff; }}
    .logo-badge {{ display: inline-block; background-color: #0d9488; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; margin-bottom: 8px; }}
    .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; }}
    .content {{ padding: 32px 28px; text-align: center; }}
    .greeting {{ font-size: 16px; color: #334155; margin-bottom: 16px; text-align: left; }}
    .otp-box {{ background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }}
    .otp-code {{ font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #15803d; margin: 0; }}
    .otp-hint {{ font-size: 12px; color: #166534; font-weight: 600; margin-top: 6px; margin-bottom: 0; }}
    .info-text {{ font-size: 13px; color: #64748b; line-height: 1.6; text-align: left; margin-bottom: 24px; }}
    .footer {{ background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">🏥 HealthCopilot</div>
      <h1>Verification Code</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello <strong>{recipient_name}</strong>,</div>
      <p style="text-align: left; font-size: 14px; color: #475569; margin: 0;">Use the verification code below to complete your login or registration on HealthCopilot:</p>
      
      <div class="otp-box">
        <p class="otp-code">{otp_code}</p>
        <p class="otp-hint">⏱️ Valid for 10 minutes</p>
      </div>
      
      <div class="info-text">
        🔒 For security reasons, never share this OTP with anyone, including HealthCopilot staff.<br>
        If you didn't initiate this request, you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      &copy; 2026 HealthCopilot Operating System. All rights reserved.<br>
      Automated Security Notification &bull; Do not reply to this email.
    </div>
  </div>
</body>
</html>
        """.strip()

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self.smtp_from
        msg["To"] = recipient_email

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        try:
            if self.smtp_port == 465:
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.login(self.smtp_user, self.smtp_password)
                    server.sendmail(self.smtp_user, recipient_email, msg.as_string())
            else:
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(self.smtp_user, self.smtp_password)
                    server.sendmail(self.smtp_user, recipient_email, msg.as_string())

            print(f"[EmailService Success] OTP email sent successfully to {recipient_email}")
            return True, f"OTP email successfully sent to {recipient_email}"
        except Exception as e:
            err_msg = str(e)
            print(f"[EmailService Error] Failed to send email to {recipient_email}: {err_msg}")
            return False, f"SMTP transport error: {err_msg}"
