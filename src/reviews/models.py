from django.db import models
from django.conf import settings
from orders.models import Product





class Review(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')


    stars = models.PositiveSmallIntegerField()
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')  # NEW

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"Review by {self.user.username} for {self.product.name}"
