from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from orders.views import OrderProductInfoView
from wishlist.views import WishlistViewSet

# JWT auth
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Your custom views
from users.views import (
    register_view, logout_view,
    profile_view, profile_update_view,
    get_csrf_token,
    user_info,
)
from admin_panel.views import (
    ProductViewSet, OrderViewSet, UserViewSet, GenreViewSet,
    product_detail_by_slug,
)

# DRF router for your ViewSets
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders',    OrderViewSet,   basename='order')
router.register(r'users',     UserViewSet,    basename='user')
router.register(r'genres',    GenreViewSet,   basename='genre')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    # 2) Reviews (you already had)
    path('api/reviews/', include('reviews.urls')),

    # 3) Place-order (must precede the router, so /place/ isn’t caught by the viewset)
    path('api/orders/', include('orders.urls')),

    # 4) JWT & Auth helpers
    path('api/token/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),      name='token_refresh'),
    path('api/register/',      register_view,                   name='register'),
    path('logout/',        logout_view,                     name='logout'),
    path('api/csrf/',          get_csrf_token,                  name='get_csrf'),
    path("api/orders/<int:pk>/product/", OrderProductInfoView.as_view()),
    path("api/reviews/", include("reviews.urls")),

    # 5) Namespaced cart (for new clients)
    path('api/cart/',    include('cart.urls')),

    # 6) Namespaced payment (for new clients)
    path('api/payment/', include('payment.urls')),

    # 7) Cart & Payment aliases (for your existing React URLs)
    path('cart/',    include('cart.urls')),
    path('payment/', include('payment.urls')),

    # 8) User profile
    path('profile/',      profile_view,        name='profile'),
    path('profile/edit/', profile_update_view, name='profile_edit'),

    # 9) DRF router catch-all (products, orders, users list/detail)
    path('api/', include(router.urls)),

    # 10) Single‐product detail by slug
    path('api/products/<slug:slug>/', product_detail_by_slug, name='product-detail-slug'),

    # 11) Invoices (HTML & PDF)
    path("api/invoices/", include("invoices.urls")),
    
    path('api/user-info/', user_info, name='user-info'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)