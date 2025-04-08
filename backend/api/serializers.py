# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import Group, ChatMessage
from rest_framework import serializers
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import Product, Purchase, Group, GroupMembership, GroupMessage, add_log_entry, LogAction

User = get_user_model()

ACCESS_TOKEN_COOKIE_NAME = settings.SIMPLE_JWT.get('AUTH_COOKIE_ACCESS_NAME', 'access_token')
REFRESH_TOKEN_COOKIE_NAME = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH_NAME', 'refresh_token')
                                                    
# Existing User serializer (update fields if needed)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "bio", "phone", "name", "phone_verified", "email_verified", "wallet"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

# Serializer for updating user profile (Name, Password, Email, Phone, Bio)
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["name", "password", "email", "phone", "bio", "profile_pic", "phone_verified", "email_verified", "wallet"]

    def update(self, instance, validated_data):
        if "password" in validated_data:
            instance.password = make_password(validated_data.pop("password"))
        return super().update(instance, validated_data)

# Serializer for the Group model
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"]

# Serializer for ChatMessage
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    receiver_username = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "sender", "sender_username", "receiver", "receiver_username", "message", "timestamp", "nonce", "type", "fileType", "fileName"]

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Option A: Explicitly list fields you want to expose
        fields = [
            'id',
            'username',
            'email',
            'bio',
            'phone',
            'name',
            'profile_pic',
            'phone_verified',
            'email_verified',
            'public_key',
            'wallet',
            # ... any other safe fields ...
        ]

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = '__all__'

class GroupMembershipSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    encrypted_key = serializers.JSONField(source='encrypted_symmetric_key')
    class Meta:
        model = GroupMembership
        fields = ['id', 'username', 'encrypted_key', 'added_at']

class GroupDetailSerializer(serializers.ModelSerializer):
    admin = UserSerializer(read_only=True)
    members = serializers.SerializerMethodField()
    class Meta:
        model = Group
        fields = ['id', 'name', 'admin', 'members', 'created_at', 'updated_at']

    def get_members(self, obj):
        memberships = GroupMembership.objects.filter(group=obj)
        return GroupMembershipSerializer(memberships, many=True).data

class GroupListSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'admin_username', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.groupmembership_set.count()

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = GroupMessage
        fields = ['id', 'group_id', 'sender_id', 'sender_username', 'message', 
                 'type', 'fileType', 'fileName', 'timestamp']

class CookieTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        # Add other claims if necessary
        return token

    def validate(self, attrs):
        # Generate tokens but don't include them in the response body
        data = super().validate(attrs)

        # We need the actual tokens to be available for the view to set cookies
        # SimpleJWT signals or overriding token generation might be cleaner,
        # but for now, let's add them here and the view will pop them.
        refresh = self.get_token(self.user)
        data[REFRESH_TOKEN_COOKIE_NAME] = str(refresh)
        data[ACCESS_TOKEN_COOKIE_NAME] = str(refresh.access_token)

        # Remove the default 'refresh' and 'access' keys if present
        data.pop('refresh', None)
        data.pop('access', None)

        # Include user data if needed by the frontend upon login
        data['user'] = UserSerializer(self.user).data # Or UserProfileSerializer

        # Log login action
        add_log_entry(self.user, LogAction.USER_LOGIN, {'username': self.user.username})

        return data


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None # We don't expect 'refresh' in the request body

    def validate(self, attrs):
        # Read refresh token from cookie
        refresh_token_cookie = self.context['request'].COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)

        if not refresh_token_cookie:
            raise InvalidToken('No refresh token found in cookie.')

        attrs['refresh'] = refresh_token_cookie # Pass the cookie value to the parent validator

        # Perform standard refresh token validation
        try:
            data = super().validate(attrs)
        except TokenError as e:
             raise InvalidToken(e.args[0])

        # Don't include the new refresh token in the response body by default
        # (unless implementing strict refresh token rotation where the view sets the cookie)
        # If ROTATE_REFRESH_TOKENS is True, the new refresh token WILL be in data['refresh']
        # The view will handle setting the cookie for it.
        # data.pop('refresh', None) # Let the view decide based on rotation setting

        # Log refresh action if needed (might be noisy)
        # user_id = jwt_settings.DECODE(data['access'], verify=False)['user_id']
        # user = User.objects.get(id=user_id)
        # add_log_entry(user, 'TOKEN_REFRESH', {})
        return data