from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from admin_panel.models import Product, Genre
from cart.models import Cart, CartItem
from datetime import date

User = get_user_model()

class CartTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="inleyennagmeler", password="ruhumusardi")
        self.client_logged_in = APIClient()
        self.client_logged_in.force_authenticate(user=self.user)

        self.client_guest = APIClient()

        self.genre, _ = Genre.objects.get_or_create(name="Fiction")

        self.product = Product.objects.create(
            title="Test Book",
            author="Author",
            price=50.00,
            stock=10,
            isbn="1234567890123",
            genre=self.genre,
            description="A test book.",
            publisher="Test Pub",
            publication_date=date(2020, 1, 1),
            pages=100,
            language="English",
            cover_image="book_covers/test.jpg"
        )

        self.cart_url = reverse('cart')

    def test_cart_created_and_item_added_for_user(self):
        print("\n=== Test: Cart Creation & Add Item (User) ===")
        res = self.client_logged_in.post(self.cart_url, {"product_id": self.product.id, "quantity": 2}, format='json')
        print("Response:", res.data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(len(res.data['items']), 1)
        self.assertEqual(res.data['items'][0]['quantity'], 2)

    def test_cart_created_and_item_added_for_guest(self):
        print("\n=== Test: Cart Creation & Add Item (Guest) ===")
        res = self.client_guest.post(self.cart_url, {"product_id": self.product.id, "quantity": 2}, format='json')
        print("Response:", res.data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(len(res.data['items']), 1)
        self.assertEqual(res.data['items'][0]['quantity'], 2)

    def test_add_same_product_twice_user(self):
        print("\n=== Test: Add Same Product Twice (User) ===")
        self.client_logged_in.post(self.cart_url, {"product_id": self.product.id, "quantity": 1}, format='json')
        self.client_logged_in.post(self.cart_url, {"product_id": self.product.id, "quantity": 3}, format='json')
        cart = Cart.objects.get(user=self.user)
        item = CartItem.objects.get(cart=cart, product=self.product)
        print(f"Final Quantity: {item.quantity}")
        self.assertEqual(item.quantity, 4)

    def test_in_stock_validation_guest(self):
        print("\n=== Test: Stock Validation (Guest) ===")
        res = self.client_guest.post(self.cart_url, {"product_id": self.product.id, "quantity": 999}, format='json')
        print("Response:", res.data)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Not enough stock", res.data.get("error", ""))

    def test_cart_total_field_user(self):
        print("\n=== Test: Cart Total Price (User) ===")
        self.client_logged_in.post(self.cart_url, {"product_id": self.product.id, "quantity": 2}, format='json')
        res = self.client_logged_in.get(self.cart_url)
        print("Cart Total:", res.data.get("total"))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(float(res.data.get("total", 0)), 100.00)

    def test_cart_total_field_guest(self):
        print("\n=== Test: Cart Total Price (Guest) ===")
        self.client_guest.post(self.cart_url, {"product_id": self.product.id, "quantity": 2}, format='json')
        res = self.client_guest.get(self.cart_url)
        print("Cart Total:", res.data.get("total"))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(float(res.data.get("total", 0)), 100.00)
