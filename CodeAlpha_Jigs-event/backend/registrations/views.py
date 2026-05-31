"""
Registration views — register, cancel, list, ticket download, organizer approval.
Payment views — Razorpay order creation and payment verification (INR).
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db import transaction
from django.conf import settings
import razorpay
import hmac
import hashlib
from .models import Registration
from .serializers import RegistrationSerializer, RegistrationDetailSerializer
from .utils import generate_qr_code, send_registration_confirmation_email, send_cancellation_email
from events.models import Event


# ─── Razorpay client (lazily initialised) ─────────────────────────────────────

def get_razorpay_client():
    """Return an authenticated Razorpay client using settings credentials."""
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


# ─── Existing views ────────────────────────────────────────────────────────────

class RegisterEventView(APIView):
    """POST /api/register-event/:id — Register authenticated user for a FREE event."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, status='published')

        # Paid events must go through the Razorpay payment flow
        if not event.is_free:
            return Response(
                {'error': 'This is a paid event. Please use the payment flow.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Already registered?
        if Registration.objects.filter(user=request.user, event=event).exists():
            return Response({'error': 'You are already registered for this event.'}, status=status.HTTP_400_BAD_REQUEST)

        # Sold out?
        if event.available_seats <= 0:
            return Response({'error': 'Sorry, this event is sold out.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create registration
        registration = Registration.objects.create(
            user=request.user,
            event=event,
            status='confirmed',
        )

        # Generate QR code
        try:
            qr_file = generate_qr_code(registration.ticket_id, event.title)
            registration.qr_code.save(f"qr_{registration.ticket_id}.png", qr_file, save=True)
        except Exception as e:
            print(f"QR generation error: {e}")

        # Decrement available seats
        Event.objects.filter(pk=event.pk).update(available_seats=event.available_seats - 1)

        # Send confirmation email
        send_registration_confirmation_email(registration)

        serializer = RegistrationSerializer(registration, context={'request': request})
        return Response({
            'message': 'Registration successful! Check your email for ticket details.',
            'registration': serializer.data,
        }, status=status.HTTP_201_CREATED)


# ─── Razorpay Payment Views ────────────────────────────────────────────────────

class CreatePaymentOrderView(APIView):
    """
    POST /api/payment/create-order
    Creates a Razorpay order for a paid event registration.
    Returns: { order_id, amount, currency, key }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        event_id = request.data.get('event_id')
        if not event_id:
            return Response({'error': 'event_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        event = get_object_or_404(Event, pk=event_id, status='published')

        if event.is_free:
            return Response({'error': 'This event is free. No payment required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Already registered?
        if Registration.objects.filter(user=request.user, event=event).exists():
            return Response({'error': 'You are already registered for this event.'}, status=status.HTTP_400_BAD_REQUEST)

        # Sold out?
        if event.available_seats <= 0:
            return Response({'error': 'Sorry, this event is sold out.'}, status=status.HTTP_400_BAD_REQUEST)

        # Razorpay amount is in paise (1 INR = 100 paise)
        amount_in_paise = int(float(event.price) * 100)

        try:
            client = get_razorpay_client()
            order = client.order.create({
                'amount': amount_in_paise,
                'currency': 'INR',
                'payment_capture': 1,  # Auto-capture after payment
                'notes': {
                    'event_id': str(event.id),
                    'event_title': event.title,
                    'user_id': str(request.user.id),
                    'user_email': request.user.email,
                }
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to create payment order: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'order_id': order['id'],
            'amount': amount_in_paise,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'event_title': event.title,
            'event_id': event.id,
            'user_name': request.user.name,
            'user_email': request.user.email,
        }, status=status.HTTP_200_OK)


class VerifyPaymentView(APIView):
    """
    POST /api/payment/verify
    Verifies Razorpay payment signature, then creates the registration + QR ticket.
    Payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature, event_id }
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')
        event_id = request.data.get('event_id')

        if not all([order_id, payment_id, signature, event_id]):
            return Response(
                {'error': 'order_id, payment_id, signature, and event_id are all required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Signature verification ───────────────────────────────────────────────
        client = get_razorpay_client()
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {'error': 'Payment verification failed. Invalid signature.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Create registration ──────────────────────────────────────────────────
        event = get_object_or_404(Event, pk=event_id, status='published')

        # Guard against double-registration
        if Registration.objects.filter(user=request.user, event=event).exists():
            return Response({'error': 'You are already registered for this event.'}, status=status.HTTP_400_BAD_REQUEST)

        if event.available_seats <= 0:
            return Response({'error': 'Sorry, this event is sold out.'}, status=status.HTTP_400_BAD_REQUEST)

        registration = Registration.objects.create(
            user=request.user,
            event=event,
            status='confirmed',
            notes=f'Razorpay Payment ID: {payment_id} | Order ID: {order_id}',
        )

        # Generate QR code
        try:
            qr_file = generate_qr_code(registration.ticket_id, event.title)
            registration.qr_code.save(f"qr_{registration.ticket_id}.png", qr_file, save=True)
        except Exception as e:
            print(f"QR generation error: {e}")

        # Decrement available seats
        Event.objects.filter(pk=event.pk).update(available_seats=event.available_seats - 1)

        # Send confirmation email
        send_registration_confirmation_email(registration)

        serializer = RegistrationSerializer(registration, context={'request': request})
        return Response({
            'message': 'Payment successful! Registration confirmed. Check your email for ticket details.',
            'registration': serializer.data,
        }, status=status.HTTP_201_CREATED)


# ─── Remaining existing views ──────────────────────────────────────────────────

class MyRegistrationsView(generics.ListAPIView):
    """GET /api/my-registrations — List all registrations of the logged-in user."""
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(
            user=self.request.user
        ).select_related('event', 'event__organizer').order_by('-registration_date')


class CancelRegistrationView(APIView):
    """DELETE /api/cancel-registration/:id — Cancel a registration."""
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def delete(self, request, registration_id):
        registration = get_object_or_404(
            Registration, pk=registration_id, user=request.user
        )
        if registration.status == 'cancelled':
            return Response({'error': 'Registration is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        # Re-increment available seats
        Event.objects.filter(pk=registration.event.pk).update(
            available_seats=registration.event.available_seats + 1
        )

        registration.status = 'cancelled'
        registration.save()

        # Send cancellation email
        send_cancellation_email(registration)

        return Response({'message': 'Registration cancelled successfully.'})


class RegistrationDetailView(generics.RetrieveAPIView):
    """GET /api/registration/:id — Get registration detail with ticket info."""
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)


class OrganizerUpdateRegistrationView(APIView):
    """PATCH /api/registration/:id/status — Organizer approve/reject registrations."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, registration_id):
        registration = get_object_or_404(Registration, pk=registration_id)
        # Verify organizer owns the event
        if registration.event.organizer != request.user and request.user.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status not in ['confirmed', 'rejected', 'attended']:
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        registration.status = new_status
        registration.notes = request.data.get('notes', registration.notes)
        registration.save()
        return Response({'message': f'Registration {new_status}.', 'status': new_status})


class VerifyTicketView(APIView):
    """POST /api/verify-ticket — Verify and check-in a QR ticket by ticket_id.

    Only organizers, admins, and scanner staff can access this endpoint.
    Performs atomic check-in: validates ticket → marks checked-in → prevents duplicates.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # ── Role check ───────────────────────────────────────────────────────
        if request.user.role not in ('organizer', 'admin', 'scanner_staff'):
            return Response(
                {'valid': False, 'error': 'You do not have permission to scan tickets.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        ticket_id = request.data.get('ticket_id')
        if not ticket_id:
            return Response(
                {'valid': False, 'error': 'ticket_id required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Lookup ───────────────────────────────────────────────────────────
        registration = (
            Registration.objects
            .select_related('user', 'event')
            .select_for_update()
            .filter(ticket_id=ticket_id)
            .first()
        )

        if not registration:
            return Response(
                {'valid': False, 'reason': 'invalid_qr', 'error': 'Invalid ticket — not found in system.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        event = registration.event
        user = registration.user

        # ── Already checked in? ──────────────────────────────────────────────
        if registration.is_checked_in:
            return Response({
                'valid': False,
                'reason': 'already_checked_in',
                'error': 'This ticket has already been used for entry.',
                'checked_in_at': registration.checked_in_at,
                'attendee': user.name,
                'event': event.title,
            }, status=status.HTTP_409_CONFLICT)

        # ── Ticket cancelled? ────────────────────────────────────────────────
        if registration.status == 'cancelled':
            return Response({
                'valid': False,
                'reason': 'ticket_cancelled',
                'error': 'This ticket has been cancelled.',
                'attendee': user.name,
                'event': event.title,
            }, status=status.HTTP_400_BAD_REQUEST)

        # ── Ticket not confirmed (pending / rejected)? ───────────────────────
        if registration.status not in ('confirmed', 'attended'):
            return Response({
                'valid': False,
                'reason': 'payment_incomplete',
                'error': f'Ticket status is "{registration.status}". Payment may be incomplete.',
                'attendee': user.name,
                'event': event.title,
            }, status=status.HTTP_400_BAD_REQUEST)

        # ── Event expired? ───────────────────────────────────────────────────
        from datetime import date
        if event.date < date.today():
            return Response({
                'valid': False,
                'reason': 'event_expired',
                'error': 'This event has already ended.',
                'attendee': user.name,
                'event': event.title,
                'event_date': event.date,
            }, status=status.HTTP_400_BAD_REQUEST)

        # ── Event cancelled? ─────────────────────────────────────────────────
        if event.status == 'cancelled':
            return Response({
                'valid': False,
                'reason': 'event_cancelled',
                'error': 'This event has been cancelled.',
                'event': event.title,
            }, status=status.HTTP_400_BAD_REQUEST)

        # ── All checks passed — perform check-in ─────────────────────────────
        from django.utils import timezone as tz
        now = tz.now()
        registration.is_checked_in = True
        registration.checked_in_at = now
        registration.checked_in_by = request.user
        registration.status = 'attended'
        registration.save()

        return Response({
            'valid': True,
            'ticket_id': registration.ticket_id,
            'status': 'attended',
            'attendee': user.name,
            'email': user.email,
            'event': event.title,
            'event_date': event.date,
            'event_time': event.time,
            'venue': event.venue or event.location,
            'checked_in_at': now,
            'ticket_type': 'Free' if event.is_free else f'Paid (₹{event.price})',
            'seat_info': f'{event.max_seats - event.available_seats}/{event.max_seats} attendees',
        }, status=status.HTTP_200_OK)
