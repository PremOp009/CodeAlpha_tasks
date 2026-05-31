"""
Views for user authentication and profile management.
Handles: Register, Login, Logout, Profile CRUD, Admin user management.
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    UserListSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register — Register a new user."""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Generate JWT tokens on registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful!',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """POST /api/auth/login — Login and get JWT tokens."""
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """POST /api/auth/logout — Blacklist refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/auth/profile — View and update own profile."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Profile updated successfully.', 'user': serializer.data})


class ChangePasswordView(APIView):
    """POST /api/auth/change-password — Change user password."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})


class BookmarkEventView(APIView):
    """POST /api/auth/bookmark/:event_id — Toggle bookmark on an event."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        from events.models import Event
        event = get_object_or_404(Event, id=event_id)
        user = request.user
        if event in user.bookmarks.all():
            user.bookmarks.remove(event)
            return Response({'message': 'Bookmark removed.', 'bookmarked': False})
        else:
            user.bookmarks.add(event)
            return Response({'message': 'Event bookmarked.', 'bookmarked': True})


class MyBookmarksView(generics.ListAPIView):
    """GET /api/auth/bookmarks — List user's bookmarked events."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from events.serializers import EventListSerializer
        events = request.user.bookmarks.filter(status='published')
        serializer = EventListSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)


# ───────────── Admin Views ─────────────

class AdminUserListView(generics.ListAPIView):
    """GET /api/auth/admin/users — Admin: list all users."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserListSerializer

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return User.objects.none()
        return User.objects.all().order_by('-created_at')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/auth/admin/users/:id — Admin: manage a user."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserListSerializer

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return User.objects.none()
        return User.objects.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance == request.user:
            return Response({'error': 'Cannot delete yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        instance.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class AdminToggleUserStatusView(APIView):
    """POST /api/auth/admin/users/:id/toggle-status — Activate/deactivate user."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()
        status_str = 'activated' if user.is_active else 'deactivated'
        return Response({'message': f'User {status_str} successfully.', 'is_active': user.is_active})
