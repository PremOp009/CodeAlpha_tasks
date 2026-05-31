"""
Serializers for Event model — list, detail, create/update views.
"""
from rest_framework import serializers
from .models import Event
from users.serializers import UserProfileSerializer


class EventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for event listings (cards)."""
    organizer_name = serializers.CharField(source='organizer.name', read_only=True)
    registration_count = serializers.ReadOnlyField()
    is_sold_out = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'tagline', 'category', 'date', 'time',
            'location', 'image_url', 'organizer_name', 'max_seats',
            'available_seats', 'registration_count', 'is_sold_out',
            'is_upcoming', 'price', 'is_free', 'status', 'is_featured',
            'is_trending', 'views_count', 'is_bookmarked', 'created_at',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(id=request.user.id).exists()
        return False


class EventDetailSerializer(serializers.ModelSerializer):
    """Full event detail serializer including organizer info."""
    organizer = UserProfileSerializer(read_only=True)
    registration_count = serializers.ReadOnlyField()
    is_sold_out = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    user_registration_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(id=request.user.id).exists()
        return False

    def get_user_registration_status(self, obj):
        """Check if current user has registered for this event."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reg = obj.registrations.filter(user=request.user).first()
            if reg:
                return {'registered': True, 'status': reg.status, 'ticket_id': reg.ticket_id}
        return {'registered': False}


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating events (organizer use)."""

    class Meta:
        model = Event
        fields = [
            'title', 'tagline', 'description', 'highlights', 'seo_summary',
            'category', 'date', 'time', 'end_time', 'location', 'venue',
            'image', 'max_seats', 'price', 'is_free', 'status',
            'registration_deadline',
        ]


    def validate(self, attrs):
        if attrs.get('max_seats', 0) < 1:
            raise serializers.ValidationError({'max_seats': 'Must have at least 1 seat.'})
        return attrs

    def create(self, validated_data):
        # Set organizer from request context
        validated_data['organizer'] = self.context['request'].user
        validated_data['available_seats'] = validated_data.get('max_seats', 100)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Recalculate available seats if max_seats changes
        if 'max_seats' in validated_data:
            old_max = instance.max_seats
            new_max = validated_data['max_seats']
            confirmed = instance.registration_count
            instance.available_seats = max(0, new_max - confirmed)
            instance.max_seats = new_max
            validated_data.pop('max_seats')
        return super().update(instance, validated_data)
