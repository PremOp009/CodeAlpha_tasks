"""Admin config for events app."""
from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'date', 'organizer', 'status', 'available_seats', 'is_featured', 'is_trending')
    list_filter = ('status', 'category', 'is_featured', 'is_trending', 'is_free')
    search_fields = ('title', 'location', 'organizer__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'views_count')
    actions = ['publish_events', 'feature_events', 'mark_trending']

    def publish_events(self, request, queryset):
        queryset.update(status='published')
    publish_events.short_description = 'Publish selected events'

    def feature_events(self, request, queryset):
        queryset.update(is_featured=True)
    feature_events.short_description = 'Mark as featured'

    def mark_trending(self, request, queryset):
        queryset.update(is_trending=True)
    mark_trending.short_description = 'Mark as trending'
