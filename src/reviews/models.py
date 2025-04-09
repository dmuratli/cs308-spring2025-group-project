from django.db import models
from django.conf import settings

# Create your models here.

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey('e_commerce_app.Product', on_delete=models.CASCADE, related_name='reviews')
    stars = models.PositiveSmallIntegerField()
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"Review by {self.user.username} for {self.product.name}"
    
    @staticmethod
    def get_average_stars(product):
        return product.reviews.aggregate(models.Avg('stars'))['stars__avg'] or 0
        #Göksu, eğer frontend'e yıldızları koyarken ortalama değer göstermek istersen bu işine yarayabilir
    
    