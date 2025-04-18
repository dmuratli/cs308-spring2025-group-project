from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.forms.models import model_to_dict
from django.contrib.auth import login, logout, get_user_model
from django.http import JsonResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_http_methods
from django.utils.decorators import method_decorator
from django.db.models.signals import post_save
from django.dispatch import receiver

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import User, Profile
from .forms import RegisterForm, ProfileForm
from .serializers import RegisterSerializer

import json

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    print(serializer.errors)  # Log the serializer errors for debugging
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
    except KeyError:
        return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
    except TokenError:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    profile = get_object_or_404(Profile, user=request.user)
    profile_data = model_to_dict(profile)

    profile_data["username"] = request.user.username
    
    return JsonResponse(profile_data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def profile_update_view(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)
    profile = get_object_or_404(Profile, user=request.user)
    form = ProfileForm(data, instance=profile)
    if form.is_valid():
        form.save()
        updated_profile = model_to_dict(profile)
        return JsonResponse(updated_profile, status=200)
    else:
        return JsonResponse(form.errors, status=400)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    roles = list(user.groups.values_list('name', flat=True))
    return Response({
        "username": user.username,
        "roles": roles,
    })