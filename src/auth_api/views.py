from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User
from .serializers import UserSerializer, RegisterSerializer
from users.views import password_hasher, hash_checker
from django.db import IntegrityError
from django.shortcuts import get_object_or_404

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                username = serializer.validated_data['username']
                password = serializer.validated_data['password']
                email = serializer.validated_data['email']
                salt, hashed_password = password_hasher(password)
                
                user = User.objects.create(
                    username=username, 
                    password=hashed_password, 
                    salt=salt, 
                    email=email
                )
                
                user_serializer = UserSerializer(user)
                return Response(user_serializer.data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                if "username" in str(e):
                    return Response(
                        {"error": "This username is already taken."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif "email" in str(e):
                    return Response(
                        {"error": "This email address is already registered."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                return Response(
                    {"error": "Registration failed."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {"error": "Please provide both username and password"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(username=username)
            if hash_checker(password, username):
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'username': user.username,
                    'email': user.email
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Invalid credentials"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"success": "Successfully logged out"}, status=status.HTTP_200_OK)
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)