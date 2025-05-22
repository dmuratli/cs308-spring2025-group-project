from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from admin_panel.models import Product, Genre
from orders.models import Order
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile

UserAuth = get_user_model()

class AdminPanelTests(APITestCase):
    def setUp(self):
        self.user = UserAuth.objects.create_user(username="user", email="user@example.com", password="testpass")
        self.pm_user = UserAuth.objects.create_user(username="pm", email="pm@example.com", password="testpass")
        pm_group, _ = Group.objects.get_or_create(name="product manager")
        self.pm_user.groups.add(pm_group)

        self.genre, _ = Genre.objects.get_or_create(name="Test Genre")

        self.product = Product.objects.create(
            title="Test Book",
            author="Test Author",
            price=30.00,
            stock=5,
            isbn="1234567890123",
            genre=self.genre,
            description="Test Description",
            publisher="Test Publisher",
            publication_date="2025-01-01",
            pages=200,
            language="EN",
            slug="test-book",
            cover_image=SimpleUploadedFile(name='test.jpg', content=b'', content_type='image/jpeg')
        )

        self.client_user = APIClient()
        self.client_user.force_authenticate(self.user)

        self.client_pm = APIClient()
        self.client_pm.force_authenticate(self.pm_user)

    def test_list_products_anonymous(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_retrieve_product_by_slug(self):
        url = reverse('product-detail-slug', kwargs={"slug": self.product.slug})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["title"], self.product.title)

    def test_regular_user_cannot_create_product(self):
        url = reverse('product-list')
        data = {
            "title": "Illegal Book",
            "author": "No Auth",
            "price": "15.00",
            "stock": 5,
            "isbn": "3213213213213",
            "genre": "Illegal",
            "description": "Illegal desc",
            "publisher": "Illegal",
            "publication_date": "2025-01-01",
            "pages": 120,
            "language": "EN",
            "cover_image": SimpleUploadedFile(name='cover.jpg', content=b'', content_type='image/jpeg')
        }
        response = self.client_user.post(url, data, format="multipart")
        self.assertEqual(response.status_code, 403)

    def test_adjust_stock_increase(self):
        url = reverse('product-adjust-stock', kwargs={"slug": self.product.slug})
        data = {"change": 5}
        response = self.client_pm.post(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_adjust_stock_decrease(self):
        url = reverse('product-adjust-stock', kwargs={"slug": self.product.slug})
        data = {"change": -3}
        response = self.client_pm.post(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 2)

    def test_adjust_stock_negative_below_zero(self):
        url = reverse('product-adjust-stock', kwargs={"slug": self.product.slug})
        data = {"change": -10}
        response = self.client_pm.post(url, data, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Stock cannot go below zero", str(response.data))

    def test_update_product_partial_put_without_cover_image(self):
        url = reverse('product-detail', kwargs={"slug": self.product.slug})
        data = {"price": "35.00"}
        response = self.client_pm.put(url, data, format="json")
        self.assertEqual(response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(str(self.product.price), "35.00")

    def test_list_users_as_admin_panel_user(self):
        url = reverse('user-list')
        response = self.client_pm.get(url)
        self.assertEqual(response.status_code, 200)
