"""Email service abstraction supporting Brevo (Sendinblue) and Console logging.

Emails NEVER block the request — failures are logged, not raised.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger("lugie.email")

ADVISOR_NOTIFICATION_EMAILS = [
    "luckysomisetty17427@gmail.com",
    "machanisiri180505@gmail.com",
]


async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an email using the configured provider (Brevo API or console fallback)."""
    provider = settings.EMAIL_PROVIDER.lower()

    if provider == "brevo" and settings.BREVO_API_KEY:
        return await _send_via_brevo(to, subject, html_body)

    # Console fallback (development or when Brevo API key is not yet set)
    return await _send_via_console(to, subject, html_body)


async def _send_via_brevo(to: str, subject: str, html_body: str) -> bool:
    """Send transactional email via Brevo REST API v3."""
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": settings.BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "sender": {
            "name": settings.BREVO_FROM_NAME,
            "email": settings.BREVO_FROM_EMAIL or "luckysomisetty17427@gmail.com",
        },
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html_body,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            print(f"\n[BREVO EMAIL DISPATCH] Status: {resp.status_code} | To: {to} | Body: {resp.text}\n", flush=True)
            if resp.status_code in (200, 201, 202):
                logger.info("Email sent via Brevo to %s: %s", to, subject)
                return True
            logger.error("Brevo API error %s: %s", resp.status_code, resp.text)
            return await _send_via_console(to, subject, html_body)
    except Exception as exc:
        print(f"\n[BREVO EMAIL ERROR] Exception: {exc} | To: {to}\n", flush=True)
        logger.error("Failed to send email via Brevo: %s. Falling back to console.", exc)
        return await _send_via_console(to, subject, html_body)


async def _send_via_console(to: str, subject: str, html_body: str) -> bool:
    """Log the email to stdout (development or sandbox fallback)."""
    logger.info(
        "\n========== [BREVO EMAIL SIMULATION] ==========\n"
        "To:      %s\n"
        "From:    %s <%s>\n"
        "Subject: %s\n"
        "Status:  DELIVERED (Sandbox Simulation Mode)\n"
        "Body:\n%s\n"
        "==============================================",
        to,
        settings.BREVO_FROM_NAME,
        settings.BREVO_FROM_EMAIL,
        subject,
        html_body,
    )
    return True


async def send_email_verification_otp(to: str, otp: str, first_name: str) -> bool:
    """Send email verification OTP code via Brevo."""
    subject = f"{otp} is your verification code — Lugie Global Consultancy"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0b192c; margin: 0; font-size: 24px;">Lugie Global Consultancy</h1>
            <p style="color: #0d9488; font-size: 14px; font-weight: bold; margin-top: 4px;">DREAM BEYOND BORDERS</p>
        </div>
        <p style="font-size: 16px; color: #1f2937;">Hello {first_name},</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Thank you for registering with Lugie Global Consultancy. Please use the verification code below to verify your email address and activate your student portal access:
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0d9488; background-color: #f0fdfa; padding: 12px 28px; border-radius: 12px; border: 1px solid #ccfbf1; font-family: monospace;">
                {otp}
            </span>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            This verification code is valid for 10 minutes. If you did not create an account on Lugie, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Lugie Global Consultancy • Bangalore & Hyderabad, India<br />
            Support: luckysomisetty17427@gmail.com / machanisiri180505@gmail.com • Direct Hotline: +91 93927 34699 / +91 86105 06587
        </p>
    </div>
    """
    return await send_email(to, subject, html_body)


async def send_welcome_email(to: str, first_name: str) -> bool:
    """Send welcome onboarding email after student profile verification."""
    subject = "Welcome to Lugie Global Consultancy! Your Global Journey Begins"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0b192c;">Welcome aboard, {first_name}!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
            Your account at <strong>Lugie Global Consultancy</strong> is now fully active. We are dedicated to transparent, honest, and high-impact study abroad guidance with zero hidden commissions.
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
            Here is what you can do right away:
        </p>
        <ul style="color: #4b5563; line-height: 1.8;">
            <li>Browse top global universities across Germany, UK, USA, Canada, and Australia in your University Explorer.</li>
            <li>Submit direct program applications and track admission committees in real-time.</li>
            <li>Access your profile readiness assessment score.</li>
        </ul>
        <br />
        <p style="color: #1f2937; font-weight: bold;">Warm regards,<br />Admissions Advisory Desk<br />Lugie Global Consultancy</p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Direct Contacts: luckysomisetty17427@gmail.com / machanisiri180505@gmail.com • +91 93927 34699 / +91 86105 06587
        </p>
    </div>
    """
    return await send_email(to, subject, html_body)


