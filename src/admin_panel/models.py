from django.db import models
from django.utils.text import slugify
from django.db import transaction
from django.db.models import F
# Create your models here.

# Order Model
class Order(models.Model):
    STATUS_CHOICES = [
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Delivered", "Delivered"),
        ("Refunded", "Refunded"),
        ("Cancelled", "Cancelled"),
    ]
    
    customer_name = models.CharField(max_length=255)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Processing")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.customer_name}"

# User Model
class User(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique, non-empty genre name"
    )

    def __str__(self):
        return self.name

class Product(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    isbn = models.CharField(max_length=13, unique=True)
    genre = models.ForeignKey(
        Genre,
        on_delete=models.CASCADE,                     # ← delete product if its genre is deleted
        related_name="products",
        help_text="Each product must have a genre; deleting a genre deletes its products"
    )
    description = models.TextField()
    publisher = models.CharField(max_length=255)
    publication_date = models.DateField()
    cover_image = models.ImageField(upload_to='book_covers/')
    pages = models.IntegerField()
    language = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True)
    ordered_number = models.PositiveIntegerField(default=0)

    def decrease_stock(self, quantity):
        """
        Atomically subtract `quantity` from stock, error if insufficient.
        """
        with transaction.atomic():
            updated = Product.objects.filter(
                pk=self.pk,
                stock__gte=quantity
            ).update(stock=F('stock') - quantity)
            if not updated:
                raise ValueError("Not enough stock to fulfill the request")
            # refresh self so .stock is up to date
            self.refresh_from_db(fields=['stock'])

    def increase_stock(self, quantity):
        """
        Atomically add `quantity` to stock.
        """
        Product.objects.filter(pk=self.pk).update(stock=F('stock') + quantity)
        self.refresh_from_db(fields=['stock'])

    def save(self, *args, **kwargs):
        # Always regenerate slug from title and author, ensuring uniqueness
        base_slug = slugify(f"{self.title}-{self.author}")
        slug_candidate = base_slug
        num = 1
        
        # Exclude current instance when checking for uniqueness
        while Product.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
            slug_candidate = f"{base_slug}-{num}"
            num += 1
        self.slug = slug_candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title