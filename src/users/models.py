from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_groups",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_permissions",
        blank=True
    )

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, blank=True)
    email = models.EmailField(max_length=256, blank=False, null=False)
    phone_number    = models.CharField(max_length=20, blank=True)
    address_line1   = models.CharField(max_length=255, blank=True)
    address_line2   = models.CharField(max_length=255, blank=True)
    city            = models.CharField(max_length=100, blank=True)
    postal_code     = models.CharField(max_length=20, blank=True)