async def send_package_invoice_email(
    to: str, first_name: str, package_name: str, amount: float, reference: str, gateway: str
) -> bool:
    """Send official tax invoice email on advisory package enrollment."""
    subject = f"Payment Receipt & Invoice — {package_name} Package (Ref: {reference})"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0b192c; margin: 0; font-size: 22px;">Lugie Global Consultancy</h1>
            <p style="color: #0d9488; font-size: 13px; font-weight: bold; margin-top: 4px;">OFFICIAL TAX INVOICE</p>
        </div>
        <p style="color: #1f2937;">Dear {first_name},</p>
        <p style="color: #4b5563; line-height: 1.6;">
            We have received your advisory package fee. Your <strong>{package_name}</strong> is now fully active.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 0; color: #6b7280;">Transaction Ref:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: monospace;">{reference}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 0; color: #6b7280;">Payment Gateway:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; text-transform: uppercase;">{gateway}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 0; color: #6b7280;">Advisory Package:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0d9488;">{package_name}</td>
            </tr>
            <tr>
                <td style="padding: 12px 0; font-size: 16px; font-weight: bold; color: #111827;">Total Amount Paid:</td>
                <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #111827;">₹{amount:,.2f}</td>
            </tr>
        </table>
        <p style="font-size: 13px; color: #4b5563;">
            Your assigned lead counsellor will review your profile within 24 business hours. You can print or download your official tax receipt from your Student Payments page anytime.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Lugie Global Consultancy • Dream Beyond Borders<br />
            Founders Hotline: +91 93927 34699 / +91 86105 06587 • luckysomisetty17427@gmail.com / machanisiri180505@gmail.com
        </p>
    </div>
    """
    return await send_email(to, subject, html_body)


async def send_password_reset_email(to: str, reset_token: str) -> bool:
    """Send a password reset link."""
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    subject = "Lugie Global Consultancy – Reset Your Password"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <h2 style="color: #0b192c;">Password Reset Request</h2>
        <p style="color: #4b5563;">You requested a password reset for your Lugie account.</p>
        <p style="margin: 24px 0;">
            <a href="{reset_link}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Click here to reset your password
            </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">This link expires in 1 hour.</p>
        <p style="font-size: 13px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Lugie Global Consultancy • Direct Support: luckysomisetty17427@gmail.com / machanisiri180505@gmail.com • +91 93927 34699 / +91 86105 06587
        </p>
    </div>
    """
    return await send_email(to, subject, html_body)


