from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from users.models import Profile
from rest_framework_simplejwt.tokens import RefreshToken

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
