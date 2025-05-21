from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from orders.models import Order, OrderItem
from admin_panel.models import Product, Genre
from payment.models import Transaction
from unittest.mock import patch
from datetime import datetime, timedelta

User = get_user_model()

class PaymentViewsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='john', password='pass')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

        self.genre, _ = Genre.objects.get_or_create(name="Genre")

        # Create product
        self.product = Product.objects.create(
            title="Book A", author="Author", price=20, stock=5,
            isbn="1111111111111", genre=self.genre, description="Desc",
            publisher="Pub", publication_date="2025-01-01",
            pages=100, language="EN", slug="book-a"
        )

        # Create order
        self.order = Order.objects.create(
            user=self.user,
            status="Pending",
            total_price=self.product.price
        )

        # ❗ Important: price_at_purchase must be given ❗
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price_at_purchase=self.product.price
        )

    def test_missing_card_fields_returns_400(self):
        url = reverse('process-payment', kwargs={'order_id': self.order.id})
        resp = self.client.post(url, {})
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data['error'], "Missing payment fields")

    def test_invalid_card_number_returns_400(self):
        url = reverse('process-payment', kwargs={'order_id': self.order.id})
        data = {"card_number": "123", "expiry": "12/30", "cvv": "123"}
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data['error'], "Invalid card number")

    def test_expired_card_returns_400(self):
        expired = (datetime.now() - timedelta(days=365)).strftime("%m/%y")
        url = reverse('process-payment', kwargs={'order_id': self.order.id})
        data = {"card_number": "4111111111111111", "expiry": expired, "cvv": "123"}
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data['error'], "Card expired")

    def test_invalid_expiry_format_returns_400(self):
        url = reverse('process-payment', kwargs={'order_id': self.order.id})
        data = {"card_number": "4111111111111111", "expiry": "1230", "cvv": "123"}
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data['error'], "Invalid expiry format, expected MM/YY")

    def test_invalid_cvv_returns_400(self):
        url = reverse('process-payment', kwargs={'order_id': self.order.id})
        data = {"card_number": "4111111111111111", "expiry": "12/30", "cvv": "12"}
        resp = self.client.post(url, data)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.data['error'], "Invalid CVV")

    @patch("payment.views.generate_invoice_pdf", return_value=b"%PDF%")
    @patch("payment.views.send_invoice_email")
    def test_successful_payment_flow(self, mock_send_email, mock_gen_pdf):
        url = reverse('process-payment', kwargs={'order_id': self.order.id})
        valid_data = {
            "card_number": "4111111111111111",
            "expiry": (datetime.now() + timedelta(days=365)).strftime("%m/%y"),
            "cvv": "123"
        }
        resp = self.client.post(url, valid_data)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["message"], "Payment processed successfully")

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 4)

        self.assertTrue(Transaction.objects.filter(user=self.user, order=self.order).exists())
        mock_send_email.assert_called_once()
