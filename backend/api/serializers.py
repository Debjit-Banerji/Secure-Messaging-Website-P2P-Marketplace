# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import Group, ChatMessage
from rest_framework import serializers
from .models import Product, Purchase, Group, GroupMembership, GroupMessage

User = get_user_model()

# Existing User serializer (update fields if needed)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "bio", "phone", "name"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

# Serializer for updating user profile (Name, Password, Email, Phone, Bio)
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["name", "password", "email", "phone", "bio", "profile_pic"]

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
            # ... any other safe fields ...
        ]

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)  # ✅ Handles image properly

    class Meta:
        model = Product
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        if instance.image and request:
            representation["image"] = request.build_absolute_uri(instance.image.url)  # ✅ Returns absolute URL
        return representation

class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = '__all__'

# serializers.py - Add these serializers

class GroupMembershipSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    encrypted_key = serializers.CharField(source='encrypted_symmetric_key')
    
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
    
# serializers.py - Add GroupMessage serializer

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.CharField(source='sender.id', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = GroupMessage
        fields = ['id', 'group_id', 'sender_id', 'sender_username', 'message', 
                 'type', 'fileType', 'fileName', 'timestamp']