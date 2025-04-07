from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save
from django.dispatch import receiver
from cart.models import Cart, CartItem
from .models import User, Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, email=instance.email)

@receiver(user_logged_in)
def merge_guest_cart(sender, request, user, **kwargs):
    # Get the guest cart from the session (if it exists)
    session_key = request.session.session_key
    if not session_key:
        return

    try:
        # Look for a guest cart that is active and not tied to any user
        guest_cart = Cart.objects.get(session_key=session_key, is_active=True, user__isnull=True)
    except Cart.DoesNotExist:
        guest_cart = None

    if guest_cart:
        # Get (or create) the user's cart
        user_cart, created = Cart.objects.get_or_create(user=user, is_active=True)
        
        # Merge each guest cart item into the user's cart
        for item in guest_cart.items.all():
            # Check if the product is already in the user's cart
            existing_item = user_cart.items.filter(product=item.product).first()
            if existing_item:
                # Merge quantities if already present
                existing_item.quantity += item.quantity
                existing_item.save()
            else:
                # Reassign the guest item to the user cart
                item.cart = user_cart
                item.save()
        
        # Mark the guest cart as inactive to avoid reprocessing it
        guest_cart.is_active = False
        guest_cart.save()