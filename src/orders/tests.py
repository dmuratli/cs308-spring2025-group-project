from django.test import TestCase
from django.contrib.auth import get_user_model
from admin_panel.models import Product
from cart.models import Cart, CartItem
from orders.models import Order, OrderItem

User = get_user_model()

class OrderFlowTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.product = Product.objects.create(
            title="Test Book",
            author="Tester",
            price=50.00,
            stock=10,
            isbn="1234567890123",
            genre="Fiction",
            description="A test book",
            publisher="Test Pub",
            publication_date="2024-01-01",
            pages=100,
            language="English",
            slug="test-book"
        )

    def test_add_to_cart_and_order(self):
        # Create Cart
        cart = Cart.objects.create(user=self.user)

        # Add CartItem
        CartItem.objects.create(cart=cart, product=self.product, quantity=3)

        # Check stock before
        self.assertEqual(self.product.stock, 10)

        # Place order manually (simulate what PlaceOrderView does)
        total = 0
        for item in cart.items.all():
            item.product.decrease_stock(item.quantity)
            total += item.quantity * item.product.price

        order = Order.objects.create(user=self.user, total_price=total)
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_at_purchase=item.product.price
            )

        # Refresh product from DB
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 7)
        self.assertEqual(OrderItem.objects.count(), 1)
        self.assertEqual(order.total_price, 150.00)

    def test_stock_cannot_go_below_zero(self):
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=15)

        with self.assertRaises(ValueError):
            for item in cart.items.all():
                item.product.decrease_stock(item.quantity)

