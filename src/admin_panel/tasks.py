from celery import shared_task
from django.utils import timezone
from .models import Product

@shared_task
def clear_expired_discounts():
    now = timezone.now()
    Product.objects.filter(discount_end__lt=now).update(
        discount_rate=0,
        discount_start=None,
        discount_end=None
    )
    return "Expired discounts cleared successfully."