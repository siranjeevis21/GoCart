from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.profile_url = reverse('auth_profile')
        
        self.user_data = {
            'username': 'testcustomer',
            'email': 'customer@test.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'Customer',
            'phone': '1234567890',
            'address': '123 Test St',
            'role': 'CUSTOMER'
        }

    def test_user_registration(self):
        """Ensure we can register a new user account."""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testcustomer')
        self.assertEqual(User.objects.get().role, 'CUSTOMER')

    def test_user_login(self):
        """Ensure we can login to obtain a JWT token and user info payload."""
        # First register
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Now try to login
        login_data = {
            'username': 'testcustomer',
            'password': 'testpassword123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'testcustomer')

    def test_get_profile_authenticated(self):
        """Ensure an authenticated user can access their profile details."""
        # Create user
        user = User.objects.create_user(
            username='profileuser',
            email='profile@test.com',
            password='profilepassword123',
            first_name='Profile',
            last_name='User',
            role='CUSTOMER'
        )
        # Authenticate
        self.client.force_authenticate(user=user)
        
        # Get profile
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'profileuser')

    def test_get_profile_unauthenticated(self):
        """Ensure an unauthenticated request to profile is blocked."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
