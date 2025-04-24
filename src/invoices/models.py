from django.db import models
from django.conf import settings

class Invoice(models.Model):
    customer   = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   on_delete=models.CASCADE,
                                   related_name="invoices")
    total      = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    # keep it simple: store a JSON dump of the basket
    items_json = models.JSONField()

    def __str__(self):
        return f"Invoice #{self.pk} – {self.customer.email}"
