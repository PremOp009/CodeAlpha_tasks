"""URL patterns for the users app."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('register', views.RegisterView.as_view(), name='register'),
    path('login', views.LoginView.as_view(), name='login'),
    path('logout', views.LogoutView.as_view(), name='logout'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile', views.ProfileView.as_view(), name='profile'),
    path('change-password', views.ChangePasswordView.as_view(), name='change_password'),

    # Bookmarks
    path('bookmark/<int:event_id>', views.BookmarkEventView.as_view(), name='bookmark_event'),
    path('bookmarks', views.MyBookmarksView.as_view(), name='my_bookmarks'),

    # Admin
    path('admin/users', views.AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>', views.AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:pk>/toggle-status', views.AdminToggleUserStatusView.as_view(), name='admin_toggle_user'),
]
