from django.shortcuts import render
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
from django.db import IntegrityError
from .serializers import UserProfileSerializer
from .serializers import (
    UserSerializer,
    UserProfileUpdateSerializer,
    GroupSerializer,
    ChatMessageSerializer
)
from django.core.mail import send_mail
from django.http import JsonResponse
from .models import OTP
import random
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import Product, Purchase
from .serializers import ProductSerializer
from django.utils import timezone
from datetime import timedelta


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
        fields = ["id", "username", "email", "password", "public_key"]
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
    public_key = request.data.get("public_key", "")
    print(public_key)
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            bio=bio,
            phone=phone,
            public_key=public_key,
        )
    except IntegrityError:
        # This typically indicates the username already exists.
        return Response(
            {"error": "Username already exists. Please choose another username."},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(
        {"message": "User registered successfully!"},
        status=status.HTTP_201_CREATED
    )

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
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get('q', '')

    # Get the IDs of users to exclude: current user + existing contacts
    excluded_users = list(request.user.friends.values_list('id', flat=True))  # Get contact IDs
    excluded_users.append(request.user.id)  # Add current user ID

    # Filter users based on query and exclude already added contacts + current user
    users = User.objects.filter(
        Q(username__icontains=query) | Q(bio__icontains=query)
    ).exclude(id__in=excluded_users)

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
    sent_messages = ChatMessage.objects.filter(sender=user, receiver=other_user).order_by("timestamp")
    received_messages = ChatMessage.objects.filter(sender=other_user, receiver=user).order_by("timestamp")
    
    # Serialize messages
    sent_serializer = ChatMessageSerializer(sent_messages, many=True)
    received_serializer = ChatMessageSerializer(received_messages, many=True)
    
    return Response({
        "sent": sent_serializer.data,
        "received": received_serializer.data
    })

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
    nonce = request.data.get("nonce", "")
    if not receiver_id or not message:
        return Response({"error": "Receiver and message are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    receiver = get_object_or_404(User, id=receiver_id)
    chat = ChatMessage.objects.create(sender=sender, receiver=receiver, message=message, nonce=nonce)
    serializer = ChatMessageSerializer(chat)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_contact(request):
    """
    Add a user to the current user's contacts.
    Expects a JSON payload with "contact_id".
    """
    contact_id = request.data.get("contact_id")
    if not contact_id:
        return Response({"error": "contact_id is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    contact = get_object_or_404(User, id=contact_id)
    # Optionally, you can check if the contact is already added.
    if contact in request.user.friends.all():
        return Response({"error": "Contact already added."}, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.friends.add(contact)
    return Response({"message": "Contact added successfully!"}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_contacts(request):
    """
    List all contacts (friends) of the current user.
    """
    contacts = request.user.friends.all()
    serializer = UserSerializer(contacts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_contact(request):
    """
    Remove a user from the current user's contacts.
    Expects a JSON payload with "contact_id".
    """
    contact_id = request.data.get("contact_id")
    if not contact_id:
        return Response({"error": "contact_id is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    contact = get_object_or_404(User, id=contact_id)
    if contact not in request.user.friends.all():
        return Response({"error": "Contact not found in your contacts."}, status=status.HTTP_400_BAD_REQUEST)
    
    request.user.friends.remove(contact)
    return Response({"message": "Contact removed successfully!"}, status=status.HTTP_200_OK)

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET  -> Returns the non-sensitive data of the logged-in user
    PATCH -> Partially updates the user's profile with provided fields
    """
    if request.method == "GET":
        # Serialize the current user (from the token) without sensitive fields
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # elif request.method == "PATCH":
    #     # Partially update the user's profile (e.g., bio, phone, etc.)
    #     serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_200_OK)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
def send_otp_email(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required."}, status=400)

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User not found."}, status=404)

    # Generate new OTP
    otp_code = random.randint(100000, 999999)
    otp_obj, created = OTP.objects.update_or_create(
    user=user,
    defaults={
        "otp": otp_code,
        "expires_at": timezone.now() + timedelta(minutes=10)
    }
)
    
    # Send OTP email
    try:
        send_mail(
            'Your OTP Code',
            f'Your OTP is {otp_code}. It is valid for 10 minutes.',
            settings.DEFAULT_FROM_EMAIL,  # Use Django settings
            [email],
            fail_silently=False,
        )
        return Response({"message": "OTP sent successfully."}, status=200)
    except Exception as e:
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get("email")
    otp_code = request.data.get("otp")

    if not email or not otp_code:
        return Response({"error": "Email and OTP are required."}, status=400)

    user = User.objects.filter(email=email).first()
    if not user:
        return Response({"error": "User not found."}, status=404)

    otp_obj = OTP.objects.filter(user=user, otp=otp_code).first()

    if not otp_obj:
        return Response({"error": "Invalid OTP."}, status=400)

    if not otp_obj.is_valid():
        return Response({"error": "OTP has expired."}, status=400)

    # OTP is valid, proceed with authentication or password reset
    return Response({"message": "OTP verified successfully."}, status=200)



@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def products(request):
    if request.method == 'GET':
        products = Product.objects.filter(sold=False)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def buy_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    # Prevent self-purchase
    if product.user == request.user:
        return Response({"error": "You cannot purchase your own product."}, status=400)

    # Check if already sold
    if product.sold:
        return Response({"error": "Product is already sold."}, status=400)

    with transaction.atomic():
        product.sold = True
        product.save()
        
        # Ensure the purchase is only created once
        purchase, created = Purchase.objects.get_or_create(product=product, buyer=request.user)
        if not created:
            return Response({"error": "You have already purchased this product."}, status=400)

        # Notify the seller
        seller_email = product.user.email
        send_mail(
            'Your Product is Sold!',
            f'Your product "{product.name}" has been purchased by {request.user.username}.',
            'your_email@gmail.com',
            [seller_email],
            fail_silently=False,
        )

    return Response({"message": "Product purchased successfully!"})

