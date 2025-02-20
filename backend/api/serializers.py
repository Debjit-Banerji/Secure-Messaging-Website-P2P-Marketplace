# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import Group, ChatMessage

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
        fields = ["name", "password", "email", "phone", "bio"]

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
        fields = ["id", "sender", "sender_username", "receiver", "receiver_username", "message", "timestamp"]

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
            # ... any other safe fields ...
        ]
