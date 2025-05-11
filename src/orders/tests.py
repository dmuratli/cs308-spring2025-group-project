from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from admin_panel.models import Product
from cart.models import Cart, CartItem
from orders.models import Order, OrderItem
from rest_framework import status
from django.contrib.auth.models import Group
from orders.models import Order, OrderItem, RefundRequest, Refund

from django.utils import timezone
from decimal import Decimal
from django.core import mail

User = get_user_model()

class OrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", email="testuser@example.com", password="testpass")
        self.pm_user = User.objects.create_user(username="pm", email="pm@example.com", password="testpass")
        pm_group, _ = Group.objects.get_or_create(name="product manager")
        self.pm_user.groups.add(pm_group)

        self.product = Product.objects.create(
            title="Test Book",
            price=100.00,
            stock=5,
            isbn="1234567890123",
            genre="Fiction",
            description="A great test book",
            publisher="TestPub",
            publication_date="2025-01-01",
            pages=100,
            language="EN",
            slug="test-book"
        )

        self.client_user = APIClient()
        self.client_user.force_authenticate(self.user)

        self.client_pm = APIClient()
        self.client_pm.force_authenticate(self.pm_user)


    def test_place_order_success(self):
        cart = Cart.objects.create(user=self.user, is_active=True)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)

        url = reverse('place-order')
        response = self.client_user.post(url)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Order.objects.filter(user=self.user).exists())

    def test_place_order_insufficient_stock(self):
        cart = Cart.objects.create(user=self.user, is_active=True)
        CartItem.objects.create(cart=cart, product=self.product, quantity=99)

        url = reverse('place-order')
        response = self.client_user.post(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Not enough stock', str(response.data))

    def test_place_order_empty_cart(self):
        url = reverse('place-order')
        response = self.client_user.post(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Cart is empty', str(response.data))

    def test_fetch_my_orders(self):
        Order.objects.create(user=self.user, total_price=100.00)
        url = reverse('my-orders')
        response = self.client_user.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_fetch_all_orders_pm(self):
        Order.objects.create(user=self.user, total_price=100.00)
        url = reverse('order-list')
        response = self.client_pm.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_invalid_status_transition(self):
        order = Order.objects.create(user=self.user, total_price=100.00, status="Processing")
        url = reverse('order-status-update', kwargs={'pk': order.id})
        data = {"status": "Delivered"}  # Cannot jump Processing → Delivered directly
        response = self.client_pm.patch(url, data)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid transition', str(response.data))

    def test_valid_status_transition(self):
        order = Order.objects.create(user=self.user, total_price=100.00, status="Processing")
        url = reverse('order-status-update', kwargs={'pk': order.id})
        data = {"status": "Shipped"}
        response = self.client_pm.patch(url, data)
        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, "Shipped")

    def test_fetch_order_items(self):
        order = Order.objects.create(user=self.user, total_price=100.00)
        OrderItem.objects.create(order=order, product=self.product, quantity=2, price_at_purchase=self.product.price)
        url = reverse('order-items', kwargs={'order_id': order.id})
        response = self.client_user.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_fetch_order_product_info(self):
        order = Order.objects.create(user=self.user, total_price=100.00)
        OrderItem.objects.create(order=order, product=self.product, quantity=2, price_at_purchase=self.product.price)
        url = reverse('order-product-info', kwargs={'order_id': order.id})
        response = self.client_user.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('items', response.data)
        self.assertEqual(len(response.data['items']), 1)

    def test_unauthenticated_place_order(self):
        self.client.logout()
        url = reverse('place-order')
        response = self.client.post(url)
        self.assertEqual(response.status_code, 401)



class RefundRequestsTestCase(APITestCase):
    def setUp(self):
        # 1) Create groups
        customer_group, _ = Group.objects.get_or_create(name="customer")
        sales_group,    _ = Group.objects.get_or_create(name="sales manager")

        # 2) Create users
        self.customer = User.objects.create_user(
            username="cust",
            email="cust@example.com",
            password="pass"
        )
        self.customer.groups.add(customer_group)

        self.sales = User.objects.create_user(
            username="sales",
            email="sales@example.com",
            password="pass"
        )
        self.sales.groups.add(sales_group)

        # 3) Use DRF client with force_authenticate for the customer
        self.client = APIClient()
        self.client.force_authenticate(user=self.customer)

        # 4) Seed a valid Product (all non-null fields)
        self.prod = Product.objects.create(
            title="Book",
            slug="book",
            isbn="0000000000000",
            genre="Test",
            description="A test book",
            publisher="TestPub",
            publication_date="2025-01-01",
            pages=123,
            language="EN",
            price=Decimal("10.00"),
            stock=5
        )

        # 5) Place an order (via your PlaceOrderView)
        cart = Cart.objects.create(user=self.customer, is_active=True)
        CartItem.objects.create(cart=cart, product=self.prod, quantity=2)
        place_resp = self.client.post(reverse("place-order"))
        self.assertEqual(place_resp.status_code, status.HTTP_201_CREATED, msg=place_resp.data)
        self.order_id = place_resp.data["order_id"]

        # 6) Mark it as delivered and grab the OrderItem
        order = Order.objects.get(pk=self.order_id)
        order.status = "Delivered"
        order.save()
        self.oi = order.items.first()

        # 7) Now switch the client to the sales manager for later tests
        self.client.force_authenticate(user=self.sales)

    def test_create_refund_request(self):
        # Customer creates a refund request
        self.client.force_authenticate(user=self.customer)
        url = reverse("refund-requests-create", args=[self.order_id])
        data = {"order_item_id": self.oi.id, "quantity": 1}
        resp = self.client.post(url, data, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(RefundRequest.objects.count(), 1)

    def test_list_pending_requests_sales(self):
        # Seed a pending request
        RefundRequest.objects.create(order_item=self.oi, user=self.customer, quantity=1)
        self.client.force_authenticate(user=self.sales)

        url = reverse("refund-requests-list")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_process_refund_approval(self):
        # Sales manager approves
        rr = RefundRequest.objects.create(order_item=self.oi, user=self.customer, quantity=1)
        self.client.force_authenticate(user=self.sales)

        url = reverse("refund-requests-process", args=[rr.id])
        resp = self.client.post(
            url,
            {"status": "Approved", "response_message": "OK"},
            format="json"
        )
        self.assertEqual(resp.status_code, 200)

        rr.refresh_from_db()
        self.assertEqual(rr.status, "Approved")

        # Check that a Refund record was created
        self.assertTrue(Refund.objects.filter(order_item=self.oi).exists())

        # Check stock increment
        self.prod.refresh_from_db()
        self.assertEqual(self.prod.stock, 6)

        # Check email notification
        self.assertEqual(len(mail.outbox), 1)
