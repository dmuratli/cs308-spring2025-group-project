from django.shortcuts import render, get_object_or_404
from .models import User
from django.http import HttpResponse, JsonResponse
from .forms import RegisterForm
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt


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



import json

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
                    User.objects.create(username=username, password=hashed_password, salt=salt, email=email)
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

            is_pw_valid = hash_checker(plaintext_pw=password, username=username)

            if is_pw_valid:
                print("Hashes match - Login successful")  # ✅ Debugging
                return JsonResponse({"message": "Login successful", "status": "success"}, status=200)
            else:
                print("Wrong password or username")  # ✅ Debugging
                return JsonResponse({"error": "Invalid credentials"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)

