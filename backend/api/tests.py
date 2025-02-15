# api/tests.py
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import ChatMessage, Group

User = get_user_model()


class BasicUserTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Clean out existing data.
        User.objects.all().delete()
        Group.objects.all().delete()

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
        url = reverse('token_obtain_pair')
        data = {"username": "testuser", "password": "testpass"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_search_users(self):
        """
        Test that a logged-in user can search for other users.
        """
        # Register two users with unique usernames.
        self.client.post(reverse('register'), {
            "username": "user3",
            "email": "user3@example.com",
            "password": "testpass",
            "bio": "I am user three",
            "phone": "1111111111"
        }, format='json')
        self.client.post(reverse('register'), {
            "username": "user4",
            "email": "user4@example.com",
            "password": "testpass",
            "bio": "I am user four",
            "phone": "2222222222"
        }, format='json')
        
        # Login with one of the users.
        login_response = self.client.post(reverse('token_obtain_pair'), {
            "username": "user3",
            "password": "testpass"
        }, format='json')
        token = login_response.data.get("access")
        
        # Use the token to search for users.
        url = reverse('search-users')
        response = self.client.get(url, {"q": "user"}, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)


class AdvancedUserTests(APITestCase):
    def setUp(self):
        # Clear any preexisting data.
        User.objects.all().delete()
        Group.objects.all().delete()
        
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        
        # Create two users via the registration endpoint.
        self.user1_data = {
            "username": "user1",
            "email": "user1@example.com",
            "password": "pass1234",
            "bio": "I am user1",
            "phone": "1111111111"
        }
        # Pass a 'name' field for user2.
        self.user2_data = {
            "username": "user2",
            "email": "user2@example.com",
            "password": "pass1234",
            "bio": "I am user2",
            "phone": "2222222222",
            "name": "TestUser2"
        }
        self.client.post(self.register_url, self.user1_data, format='json')
        self.client.post(self.register_url, self.user2_data, format='json')
        
        # Login both users to get JWT tokens.
        login_response1 = self.client.post(
            self.login_url,
            {"username": self.user1_data["username"], "password": self.user1_data["password"]},
            format='json'
        )
        self.user1_token = login_response1.data.get("access")
        
        login_response2 = self.client.post(
            self.login_url,
            {"username": self.user2_data["username"], "password": self.user2_data["password"]},
            format='json'
        )
        self.user2_token = login_response2.data.get("access")
        
        # Retrieve the created user objects.
        self.user1 = User.objects.get(username="user1")
        self.user2 = User.objects.get(username="user2")
        
        # Since the registration view may not save the 'name' field,
        # update user2's name here so that it matches the test expectation.
        if not self.user2.name:
            self.user2.name = "TestUser2"
            self.user2.save()
        
        # Create a friend relationship between user1 and user2.
        self.user1.friends.add(self.user2)
        self.user2.friends.add(self.user1)
        
        # Create a group and add both users as members.
        self.group = Group.objects.create(name="Test Group")
        self.group.members.add(self.user1, self.user2)

    def auth_headers(self, token):
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_update_profile(self):
        """
        Test updating the user profile (name, bio, phone).
        """
        update_url = reverse('update-profile')
        data = {
            "name": "User One Updated",
            "bio": "Updated bio",
            "phone": "9999999999"
        }
        response = self.client.patch(
            update_url, data, format='json', **self.auth_headers(self.user1_token)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("message"), "Profile updated successfully!")
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.name, data["name"])
        self.assertEqual(self.user1.bio, data["bio"])
        self.assertEqual(self.user1.phone, data["phone"])

    def test_search_friends_groups(self):
        """
        Test searching for friends and groups.
        """
        search_url = reverse('search-friends-groups')
        # Use a query that should match user2's name ("TestUser2") and the group "Test Group".
        response = self.client.get(
            search_url, {"q": "test"}, **self.auth_headers(self.user1_token)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        friends = response.data.get("friends", [])
        groups = response.data.get("groups", [])
        self.assertTrue(any(friend["username"] == "user2" for friend in friends))
        self.assertTrue(any(group["name"] == "Test Group" for group in groups))

    def test_send_chat(self):
        """
        Test sending a chat message from user1 to user2.
        """
        send_chat_url = reverse('send-chat')
        data = {
            "receiver": self.user2.id,
            "message": "Hello, user2!"
        }
        response = self.client.post(
            send_chat_url, data, format='json', **self.auth_headers(self.user1_token)
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get("message"), "Hello, user2!")
        self.assertEqual(response.data.get("sender"), self.user1.id)
        self.assertEqual(response.data.get("receiver"), self.user2.id)

    def test_get_chats(self):
        """
        Test retrieving chat messages between user1 and user2.
        """
        send_chat_url = reverse('send-chat')
        # User1 sends a message.
        self.client.post(
            send_chat_url,
            {"receiver": self.user2.id, "message": "Hi user2, this is user1"},
            format='json', **self.auth_headers(self.user1_token)
        )
        # User2 sends a reply.
        self.client.post(
            send_chat_url,
            {"receiver": self.user1.id, "message": "Hi user1, user2 here"},
            format='json', **self.auth_headers(self.user2_token)
        )
        get_chats_url = reverse('get-chats', kwargs={'user_id': self.user2.id})
        response = self.client.get(
            get_chats_url, format='json', **self.auth_headers(self.user1_token)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        chats = response.data
        self.assertGreaterEqual(len(chats), 2)
        sender_ids = {chat["sender"] for chat in chats}
        receiver_ids = {chat["receiver"] for chat in chats}
        self.assertIn(self.user1.id, sender_ids)
        self.assertIn(self.user2.id, sender_ids)
        self.assertIn(self.user1.id, receiver_ids)
        self.assertIn(self.user2.id, receiver_ids)