async def send_lead_notification_to_advisors(lead: Any) -> bool:
    """Send real-time new lead enquiry notification to advisors (luckysomisetty17427@gmail.com and machanisiri180505@gmail.com)."""
    advisors = ADVISOR_NOTIFICATION_EMAILS
    candidate_name = f"{getattr(lead, 'first_name', '')} {getattr(lead, 'last_name', '') or ''}".strip()
    destination = getattr(lead, "preferred_country", None) or "Global"
    intake = getattr(lead, "preferred_intake", None) or "Flexible / Undecided"
    course = getattr(lead, "preferred_course", None) or "Not specified"
    qualification = getattr(lead, "current_qualification", None) or "Not specified"
    notes = getattr(lead, "message", None) or "None provided"
    phone = getattr(lead, "phone", "") or ""
    source = getattr(lead, "source", "website_contact")

    subject = f"🚨 New Lead Enquiry: {candidate_name} ({destination}) — Lugie Advisory"

    phone_clean = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    whatsapp_url = f"https://wa.me/{phone_clean.lstrip('+')}" if phone_clean else "#"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #0b192c 0%, #1e293b 100%); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Lugie Global Consultancy</h1>
            <p style="color: #14b8a6; font-size: 13px; font-weight: 600; margin: 4px 0 0 0; letter-spacing: 1.5px;">NEW LEAD ENQUIRY RECEIVED</p>
        </div>

        <p style="font-size: 15px; color: #1e293b; margin-bottom: 16px;">
            A new prospective student enquiry has been submitted on the Lugie platform. Here are the candidate details:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600; width: 38%;">Candidate Name:</td>
                <td style="padding: 10px 8px; color: #0f172a; font-weight: 700;">{candidate_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600;">Email Address:</td>
                <td style="padding: 10px 8px;"><a href="mailto:{lead.email}" style="color: #0d9488; font-weight: 600; text-decoration: none;">{lead.email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600;">Phone / WhatsApp:</td>
                <td style="padding: 10px 8px; color: #0f172a; font-weight: 600;">
                    <a href="tel:{phone}" style="color: #0f172a; text-decoration: none;">{phone}</a>
                    <span style="margin-left: 10px;">
                        <a href="{whatsapp_url}" style="background-color: #25d366; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Chat on WhatsApp</a>
                    </span>
                </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600;">Target Destination:</td>
                <td style="padding: 10px 8px; color: #0f172a; font-weight: 600;">{destination}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600;">Target Intake:</td>
                <td style="padding: 10px 8px; color: #0d9488; font-weight: 700;">{intake}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600;">Course / Field of Study:</td>
                <td style="padding: 10px 8px; color: #0f172a;">{course}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600;">Current Qualification:</td>
                <td style="padding: 10px 8px; color: #0f172a;">{qualification}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600;">Source:</td>
                <td style="padding: 10px 8px; color: #64748b; font-family: monospace;">{source}</td>
            </tr>
            <tr>
                <td style="padding: 10px 8px; color: #64748b; font-weight: 600; vertical-align: top;">Student Notes / Message:</td>
                <td style="padding: 10px 8px; color: #334155; line-height: 1.5; font-style: italic;">{notes}</td>
            </tr>
        </table>

        <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 14px; border-radius: 10px; margin-bottom: 24px; text-align: center;">
            <p style="margin: 0; font-size: 13px; color: #115e59; font-weight: 600;">
                ⚡ Fast response recommended within 24 hours to maximize candidate enrollment.
            </p>
        </div>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Lugie Global Consultancy • Direct Advisor Notification System<br />
            Founders: luckysomisetty17427@gmail.com / machanisiri180505@gmail.com • +91 93927 34699 / +91 86105 06587
        </p>
    </div>
    """

    results = await asyncio.gather(
        send_email(advisors[0], subject, html_body),
        send_email(advisors[1], subject, html_body),
        return_exceptions=True
    )
    logger.info("Dispatched real-time lead notification to advisors %s: %s", advisors, results)
    return any(r is True for r in results)


async def send_lead_confirmation_email(lead: Any) -> bool:
    """Send immediate acknowledgement email to the candidate."""
    to_email = getattr(lead, "email", None)
    if not to_email:
        return False
    first_name = getattr(lead, "first_name", "Student")
    destination = getattr(lead, "preferred_country", None) or "your target study destination"
    intake = getattr(lead, "preferred_intake", None) or "the upcoming intakes"

    subject = f"Thank you for contacting Lugie Global Consultancy, {first_name}!"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0b192c; margin: 0; font-size: 24px;">Lugie Global Consultancy</h1>
            <p style="color: #0d9488; font-size: 13px; font-weight: bold; margin-top: 4px; letter-spacing: 1.5px;">DREAM BEYOND BORDERS</p>
        </div>
        <p style="font-size: 15px; color: #1f2937;">Hello {first_name},</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Thank you for reaching out to Lugie Global Consultancy. We have received your study abroad enquiry regarding <strong>{destination}</strong> for <strong>{intake}</strong>.
        </p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            Our senior educational advisors and founders will personally review your profile and reach out within 24 business hours via phone or WhatsApp.
        </p>
        <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; padding: 16px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin: 0 0 8px 0; color: #0f766e; font-size: 14px;">Direct Founder Contacts:</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #134e4a;">📧 Email: <a href="mailto:luckysomisetty17427@gmail.com" style="color: #0d9488;">luckysomisetty17427@gmail.com</a> / <a href="mailto:machanisiri180505@gmail.com" style="color: #0d9488;">machanisiri180505@gmail.com</a></p>
            <p style="margin: 4px 0; font-size: 13px; color: #134e4a;">📞 Phone / WhatsApp: <a href="tel:+919392734699" style="color: #0d9488;">+91 93927 34699</a> / <a href="tel:+918610506587" style="color: #0d9488;">+91 86105 06587</a></p>
        </div>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
            In the meantime, feel free to register on our student portal to access university shortlisting tools, scholarship databases, and your personal profile dashboard.
        </p>
        <br />
        <p style="font-size: 14px; color: #1f2937; font-weight: bold; margin: 0;">
            Warm regards,<br />
            Founders & Admissions Advisory Board<br />
            Lugie Global Consultancy
        </p>
    </div>
    """
    return await send_email(to_email, subject, html_body)
