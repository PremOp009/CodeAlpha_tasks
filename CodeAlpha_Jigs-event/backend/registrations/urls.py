"""URL patterns for registrations and Razorpay payment."""
from django.urls import path
from . import views

urlpatterns = [
    # Free event registration
    path('register-event/<int:event_id>', views.RegisterEventView.as_view(), name='register_event'),
    # Razorpay payment flow (paid events)
    path('payment/create-order', views.CreatePaymentOrderView.as_view(), name='payment_create_order'),
    path('payment/verify', views.VerifyPaymentView.as_view(), name='payment_verify'),
    # User registration management
    path('my-registrations', views.MyRegistrationsView.as_view(), name='my_registrations'),
    path('cancel-registration/<int:registration_id>', views.CancelRegistrationView.as_view(), name='cancel_registration'),
    path('registration/<int:pk>', views.RegistrationDetailView.as_view(), name='registration_detail'),
    path('registration/<int:registration_id>/status', views.OrganizerUpdateRegistrationView.as_view(), name='update_registration_status'),
    path('verify-ticket', views.VerifyTicketView.as_view(), name='verify_ticket'),
]
