from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from users.views import (
    register_view,
    login_view,
    logout_view,
    profile_view,
    profile_update_view,
)

from admin_panel.views import (
    ProductViewSet,
    OrderViewSet,
    UserViewSet,
    product_detail_by_slug,  # ✅ Import the slug-based view
)

# DRF Router
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Authentication
    path('register/', register_view, name="register"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name="logout"),

    # User Profile
    path('profile/', profile_view, name="profile"),
    path('profile/edit/', profile_update_view, name="profile_edit"),

    # DRF API (list, create, update, delete)
    path('api/', include(router.urls)),

    # Detail view by slug for BookDetailsPage
    path('api/products/<slug:slug>/', product_detail_by_slug, name="product-detail-slug"),

    # DRF browsable API auth (optional)
    path('api-auth/', include('auth_api.urls')),
]

# Media file support in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
