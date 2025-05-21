from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from users.models import Profile
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from decimal import Decimal
from datetime import date

from admin_panel.models import Product, Genre
from cart.models import Cart, CartItem
from orders.models import Order, OrderItem, Refund

User = get_user_model()

class UserViewsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="john", password="pass123")
        self.client = APIClient()

    def test_get_csrf_token_sets_cookie(self):
        """CSRF token view should return 200."""
        url = reverse('get_csrf')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertIn("detail", resp.json())

    def test_register_view_success(self):
        """Register view returns refresh and access tokens."""
        url = reverse('register')
        data = {
            "username": "newuser",
            "email": "newuser@test.com",
            "password": "newpassword123",
        }
        resp = self.client.post(url, data, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn("refresh", resp.data)
        self.assertIn("access", resp.data)

    def test_register_view_invalid(self):
        """Invalid register returns 400 with errors."""
        url = reverse('register')
        data = {"username": "", "password": "123"}  # invalid: no email, empty username
        resp = self.client.post(url, data, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn("username", resp.data)

    def test_logout_view_success(self):
        """Logout view blacklists refresh token."""
        refresh = RefreshToken.for_user(self.user)
        self.client.force_authenticate(self.user)
        url = reverse('logout')
        resp = self.client.post(url, {"refresh": str(refresh)}, format='json')
        self.assertEqual(resp.status_code, 205)

    def test_logout_view_missing_token(self):
        """Missing refresh token returns 400."""
        self.client.force_authenticate(self.user)
        url = reverse('logout')
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data["error"], "Refresh token is required")

    def test_profile_view_success(self):
        """Authenticated user can fetch their profile."""
        self.client.force_authenticate(self.user)
        url = reverse('profile')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["username"], self.user.username)

    def setUp(self):
        # 1) Create a user + log in
        self.user = User.objects.create_user(username="alice", password="pass")
        self.client = APIClient()
        self.client.login(username="alice", password="pass")

        self.genre, _ = Genre.objects.get_or_create(name="Fiction")

        # 2) Create a product with stock=10
        self.prod = Product.objects.create(
            title="Sample Book",
            author="Test Author",
            price=20,
            stock=10,
            genre=self.genre,
            isbn="1234567890",
            description="Test book description",
            publisher="Test Publisher",
            publication_date=date.today(),  # ✅ This is what you were missing
            pages=100,
            language="English",
        )

        # 3) Create an active cart with 3 copies
        cart = Cart.objects.create(user=self.user, is_active=True)
        CartItem.objects.create(cart=cart, product=self.prod, quantity=3)

        # 4) Place an order via the same logic as PlaceOrderView
        response = self.client.post(reverse("place-order"))
        assert response.status_code == status.HTTP_201_CREATED
        self.order_id = response.data["order_id"]
        self.order = Order.objects.get(pk=self.order_id)

        # 5) Manually mark as Delivered
        self.order.status = "Delivered"
        self.order.save()

        # Grab the generated OrderItem
        self.oi = self.order.items.get()
        self.assertEqual(self.oi.quantity, 3)
        self.assertEqual(self.oi.price_at_purchase, Decimal("20.00"))

    def test_partial_refund(self):
        url = reverse("order-refund", args=[self.order_id])
        payload = {"items": [{"order_item_id": self.oi.id, "quantity": 2}]}

        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(resp.data["refunded_amount"]), Decimal("40.00"))
        # Order remains Delivered because 1 unit is still unrefunded
        self.assertEqual(resp.data["status"], "Delivered")

        # DB checks
        self.oi.refresh_from_db()
        self.assertEqual(self.oi.refunded_quantity, 2)

        # Stock should have increased by 2
        self.prod.refresh_from_db()
        self.assertEqual(self.prod.stock, 10 + 2)

        # A Refund record exists
        refund = Refund.objects.get(order_item=self.oi)
        self.assertEqual(refund.quantity, 2)
        self.assertEqual(refund.refund_amount, Decimal("40.00"))

    def test_full_refund(self):
        url = reverse("order-refund", args=[self.order_id])
        payload = {"items": [{"order_item_id": self.oi.id, "quantity": 3}]}

        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(resp.data["refunded_amount"]), Decimal("60.00"))
        # Now fully refunded → status flips to Refunded
        self.assertEqual(resp.data["status"], "Refunded")

        # DB checks
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "Refunded")

    def test_over_refund_error(self):
        url = reverse("order-refund", args=[self.order_id])
        payload = {"items": [{"order_item_id": self.oi.id, "quantity": 5}]}

        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Cannot refund 5", resp.data["error"])