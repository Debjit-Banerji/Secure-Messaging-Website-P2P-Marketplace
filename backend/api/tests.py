from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

class UserAPITestCase(APITestCase):
    def test_registration(self):
        """
        Test that a new user can register successfully.
        """
        url = reverse('register')
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass",
            "bio": "I am a test user",
            "phone": "1234567890"
        }
        response = self.client.post(url, data, format='json')
        # Expect a 201 CREATED response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["message"], "User registered successfully!")

    def test_jwt_login(self):
        """
        Test that a user can login and receive JWT tokens.
        """
        # First, register the user.
        self.client.post(reverse('register'), {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass",
            "bio": "I am a test user",
            "phone": "1234567890"
        }, format='json')

        # Then login using the JWT login endpoint.
        url = reverse('token_obtain_pair')  # using MyTokenObtainPairView endpoint
        data = {"username": "testuser", "password": "testpass"}
        response = self.client.post(url, data, format='json')
        # Expect a 200 OK response with tokens.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_search_users(self):
        """
        Test that a logged-in user can search for other users.
        """
        # Register two users.
        self.client.post(reverse('register'), {
            "username": "user1",
            "email": "user1@example.com",
            "password": "testpass",
            "bio": "I am user one",
            "phone": "1234567890"
        }, format='json')
        self.client.post(reverse('register'), {
            "username": "user2",
            "email": "user2@example.com",
            "password": "testpass",
            "bio": "I am user two",
            "phone": "0987654321"
        }, format='json')
        
        # Login with one of the users.
        login_response = self.client.post(reverse('token_obtain_pair'), {
            "username": "user1",
            "password": "testpass"
        }, format='json')
        token = login_response.data.get("access")
        
        # Use the token to search for users containing "user" in the username or bio.
        url = reverse('search-users')
        response = self.client.get(url, {"q": "user"}, HTTP_AUTHORIZATION=f"Bearer {token}")
        
        # Expect a 200 OK response and at least two users returned.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)
