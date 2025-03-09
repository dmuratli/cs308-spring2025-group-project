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



@csrf_exempt
def register_view(request, *args, **kwargs):
    form = RegisterForm()
    error_message = None  # Variable to store error messages
    success_message = None

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():  # Validate form input
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            email = form.cleaned_data["email"]
            salt, hashed_password = password_hasher(password)

            try:
                # Attempt to create the user
                User.objects.create(username=username, password=hashed_password, salt=salt, email=email)
                success_message = "Registration successful!"
                print(f"username: {username}\nhashed password: {hashed_password}\nsalt: {salt}")

            except IntegrityError as e:
                if "username" in str(e):
                    error_message = "This username is already taken. Please choose another."
                elif "email" in str(e):
                    error_message = "This email address is already registered. Please use another."

    context = {
        "form": form,
        "error_message": error_message,
        "success_message": success_message,
    }

    return render(request, "register_page.html", context)

@csrf_exempt
def login_view(request, *args, **kwargs):
    form = RegisterForm()
    is_pw_valid = False

    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            is_pw_valid = hash_checker(plaintext_pw=password, username=username)

            if is_pw_valid:
                print("Hashes match - Login successful")
                return JsonResponse({"message": "Login successful", "status": "success"}, status=200)
            else:
                print("Wrong password or username")
                return JsonResponse({"error": "Invalid credentials"}, status=400)
    
    return JsonResponse({"error": "Invalid request"}, status=400)

                

    # Define context outside the POST condition to prevent undefined errors
    context = {
        "form": form,
        "is_pw_valid": is_pw_valid,
    }
    
    return render(request, "login_page.html", context)
