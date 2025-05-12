from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver
from cart.models import Cart, CartItem
from .models import User, Profile
from django.db import transaction

@receiver(post_save, sender=User)
@transaction.atomic
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        customer_group, _ = Group.objects.get_or_create(name="customer")
        instance.groups.add(customer_group) # Assign new users to the "customer" group by default
        
        Profile.objects.create(user=instance, email=instance.email)