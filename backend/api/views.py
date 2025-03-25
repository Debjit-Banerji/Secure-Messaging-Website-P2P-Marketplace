from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import serializers
# from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, parser_classes
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
from .models import Product, Purchase, Group, GroupMembership, GroupMessage
from .serializers import ProductSerializer, Group, GroupDetailSerializer, GroupListSerializer, GroupMembershipSerializer, GroupSerializer, GroupMessageSerializer, GroupMembership, GroupMessage
from django.utils import timezone
from datetime import timedelta
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage

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
        fields = ["id", "username", "email", "password", "public_key", "phone_verified", "email_verified"]
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
    type = request.data.get("type", "")
    fileType = request.data.get("fileType", "")
    fileName = request.data.get("fileName", "")
    if not receiver_id or not message:
        return Response({"error": "Receiver and message are required."}, status=status.HTTP_400_BAD_REQUEST)
    
    receiver = get_object_or_404(User, id=receiver_id)
    chat = ChatMessage.objects.create(sender=sender, receiver=receiver, message=message, nonce=nonce, type=type, fileType=fileType, fileName=fileName)
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
@permission_classes([IsAuthenticated])
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

    print(settings.EMAIL_HOST)
    print(settings.EMAIL_PORT)
    print(settings.EMAIL_HOST_USER)
    print(settings.EMAIL_HOST_PASSWORD)
    print(settings.EMAIL_USE_TLS)
    print(settings.EMAIL_USE_SSL)
    print(settings.DEFAULT_FROM_EMAIL)
    
    # Send OTP email
    try:
        send_mail(
            'Your OTP Code',
            f'Your OTP is {otp_code}. It is valid for 10 minutes.',
            settings.EMAIL_HOST_USER,  # Use Django settings
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



@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def products(request, product_id=None):
    """
    Handles:
    - GET: Fetch products (all or filtered)
    - POST: Create a new product
    - PUT: Edit an existing product (requires product_id)
    - DELETE: Delete an existing product (requires product_id)
    """

    if request.method == 'GET':
        id = request.GET.get('id')
        query = request.GET.get('q', '')

        products = Product.objects.filter(sold=False)

        if id:
            products = products.filter(user=id)
        elif query:
            products = products.filter(
                Q(name__icontains=query) | Q(description__icontains=query)
            )
        
        print(products)
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        print("Received Data:", request.data)  # Debugging

        user_id = request.data.get("user")  # ✅ Expecting User ID now

        print("user_id"+str(user_id))

        try:
            user = User.objects.get(id=user_id)  # ✅ Fetch User by ID
        except User.DoesNotExist:
            return Response({"user": ["User not found."]}, status=status.HTTP_400_BAD_REQUEST)

        product_data = request.data.copy()

        serializer = ProductSerializer(data=product_data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=user)  # ✅ Save image explicitly
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method in ['PUT', 'DELETE']:
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        # Verify the user owns the product
        if product.user != request.user:
            return Response(
                {"error": "You can only modify your own products"},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.method == 'PUT':
            product_data = request.data.copy()

            serializer = ProductSerializer(product, data=product_data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            product.delete()
            return Response({"message": "Product deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
# @authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def buy_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    buyer = request.user
    seller = product.user

    print("Buyer")
    print(UserSerializer(buyer).data)
    print("Seller")
    print(UserSerializer(seller).data)

    # Prevent self-purchase
    if seller and buyer and seller == buyer:
        return Response({"error": "You cannot purchase your own product."}, status=400)
    
    print("Product")
    print(ProductSerializer(product).data["sold"])

    # Check if already sold
    if product and ProductSerializer(product).data["sold"] == True:
        return Response({"error": "Product is already sold."}, status=400)
    

    with transaction.atomic():
        buyer.wallet -= product.price
        buyer.save()

        # Add price to seller's wallet
        seller.wallet += product.price
        seller.save()

        product.sold = True
        
        # Ensure the purchase is only created once
        purchase, created = Purchase.objects.get_or_create(product=product, buyer=request.user)
        if not created:
            return Response({"error": "You have already purchased this product."}, status=400)

        # Notify the seller
        seller_email = seller.email
        send_mail(
            'Your Product is Sold!',
            f'Your product "{product.name}" has been purchased by {request.user.username}.',
            settings.EMAIL_HOST_USER,
            [seller_email],
            fail_silently=False,
        )   

        product.delete()

    return Response({"message": "Product purchased successfully!"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_group(request):
    """Create a new group with the current user as admin"""
    name = request.data.get("name")
    members_data = request.data.get("members", [])  # List of {id, encrypted_group_key} dictionaries

    if not name:
        return Response({"error": "Group name is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check if a group with this name already exists
    if Group.objects.filter(name=name).exists():
        return Response({"error": "A group with this name already exists"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Create the group with current user as admin
            group = Group.objects.create(name=name, admin=request.user)

            # Ensure the admin is in the members list
            admin_key_data = next((m for m in members_data if str(m["id"]) == str(request.user.id)), None)
            if not admin_key_data:
                return Response({"error": "Admin key missing"}, status=status.HTTP_400_BAD_REQUEST)

            # Add the admin to GroupMembership
            GroupMembership.objects.create(
                user=request.user,
                group=group,
                encrypted_symmetric_key=admin_key_data["encrypted_group_key"]
            )

            # Add other members to the group
            for member_data in members_data:
                if str(member_data["id"]) == str(request.user.id):
                    continue  # Skip the admin (already added)

                try:
                    member = User.objects.get(id=member_data["id"])
                    GroupMembership.objects.create(
                        user=member,
                        group=group,
                        encrypted_symmetric_key=member_data["encrypted_group_key"]
                    )
                except User.DoesNotExist:
                    continue  # Skip missing users

            serializer = GroupDetailSerializer(group)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_group_member(request, group_id):
    """Add a new member to an existing group"""
    member_id = request.data.get("member_id")
    encrypted_key = request.data.get("encrypted_key")

    if not member_id or not encrypted_key:
        return Response({"error": "Member ID and encrypted key are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        group = Group.objects.get(id=group_id)
        
        # Check if the user is the admin of the group
        if group.admin != request.user:
            return Response({"error": "Only the group admin can add members"}, status=status.HTTP_403_FORBIDDEN)

        # Check if the member exists
        try:
            member = User.objects.get(id=member_id)
        except User.DoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        # Check if the member is already in the group
        if GroupMembership.objects.filter(user=member, group=group).exists():
            return Response({"error": "User is already a member of this group"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add the member to the group
        GroupMembership.objects.create(
            user=member,
            group=group,
            encrypted_symmetric_key=encrypted_key
        )
        
        # Get updated group details including all members
        updated_group_data = GroupDetailSerializer(group).data

        # Return the updated list of members with their encrypted keys
        return Response(updated_group_data, status=status.HTTP_200_OK)

    except Group.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_group_member(request, group_id, member_id):
    """Remove a member from a group"""
    try:
        group = Group.objects.get(id=group_id)
        # Check if the user is the admin of the group
        if group.admin != request.user:
            return Response({"error": "Only the group admin can remove members"}, status=status.HTTP_403_FORBIDDEN)
        # Check if the member exists and is in the group
        try:
            member = User.objects.get(id=member_id)
            membership = GroupMembership.objects.get(user=member, group=group)
        except (User.DoesNotExist, GroupMembership.DoesNotExist):
            return Response({"error": "User is not a member of this group"}, status=status.HTTP_404_NOT_FOUND)

        # Cannot remove the admin from their own group
        if member == group.admin:
            return Response({"error": "Cannot remove the group admin"}, status=status.HTTP_400_BAD_REQUEST)
        # Remove the member
        membership.delete()

        # After member removal, admin should update encrypted keys for remaining members
        # This happens client-side but we need to provide the updated group data
        updated_group_data = GroupDetailSerializer(group).data
        return Response(updated_group_data, status=status.HTTP_200_OK)
    except Group.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_group_details(request, group_id):
    """Get details of a specific group"""
    try:
        # Check if the user is a member of the group
        membership = GroupMembership.objects.filter(user=request.user, group_id=group_id).first()
        if not membership:
            return Response({"error": "You are not a member of this group"}, status=status.HTTP_403_FORBIDDEN)

        group = membership.group
        serializer = GroupDetailSerializer(group)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_group_membership(request, group_id):
    """Retrieve the membership details of the authenticated user in a specific group."""
    try:
        # Fetch the user's membership entry for the given group
        print(request.user)
        print(group_id)
        membership = GroupMembership.objects.filter(user=request.user, group_id=group_id).first()
        group = Group.objects.get(id=group_id)
        admin_id = GroupDetailSerializer(group).data['admin']['id']

        print(UserProfileSerializer(User.objects.get(id=admin_id)))
        admin_public_key = UserProfileSerializer(User.objects.get(id=admin_id)).data["public_key"]
        print(admin_public_key)


        if not membership:
            return Response({"error": "You are not a member of this group"}, status=status.HTTP_403_FORBIDDEN)
        
        new_data_entry = GroupMembershipSerializer(membership).data
        print(new_data_entry)
        new_data_entry["admin_public_key"] = admin_public_key
        print(new_data_entry)
        return Response(new_data_entry, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_user_groups(request):
    """List all groups where the current user is a member"""
    groups = Group.objects.filter(groupmembership__user=request.user)
    serializer = GroupListSerializer(groups, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_group_message(request, group_id):
    """Send a message to a group"""
    message = request.data.get("message")
    message_type = request.data.get("type", "text")
    file_type = request.data.get("fileType", None)
    file_name = request.data.get("fileName", None)
    if not message:
        return Response({"error": "Message content is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        # Check if the user is a member of the group
        membership = GroupMembership.objects.filter(user=request.user, group_id=group_id).first()
        if not membership:
            return Response({"error": "You are not a member of this group"}, status=status.HTTP_403_FORBIDDEN)
        group = membership.group
        # Create and save the message
        group_message = GroupMessage.objects.create(
            group=group,
            sender=request.user,
            message=message,
            type=message_type,
            fileType=file_type,
            fileName=file_name
        )
        # Return the created message details
        serializer = GroupMessageSerializer(group_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_group_messages(request, group_id):
    """Get all messages from a group"""
    try:
        # Check if the user is a member of the group
        membership = GroupMembership.objects.filter(user=request.user, group_id=group_id).first()
        if not membership:
            return Response({"error": "You are not a member of this group"}, status=status.HTTP_403_FORBIDDEN)
        group = membership.group
        # Get messages with optional pagination
        messages = GroupMessage.objects.filter(group=group).order_by('timestamp')
        # # Add pagination if needed
        # page = request.query_params.get('page')
        # if page:
        #     paginator = Paginator(messages, 50)  # 50 messages per page
        #     try:
        #         messages = paginator.page(page)
        #     except (PageNotAnInteger, EmptyPage):
        #         messages = paginator.page(1)
        serializer = GroupMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
