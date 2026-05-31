"""
Event model for Jigs Events platform.
Supports categories, seat tracking, status management, and organizer ownership.
"""
from django.db import models
from django.utils import timezone
from django.conf import settings


class Event(models.Model):
    """Core event model with full details and seat management."""

    CATEGORY_CHOICES = [
        ('music', 'Music'),
        ('tech', 'Technology'),
        ('sports', 'Sports'),
        ('art', 'Art & Culture'),
        ('food', 'Food & Drink'),
        ('business', 'Business'),
        ('education', 'Education'),
        ('health', 'Health & Wellness'),
        ('fashion', 'Fashion'),
        ('comedy', 'Comedy'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    highlights = models.JSONField(default=list, blank=True)  # AI-generated highlights list
    seo_summary = models.TextField(blank=True, null=True)    # AI-generated SEO summary
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    date = models.DateField()
    time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255)
    venue = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='events/', null=True, blank=True)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_events'
    )
    max_seats = models.PositiveIntegerField(default=100)
    available_seats = models.PositiveIntegerField(default=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_free = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    registration_deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        ordering = ['-created_at']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'

    def __str__(self):
        return f"{self.title} — {self.date}"

    @property
    def registration_count(self):
        """Total confirmed registrations for this event."""
        return self.registrations.filter(status='confirmed').count()

    @property
    def is_sold_out(self):
        return self.available_seats <= 0

    @property
    def is_upcoming(self):
        from datetime import date
        return self.date >= date.today()

    def save(self, *args, **kwargs):
        # Sync available_seats with max_seats on first create
        if not self.pk:
            self.available_seats = self.max_seats
        super().save(*args, **kwargs)
