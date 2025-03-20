from django.db import models
from Crypto.Hash import SHA256
from Crypto.Random.random import getrandbits
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    salt = models.CharField(max_length=256, blank=True, null=True)
    email = models.EmailField(max_length=256, blank=False, null=False, unique=True)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(max_length=256, blank=False, null=False)
    address = models.CharField(max_length=150, blank=True)