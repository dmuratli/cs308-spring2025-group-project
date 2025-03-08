import os
import django
import random
from faker import Faker
from admin_panel.models import Product

# ✅ Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "e_commerce_app.settings")
django.setup()

fake = Faker()

# ✅ List of example book genres
genres = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Mystery", "Fantasy", "Horror", "Romance"]

# ✅ Function to generate dummy products
def create_dummy_products(n=50):
    for _ in range(n):
        Product.objects.create(
            title=fake.sentence(nb_words=3),  # Generates a fake book title
            author=fake.name(),  # Generates a random author name
            price=round(random.uniform(5, 50), 2),  # Random price between $5 - $50
            stock=random.randint(1, 100),  # Random stock between 1 - 100
            isbn=fake.isbn13(),  # Generates a random 13-digit ISBN
            genre=random.choice(genres),  # Selects a random genre
            description=fake.paragraph(nb_sentences=3),  # Generates a short description
            publisher=fake.company(),  # Generates a fake publisher name
            publication_date=fake.date_between(start_date="-10y", end_date="today"),  # Random date from last 10 years
            cover_image="book_covers/sample_cover.jpg",  # Placeholder image
            pages=random.randint(100, 1000),  # Random number of pages between 100 - 1000
            language=fake.language_name(),  # Generates a fake language
        )

    print("✅ 50 dummy books added successfully!")

if __name__ == "__main__":
    create_dummy_products()
