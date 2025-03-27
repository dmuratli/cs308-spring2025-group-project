from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from admin_panel.models import Product
from cart.models import Cart, CartItem
from datetime import date

class CartTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="teoman", password="teoman")

        # Get token and authenticate client
        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            title="Test Book",
            author="Author",
            price=50.00,
            stock=10,
            isbn="1234567890123",
            genre="Fiction",
            description="A test book.",
            publisher="Test Pub",
            publication_date=date(2020, 1, 1),
            pages=100,
            language="English",
            cover_image="book_covers/test.jpg"
        )

        self.cart_url = reverse('cart')


    def test_cart_created_and_item_added(self):
        response = self.client.post(self.cart_url, {
            "product_id": self.product.id,
            "quantity": 2
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 2)
        self.assertEqual(float(response.data['items'][0]['total_price']), 100.00)

    def test_add_same_product_twice_increments_quantity(self):
        self.client.post(self.cart_url, {
            "product_id": self.product.id,
            "quantity": 1
        }, format='json')
        self.client.post(self.cart_url, {
            "product_id": self.product.id,
            "quantity": 3
        }, format='json')

        cart = Cart.objects.get(user=self.user)
        item = CartItem.objects.get(cart=cart, product=self.product)
        self.assertEqual(item.quantity, 4)

    def test_in_stock_validation(self):
        response = self.client.post(self.cart_url, {
            "product_id": self.product.id,
            "quantity": 999  # exceeds stock
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("Not enough stock", response.data.get("error", ""))

    def test_get_cart_returns_correct_data(self):
        self.client.post(self.cart_url, {
            "product_id": self.product.id,
            "quantity": 2
        }, format='json')

        response = self.client.get(self.cart_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['product'], self.product.id)
        self.assertEqual(response.data['items'][0]['quantity'], 2)

    def test_cart_total_field(self):
        # You must have total calculated in your CartSerializer for this test to pass
        self.client.post(self.cart_url, {
            "product_id": self.product.id,
            "quantity": 2
        }, format='json')

        response = self.client.get(self.cart_url)
        self.assertEqual(float(response.data.get("total", 0)), 100.00)
