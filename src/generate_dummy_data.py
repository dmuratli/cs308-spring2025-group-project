import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "e_commerce_app.settings")
django.setup()

import random
from faker import Faker
from admin_panel.models import Product

fake = Faker()

genres = [
    "Fiction", "Non-Fiction", "Sci-Fi", "Biography",
    "Mystery", "Fantasy", "Horror", "Romance"
]

def create_dummy_products(n=50):
    for _ in range(n):
        Product.objects.create(
            title=fake.sentence(nb_words=3),
            author=fake.name(),
            price=round(random.uniform(5, 50), 2),
            stock=random.randint(1, 100),
            isbn=fake.isbn13(),
            genre=random.choice(genres),
            description=fake.paragraph(nb_sentences=3),
            publisher=fake.company(),
            publication_date=fake.date_between(start_date="-10y", end_date="today"),
            cover_image="book_covers/sample_cover.jpg",
            pages=random.randint(100, 1000),
            language=fake.language_name(),

            # ─── Task 3: seed the new discount_rate field
            discount_rate=round(random.uniform(0, 0.30), 2),  # up to 30% off
            discount_start=None,
            discount_end=None,
        )

    print(f"✅ {n} dummy books added successfully!")

if __name__ == "__main__":
    create_dummy_products()
