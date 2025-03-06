from django.db import models
from Crypto.Hash import SHA256
from Crypto.Random.random import getrandbits
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    salt = models.CharField(max_length=256, blank=True, null=True)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, blank=True)
    postal_code = models.CharField(max_length=10, blank=True)
    address = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)