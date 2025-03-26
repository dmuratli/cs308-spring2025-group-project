"""
URL configuration for e_commerce_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import register_view, user_profile_view
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# Register your viewsets with the router here
# router.register(r'endpoint', YourViewSet)

urlpatterns = [
    path('api/register/', register_view, name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', user_profile_view, name='user_profile'),
    path('admin/', admin.site.urls),
    # path('logout/', logout_view, name="logout"),

    # API Endpoints
    path('api/', include(router.urls)),  # Include API endpoints from DRF Router

    # User Profile Endpoints
    #path("profile/", profile_view, name="profile"),
    #path("profile/edit/", profile_update_view, name="profile_edit"),
]





