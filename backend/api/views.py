from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
# from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import ChatMessage, Group
from django.contrib.auth.hashers import make_password
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    UserProfileUpdateSerializer,
    GroupSerializer,
    ChatMessageSerializer
)
 
User = get_user_model()

def sample_api(request):
    return JsonResponse({"message": "Hello from Django!"})

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username  # Optional: Add extra data to token
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# Serializer to handle user data
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}  # Hide password in response

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])  # Hash password
        return super().create(validated_data)

# API endpoint to register users
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    email = request.data.get("email")
    username = request.data.get("username")
    password = request.data.get("password")
    bio = request.data.get("bio", "")
    phone = request.data.get("phone", "")

    user = User.objects.create_user(username=username, email=email, password=password, bio=bio, phone=phone)
    return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)


# @api_view(["POST"])
# @permission_classes([AllowAny])
# def login_user(request):
#     email = request.data.get("email")  # Changed from `username`
#     password = request.data.get("password")

#     try:
#         user = User.objects.get(email=email)  # Get user by email
#     except User.DoesNotExist:
#         return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

#     if not user.check_password(password):  # Check hashed password
#         return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

#     refresh = RefreshToken.for_user(user)  # Generate JWT tokens
#     return Response({
#         "refresh": str(refresh),
#         "access": str(refresh.access_token),
#     }, status=status.HTTP_200_OK)

# Search users by name or bio
@api_view(['GET'])
def search_users(request):
    query = request.GET.get('q', '')
    users = User.objects.filter(username__icontains=query) | User.objects.filter(bio__icontains=query)
    return Response(UserSerializer(users, many=True).data)

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated successfully!"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Search User Friends and Groups
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_friends_groups(request):
    query = request.GET.get("q", "")
    user = request.user
    # Search among the user’s friends based on username, name, or bio.
    friends = user.friends.filter(
        Q(username__icontains=query) |
        Q(name__icontains=query) |
        Q(bio__icontains=query)
    )
    # Search groups by group name.
    groups = Group.objects.filter(name__icontains=query)
    
    friends_data = UserSerializer(friends, many=True).data
    groups_data = GroupSerializer(groups, many=True).data

    return Response({"friends": friends_data, "groups": groups_data})

# Get All Chats Between Two Parties
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chats(request, user_id):
    """
    Retrieve all chat messages between the logged-in user and the user with the given user_id.
    """
    user = request.user
    other_user = get_object_or_404(User, id=user_id)
    chats = ChatMessage.objects.filter(
        (Q(sender=user) & Q(receiver=other_user)) |
        (Q(sender=other_user) & Q(receiver=user))
    ).order_by("timestamp")
    serializer = ChatMessageSerializer(chats, many=True)
    return Response(serializer.data)

# Add Chat Message Between Two Parties
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_chat(request):
    """
    Create a new chat message from the logged-in user to the specified receiver.
    """
    sender = request.user
    receiver_id = request.data.get("receiver")
    message = request.data.get("message", "")
    if not receiver_id or not message:
        return Response({"error": "Receiver and message are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    receiver = get_object_or_404(User, id=receiver_id)
    chat = ChatMessage.objects.create(sender=sender, receiver=receiver, message=message)
    serializer = ChatMessageSerializer(chat)
    return Response(serializer.data, status=status.HTTP_201_CREATED)