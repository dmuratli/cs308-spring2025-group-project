from django.db import models
#from django.contrib.auth.models import User
from admin_panel.models import Product
from django.conf import settings

class Order(models.Model):
    STATUS_CHOICES = [
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Refunded", "Refunded"),
        ("Cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Processing")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    # ─── Task 4: new field to snapshot the product's discount_rate ─────────
    discount_rate = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0.00,
        help_text="Discount rate at time of purchase"
    )

    def save(self, *args, **kwargs):
        # On first save only, if not explicitly set, snapshot the product's current rate
        if self._state.adding and not self.discount_rate:
            self.discount_rate = self.product.discount_rate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product.title}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order.id}: {self.previous_status} → {self.new_status} at {self.changed_at}"
