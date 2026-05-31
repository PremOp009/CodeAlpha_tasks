"""Admin config for registrations."""
from django.contrib import admin
from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'user', 'event', 'status', 'registration_date')
    list_filter = ('status',)
    search_fields = ('ticket_id', 'user__email', 'event__title')
    ordering = ('-registration_date',)
    readonly_fields = ('ticket_id', 'registration_date')
