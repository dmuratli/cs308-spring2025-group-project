from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from users.views import register_view, login_view, logout_view, profile_view, profile_update_view
from admin_panel.views import ProductViewSet, OrderViewSet, UserViewSet  # Import views

# Create API Router
router = DefaultRouter()
router.register(r'products', ProductViewSet)  # /api/products/
router.register(r'orders', OrderViewSet)  # /api/orders/
router.register(r'users', UserViewSet)  # /api/users/

urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # User Authentication Endpoints
    path('register/', register_view, name="register"),
    path('login/', login_view, name="login"),

    # API Endpoints
    path('api/', include(router.urls)),  # Include API endpoints from DRF Router
    path('api-auth/', include('auth_api.urls')),  # Include DRF authentication URLs

    # User Profile Endpoints
    path("profile/", profile_view, name="profile"),
    path("profile/edit/", profile_update_view, name="profile_edit"),
]

# Serve uploaded media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

