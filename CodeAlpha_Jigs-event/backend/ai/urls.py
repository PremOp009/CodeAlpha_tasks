"""URL patterns for AI app."""
from django.urls import path
from . import views

urlpatterns = [
    path('generate-description', views.GenerateEventDescriptionView.as_view(), name='generate_description'),
]
