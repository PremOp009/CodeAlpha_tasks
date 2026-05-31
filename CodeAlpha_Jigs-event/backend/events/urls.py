"""URL patterns for events app."""
from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('', views.EventListView.as_view(), name='event_list'),
    path('trending', views.TrendingEventsView.as_view(), name='trending_events'),
    path('featured', views.FeaturedEventsView.as_view(), name='featured_events'),
    path('recommended', views.RecommendedEventsView.as_view(), name='recommended_events'),
    path('<int:pk>', views.EventDetailView.as_view(), name='event_detail'),

    # Organizer
    path('create', views.EventCreateView.as_view(), name='event_create'),
    path('<int:pk>/update/', views.EventUpdateView.as_view(), name='event_update'),
    path('<int:pk>/delete/', views.EventDeleteView.as_view(), name='event_delete'),
    path('my-events', views.OrganizerEventListView.as_view(), name='my_events'),
    path('analytics', views.OrganizerAnalyticsView.as_view(), name='organizer_analytics'),
    path('<int:pk>/attendees', views.EventAttendeesView.as_view(), name='event_attendees'),

    # Admin
    path('admin/all', views.AdminEventListView.as_view(), name='admin_event_list'),
]
