"""
Serializers for user authentication and profile management.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'password2', 'role')
        extra_kwargs = {
            'role': {'default': 'user'}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token with user info embedded."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['name'] = user.name
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info to response
        data['user'] = {
            'id': self.user.id,
            'name': self.user.name,
            'email': self.user.email,
            'role': self.user.role,
            'profile_image': (
                self.user.profile_image.url
                if self.user.profile_image else None
            ),
        }
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing and updating user profile."""
    profile_image_url = serializers.SerializerMethodField()
    total_registrations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'name', 'email', 'role', 'profile_image',
            'profile_image_url', 'bio', 'phone',
            'created_at', 'total_registrations'
        )
        read_only_fields = ('id', 'email', 'role', 'created_at')

    def get_profile_image_url(self, obj):
        request = self.context.get('request')
        if obj.profile_image and request:
            return request.build_absolute_uri(obj.profile_image.url)
        return None

    def get_total_registrations(self, obj):
        return obj.registrations.filter(status='confirmed').count()


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for admin user listings."""
    total_registrations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'role', 'is_active', 'created_at', 'total_registrations')

    def get_total_registrations(self, obj):
        return obj.registrations.count()


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs
