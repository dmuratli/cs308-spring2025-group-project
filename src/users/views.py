from django.shortcuts import render, get_object_or_404, redirect
from .models import User, Profile
from django.http import HttpResponse
from .forms import RegisterForm, ProfileForm
from django.shortcuts import get_object_or_404
from django.forms.models import model_to_dict
from django.contrib.auth import login, logout
from django.http import JsonResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_http_methods
from django.contrib.auth.decorators import login_required
import json

from Crypto.Hash import SHA256
from Crypto.Random import get_random_bytes

import base64

#Helper functions here

def password_hasher(plaintext_pw):# Input: plaintext pw, Output: b64 encoded salt + Hashed (SHA-2:256) and salted (32 byte random binary value with b64 encoding) password
    salt = get_random_bytes(32)  # Generate 32-byte salt
    hasher_object = SHA256.new()
    hasher_object.update(salt + plaintext_pw.encode())  # Apply salt, then hash

    salt_encoded = base64.b64encode(salt).decode('utf-8')  # Convert to Base64 string
    return salt_encoded, hasher_object.hexdigest() # Return the salt, along with salted and hashed password

#TODO Do type checks in order to use salt in raw form to reduce space consumption from ~%133 -> %100

def hash_checker(plaintext_pw, username): #Input: plaintext, Output: Boolean
    # Retrieve the user, hash the input password with stored salt, and compare.
    user = get_object_or_404(User, username=username)

    # Ensure salt is stored and retrieved correctly
    if isinstance(user.salt, str):
        salt = base64.b64decode(user.salt)  # Decode from Base64

    hasher_object = SHA256.new()
    hasher_object.update(salt + plaintext_pw.encode())  # Apply salt, then hash
    computed_hash = hasher_object.hexdigest()

    return computed_hash == user.password

#TODO After changing salt to raw form, fix this to take raw salt instead

# Create your views here.
@csrf_exempt
def register_view(request, *args, **kwargs):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))  # Parse JSON request body
            print("Received Data:", data)  # ✅ Debugging

            form = RegisterForm(data)  # Use parsed JSON data
            if form.is_valid():
                username = form.cleaned_data["username"]
                password = form.cleaned_data["password"]
                email = form.cleaned_data["email"]
                salt, hashed_password = password_hasher(password)

                try:
                    user = User.objects.create(username=username, password=hashed_password, salt=salt, email=email)
                    Profile.objects.create(user=user,
                                           name="",
                                           email=email,
                                           address="")
                    return JsonResponse({"message": "Registration successful"}, status=201)

                except IntegrityError as e:
                    if "username" in str(e):
                        return JsonResponse({"error": "This username is already taken."}, status=400)
                    elif "email" in str(e):
                        return JsonResponse({"error": "This email is already registered."}, status=400)

            print("Form errors:", form.errors)  # ✅ Debugging
            return JsonResponse({"error": "Invalid form data.", "details": form.errors}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def login_view(request, *args, **kwargs):
    if request.method == "POST":
        import json
        try:
            data = json.loads(request.body.decode("utf-8"))  # Parse JSON request
            print("Received Data:", data)  # ✅ Debugging

            username = data.get("username")
            password = data.get("password")

            if not username or not password:
                return JsonResponse({"error": "Username and password are required"}, status=400)
            if hash_checker(password, username):
                user = get_object_or_404(User, username=username)
                login(request, user)
                return JsonResponse({"message": "Login successful"}, status=200)
            else:
                print("Wrong password or username")  # ✅ Debugging
                return JsonResponse({"error": "Invalid credentials"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)

    # Define context outside the POST condition to prevent undefined errors
    context = {
        "form": form,
        "is_pw_valid": is_pw_valid,
    }
    
    return render(request, "login_page.html", context)

@require_POST
def logout_view(request):
    try:
        logout(request)
        return JsonResponse({"message": "Logout successful"}, status=200)
    except Exception as e:
        return JsonResponse({"message": "An error occurred while logging out"}, status=500)

@login_required(login_url="/login/")
def profile_view(request):
    profile = get_object_or_404(Profile, user=request.user)
    profile_data = model_to_dict(profile)
    return JsonResponse(profile_data, status=200)

@login_required(login_url="/login/")
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