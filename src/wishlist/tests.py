# src/wishlist/tests.py
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APIClient

from admin_panel.models import Product
from wishlist.models import WishlistItem
from wishlist.serializers import (
    WishlistItemSerializer,
    WishlistResponseSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

from datetime import date
from decimal import Decimal
from admin_panel.models import Product, Genre
import uuid

def create_product(**kwargs) -> Product:
    genre, _ = Genre.objects.get_or_create(name="Fiction")

    # Default unique ISBN using UUID
    defaults = {
        "title": "Dummy Book Title",
        "author": "John Doe",
        "price": Decimal("12.99"),
        "stock": 10,
        "isbn": str(uuid.uuid4().int)[:13],  # Ensures unique 13-digit ISBN
        "genre": genre,
        "description": "A great book.",
        "publisher": "Great Publisher",
        "publication_date": date.today(),
        "pages": 200,
        "language": "English",
    }
    defaults.update(kwargs)
    return Product.objects.create(**defaults)

def auth_client(user):
    """
    Return an APIClient already authenticated with the given user and
    with CSRF cookies set (mimics what the browser does).
    """
    c = APIClient(enforce_csrf_checks=True)
    c.force_authenticate(user=user)  # logs in via DRF
    # Fetch CSRF cookie from backend and send it on subsequent mutating requests
    c.get("/api/csrf/")
    csrf = c.cookies.get("csrftoken").value
    c.defaults["HTTP_X_CSRFTOKEN"] = csrf
    return c


# ---------------------------------------------------------------------------
# Model-level tests
# ---------------------------------------------------------------------------
class WishlistModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("alice", "a@example.com", "pwd")
        self.prod = create_product()

    def test_unique_constraint(self):
        WishlistItem.objects.create(user=self.user, product=self.prod)
        with self.assertRaises(Exception):
            # second insert must violate unique_together
            WishlistItem.objects.create(user=self.user, product=self.prod)

    def test_cascade_delete_user(self):
        WishlistItem.objects.create(user=self.user, product=self.prod)
        self.user.delete()
        self.assertFalse(WishlistItem.objects.exists())

    def test_cascade_delete_product(self):
        WishlistItem.objects.create(user=self.user, product=self.prod)
        self.prod.delete()
        self.assertFalse(WishlistItem.objects.exists())

    def test_str(self):
        item = WishlistItem.objects.create(user=self.user, product=self.prod)
        self.assertEqual(str(item), f"{self.user} → {self.prod}")


# ---------------------------------------------------------------------------
# Serializer tests
# ---------------------------------------------------------------------------
class WishlistSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("bob", "b@example.com", "pwd")
        self.prod = create_product(title="Cool Book")

    def test_item_serializer_validation_fails_without_product_id(self):
        ser = WishlistItemSerializer(data={})
        self.assertFalse(ser.is_valid())
        self.assertIn("product_id", ser.errors)

    def test_output_contains_flat_fields(self):
        item = WishlistItem.objects.create(user=self.user, product=self.prod)
        ser = WishlistItemSerializer(item)
        data = ser.data
        self.assertEqual(
            set(data.keys()),
            {"id", "product", "added_at"},  # product subtree contains flat fields
        )
        self.assertEqual(data["product"]["title"], "Cool Book")
        self.assertIn("product_price", data["product"])
        self.assertIn("product_cover_image", data["product"])

    def test_wrapper_serializer_shape(self):
        item = WishlistItem.objects.create(user=self.user, product=self.prod)
        payload = {
            "id": self.user.id,
            "items": [item],
        }
        ser = WishlistResponseSerializer(payload)
        self.assertEqual(ser.data["id"], self.user.id)
        self.assertEqual(len(ser.data["items"]), 1)


# ---------------------------------------------------------------------------
# API / ViewSet tests
# ---------------------------------------------------------------------------
class WishlistAPITests(TestCase):
    list_url = "/api/wishlist/"
    add_url = "/api/wishlist/add/"
    rm_url = "/api/wishlist/remove/"

    def setUp(self):
        self.user1 = User.objects.create_user("carl", "c@example.com", "pwd")
        self.user2 = User.objects.create_user("dora", "d@example.com", "pwd")
        self.prod1 = create_product(title="Alpha")
        self.prod2 = create_product(title="Beta")
        self.c1 = auth_client(self.user1)
        self.c2 = auth_client(self.user2)

    # ---------- auth ----------
    def test_unauthenticated_user_gets_401(self):
        res = APIClient().get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ---------- happy paths ----------
    def test_empty_list_returns_ok_and_empty_items(self):
        res = self.c1.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["items"], [])

    def test_add_item(self):
        res = self.c1.post(self.add_url, {"product_id": self.prod1.id})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            WishlistItem.objects.filter(user=self.user1, product=self.prod1).exists()
        )
        self.assertEqual(len(res.data["items"]), 1)

    def test_remove_item(self):
        WishlistItem.objects.create(user=self.user1, product=self.prod1)
        res = self.c1.post(self.rm_url, {"product_id": self.prod1.id})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(
            WishlistItem.objects.filter(user=self.user1, product=self.prod1).exists()
        )

    # ---------- multi-user isolation ----------
    def test_user_sees_only_their_items(self):
        WishlistItem.objects.create(user=self.user1, product=self.prod1)
        WishlistItem.objects.create(user=self.user2, product=self.prod2)

        res1 = self.c1.get(self.list_url)
        res2 = self.c2.get(self.list_url)

        self.assertEqual({it["product"]["id"] for it in res1.data["items"]}, {self.prod1.id})
        self.assertEqual({it["product"]["id"] for it in res2.data["items"]}, {self.prod2.id})

    # ---------- slug helper ----------
    def test_slug_in_payload(self):
        self.c1.post(self.add_url, {"product_id": self.prod1.id})
        res = self.c1.get(self.list_url)
        item = res.data["items"][0]["product"]
        self.assertIn("slug", item)
        self.assertEqual(item["slug"], self.prod1.slug)

