from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import (
    register_view,
    logout_view,
    profile_view,
    profile_update_view,
    get_csrf_token,
)

from admin_panel.views import (
    ProductViewSet,
    OrderViewSet,
    UserViewSet,
    product_detail_by_slug,
)

# DRF Router -- should probably be modified to include all APIs (token, token/refresh etc.)
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', register_view, name="register"),
    path('logout/', logout_view, name="logout"),
    path('api/csrf/', get_csrf_token, name='get_csrf'),
    path('cart/', include('cart.urls')),

    # User Profile
    path('profile/', profile_view, name="profile"),
    path('profile/edit/', profile_update_view, name="profile_edit"),

    # DRF API (list, create, update, delete)
    path('api/', include(router.urls)),

    # Detail view by slug for BookDetailsPage
    path('api/products/<slug:slug>/', product_detail_by_slug, name="product-detail-slug"),
]

# Media file support in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
