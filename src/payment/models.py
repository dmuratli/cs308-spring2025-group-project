from django.db import models
from django.conf import settings 
from orders.models import Order

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('Preparing', 'Preparing'),
        ('On Route', 'On Route'),
        ('Delivered', 'Delivered'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # Use AUTH_USER_MODEL
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Preparing')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction for {self.user.username} - {self.status}"