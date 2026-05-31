"""Serializers for registrations and ticket data."""
from rest_framework import serializers
from .models import Registration
from events.serializers import EventListSerializer
from users.serializers import UserProfileSerializer


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user's registration list."""
    event = EventListSerializer(read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            'id', 'event', 'registration_date', 'status',
            'ticket_id', 'qr_code_url', 'updated_at'
        ]

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None


class RegistrationDetailSerializer(serializers.ModelSerializer):
    """Full registration detail including user info — for organizers."""
    user = UserProfileSerializer(read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            'id', 'user', 'event_title', 'event_date',
            'registration_date', 'status', 'ticket_id',
            'qr_code_url', 'notes', 'updated_at'
        ]

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None
