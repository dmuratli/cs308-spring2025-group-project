from django.db import models
from django.utils.text import slugify
from django.utils import timezone

class Product(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    isbn = models.CharField(max_length=13, unique=True)
    genre = models.CharField(max_length=100)
    description = models.TextField()
    publisher = models.CharField(max_length=255)
    publication_date = models.DateField()
    cover_image = models.ImageField(upload_to='book_covers/')
    pages = models.IntegerField()
    language = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True)
    ordered_number = models.PositiveIntegerField(default=0)

    # ─── Task 1: Discount fields ───────────────────────────────────────────
    discount_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0.0,
        help_text="Discount rate as a percentage (e.g. 10 for 10%)"
    )
    discount_start = models.DateTimeField(null=True, blank=True)
    discount_end = models.DateTimeField(null=True, blank=True)

    @property
    def is_discount_active(self):
        now = timezone.now()
        return (
            self.discount_rate > 0 and
            self.discount_start and self.discount_end and
            self.discount_start <= now <= self.discount_end
        )
    
    @property
    def current_price(self):
        if self.is_discount_active:
            return self.price * (1 - self.discount_rate / 100)
        return self.price

    # ────────────────────────────────────────────────────────────────────────

    def decrease_stock(self, quantity):
        if quantity > self.stock:
            raise ValueError("Not enough stock to fulfill the request")
        self.stock -= quantity
        self.save()

    def increase_stock(self, quantity):
        self.stock += quantity
        self.save()

    def save(self, *args, **kwargs):
        # Always regenerate slug from title and author, ensuring uniqueness
        base_slug = slugify(f"{self.title}-{self.author}")
        slug_candidate = base_slug
        num = 1

        # Exclude current instance when checking uniqueness
        while Product.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
            slug_candidate = f"{base_slug}-{num}"
            num += 1
        self.slug = slug_candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
