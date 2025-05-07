from django.db import models
from django.conf import settings
from admin_panel.models import Product
from decimal import Decimal

class Order(models.Model):
    STATUS_CHOICES = [
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Refunded", "Refunded"),
        ("Cancelled", "Cancelled"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Processing")
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    product_title = models.CharField(
        max_length=255,
        help_text="Snapshot of the product title at time of purchase"
    )
    refunded_quantity = models.PositiveIntegerField(default=0)
    def save(self, *args, **kwargs):
        if not self.pk:
            self.product_title = self.product.title
        super().save(*args, **kwargs)
    
    @property
    def subtotal(self):
        return self.quantity * self.price_at_purchase
    @property
    def refundable_quantity(self):
       return self.quantity - self.refunded_quantity
    
class OrderStatusHistory(models.Model):
    order     = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='history')
    status    = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

class Refund(models.Model):
    """
    Records a refund against a single OrderItem.
    """
    order = models.ForeignKey(Order, related_name="refunds", on_delete=models.CASCADE)
    order_item = models.ForeignKey(OrderItem, related_name="refunds", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Refund {self.id} of {self.quantity}× item#{self.order_item.id}"
