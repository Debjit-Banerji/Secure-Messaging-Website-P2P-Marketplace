# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings 
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError

class User(AbstractUser):
    name = models.CharField(max_length=100, blank=True)
    profile_pic = models.CharField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    public_key = models.CharField(blank=True, null=True)
    email_cipher = models.JSONField(blank=True, null=True)
    phone_cipher = models.JSONField(blank=True, null=True)
    phone_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    wallet = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    # Many-to-many for friend relationships.
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)

    def __str__(self):
        return self.name if self.name else self.username

class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)
    admin = models.ForeignKey(User, related_name='admin_groups', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='member_groups', through='GroupMembership', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class GroupMembership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    encrypted_symmetric_key = models.JSONField(blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'group')

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, related_name="sent_messages", on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name="received_messages", on_delete=models.CASCADE)
    message = models.TextField()
    nonce = models.CharField(blank=True, null=True)
    type = models.CharField(blank=True, null=True)
    fileType = models.CharField(blank=True, null=True)
    fileName = models.CharField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.message[:30]}"


class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)  # 6-digit OTP
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.expires_at = timezone.now() + timedelta(minutes=10)
        self.save()

    def is_valid(self):
        return timezone.now() <= self.expires_at  # Check if OTP is still valid

    def __str__(self):
        return f"OTP for {self.user.email}: {self.otp}"

class Product(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.CharField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sold = models.BooleanField(default=False)

class Purchase(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE)
    purchased_at = models.DateTimeField(auto_now_add=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        if self.product.user == self.buyer:
            raise ValidationError("You cannot purchase your own product.")

    def save(self, *args, **kwargs):
        self.clean()
        if not self.purchase_price:
            self.purchase_price = self.product.price
        self.product.sold = True  # Mark product as sold
        self.product.save()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.product.sold = False  # Mark product as available again
        self.product.save()
        super().delete(*args, **kwargs)

class GroupMessage(models.Model):
    group = models.ForeignKey(Group, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='group_messages', on_delete=models.CASCADE)
    message = models.TextField()  # Encrypted message (client-side encryption)
    type = models.CharField(max_length=20, default='text')  # text, file, etc.
    fileType = models.CharField(max_length=100, blank=True, null=True)  # For file messages
    fileName = models.CharField(max_length=255, blank=True, null=True)  # For file messages
    timestamp = models.DateTimeField(auto_now_add=True)  

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username} in {self.group.name}: {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
