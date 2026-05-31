"""
Registration model — tracks user-event registrations with QR tickets.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Registration(models.Model):
    """Tracks a user's registration for an event with ticket and QR code."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
        ('attended', 'Attended'),
    ]

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='registrations'
    )
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='registrations'
    )
    registration_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    ticket_id = models.CharField(max_length=50, unique=True, blank=True)
    qr_code = models.ImageField(upload_to='qrcodes/', null=True, blank=True)
    notes = models.TextField(blank=True, null=True)  # Organizer notes
    is_checked_in = models.BooleanField(default=False)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='checked_in_registrations'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'registrations'
        unique_together = ('user', 'event')
        ordering = ['-registration_date']
        verbose_name = 'Registration'
        verbose_name_plural = 'Registrations'

    def __str__(self):
        return f"{self.user.name} → {self.event.title} [{self.status}]"

    def save(self, *args, **kwargs):
        # Auto-generate unique ticket ID
        if not self.ticket_id:
            self.ticket_id = f"JIGS-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
