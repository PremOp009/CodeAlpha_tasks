"""
Utility functions for QR code generation, ticket creation, and email sending.
"""
import qrcode
import io
import os
from django.core.files.base import ContentFile
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


def generate_qr_code(ticket_id: str, event_title: str) -> ContentFile:
    """
    Generate a QR code image for a ticket.
    Encodes: ticket_id|event_title for easy verification.
    Returns a ContentFile suitable for saving to an ImageField.
    """
    qr_data = f"JIGS-TICKET:{ticket_id}|EVENT:{event_title}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1a1a2e", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f"qr_{ticket_id}.png")


def send_registration_confirmation_email(registration):
    """Send confirmation email with ticket details after registration."""
    user = registration.user
    event = registration.event

    subject = f"🎟️ Ticket Confirmed — {event.title} | Jigs Events"
    message = f"""
Hi {user.name},

Your registration is confirmed! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━
  EVENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━
  Event   : {event.title}
  Date    : {event.date.strftime('%B %d, %Y')}
  Time    : {event.time.strftime('%I:%M %p')}
  Venue   : {event.venue or event.location}
  Ticket  : {registration.ticket_id}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Please carry this ticket ID or the QR code to the event.

View your ticket: {settings.FRONTEND_URL}/my-registrations

See you there!
— Team Jigs Events
"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Email error: {e}")


def send_cancellation_email(registration):
    """Send cancellation confirmation email."""
    user = registration.user
    event = registration.event
    subject = f"Registration Cancelled — {event.title} | Jigs Events"
    message = f"""
Hi {user.name},

Your registration for "{event.title}" has been cancelled.

Ticket ID: {registration.ticket_id}

If this was a mistake, you can re-register at:
{settings.FRONTEND_URL}/events/{event.id}

— Team Jigs Events
"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Email error: {e}")
