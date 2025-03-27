from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

from admin_panel.models import Product


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