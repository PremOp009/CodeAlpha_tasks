"""
Event views — CRUD, search, filter, analytics, admin management.
"""
from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from .models import Event
from .serializers import EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer


class IsOrganizerOrAdmin(permissions.BasePermission):
    """Allow only organizers and admins to create/modify events."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ('organizer', 'admin')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer_id == request.user.id or request.user.role == 'admin'


class EventListView(generics.ListAPIView):
    """GET /api/events — List all published events with search/filter/pagination."""
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'is_free', 'is_featured', 'is_trending']
    search_fields = ['title', 'description', 'location', 'venue', 'tagline']
    ordering_fields = ['date', 'created_at', 'views_count', 'available_seats']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Event.objects.filter(status='published')
        # Date filter
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        # Location filter
        location = self.request.query_params.get('location')
        if location:
            qs = qs.filter(location__icontains=location)
        return qs


class EventDetailView(generics.RetrieveAPIView):
    """GET /api/events/:id — Get event details and increment view count."""
    serializer_class = EventDetailSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Event.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Event.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class EventCreateView(generics.CreateAPIView):
    """POST /api/events/create — Create a new event (organizer/admin only)."""
    serializer_class = EventCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganizerOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return Response({
            'message': 'Event created successfully!',
            'event': EventDetailSerializer(event, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class EventUpdateView(generics.UpdateAPIView):
    """PUT/PATCH /api/events/:id — Update event (owner or admin)."""
    serializer_class = EventCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganizerOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Event.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return Response({
            'message': 'Event updated successfully!',
            'event': EventDetailSerializer(event, context={'request': request}).data
        })


class EventDeleteView(generics.DestroyAPIView):
    """DELETE /api/events/:id — Delete event (owner or admin)."""
    permission_classes = [permissions.IsAuthenticated, IsOrganizerOrAdmin]
    queryset = Event.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'message': 'Event deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class TrendingEventsView(generics.ListAPIView):
    """GET /api/events/trending — Top trending events."""
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.filter(
            status='published', is_trending=True
        ).order_by('-views_count')[:6]


class FeaturedEventsView(generics.ListAPIView):
    """GET /api/events/featured — Featured events for hero section."""
    serializer_class = EventListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.filter(status='published', is_featured=True).order_by('-created_at')[:3]


class OrganizerEventListView(generics.ListAPIView):
    """GET /api/events/my-events — Organizer's own events."""
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user).order_by('-created_at')


class OrganizerAnalyticsView(APIView):
    """GET /api/events/analytics — Organizer dashboard analytics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ('organizer', 'admin'):
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        events = Event.objects.filter(organizer=request.user)
        total_events = events.count()
        published_events = events.filter(status='published').count()
        total_registrations = sum(e.registration_count for e in events)
        total_views = sum(e.views_count for e in events)

        # Per-event stats
        event_stats = []
        for event in events.order_by('-created_at')[:10]:
            event_stats.append({
                'id': event.id,
                'title': event.title,
                'date': event.date,
                'registrations': event.registration_count,
                'available_seats': event.available_seats,
                'max_seats': event.max_seats,
                'views': event.views_count,
                'status': event.status,
            })

        return Response({
            'total_events': total_events,
            'published_events': published_events,
            'total_registrations': total_registrations,
            'total_views': total_views,
            'event_stats': event_stats,
        })


class EventAttendeesView(generics.ListAPIView):
    """GET /api/events/:id/attendees — List registrations for an event."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        if event.organizer != request.user and request.user.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        from registrations.serializers import RegistrationDetailSerializer
        registrations = event.registrations.all().order_by('-registration_date')
        serializer = RegistrationDetailSerializer(registrations, many=True, context={'request': request})
        return Response(serializer.data)


class AdminEventListView(generics.ListAPIView):
    """GET /api/events/admin/all — Admin: list all events."""
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Event.objects.none()
        return Event.objects.all().order_by('-created_at')


class RecommendedEventsView(generics.ListAPIView):
    """GET /api/events/recommended — AI-based smart recommendations."""
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get categories from user's registrations
        registered_categories = user.registrations.values_list(
            'event__category', flat=True
        ).distinct()

        if registered_categories:
            # Recommend events in same categories user hasn't registered for
            registered_event_ids = user.registrations.values_list('event_id', flat=True)
            qs = Event.objects.filter(
                status='published',
                category__in=registered_categories,
            ).exclude(id__in=registered_event_ids).order_by('-views_count', '-created_at')[:6]
        else:
            # Fallback: trending + featured events
            qs = Event.objects.filter(
                status='published'
            ).filter(
                Q(is_trending=True) | Q(is_featured=True)
            ).order_by('-views_count')[:6]
        return qs
