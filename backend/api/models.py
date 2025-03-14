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
    # Many-to-many for friend relationships.
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)

    def __str__(self):
        return self.name if self.name else self.username

class Group(models.Model):
    name = models.CharField(max_length=100)
    # Use a different related_name to avoid clashing with the built-in User.groups
    members = models.ManyToManyField(User, related_name='custom_groups', blank=True)

    def __str__(self):
        return self.name

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, related_name="sent_messages", on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name="received_messages", on_delete=models.CASCADE)
    message = models.TextField()
    nonce = models.CharField(blank=True, null=True)
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
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='product_images/')
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
        if self.product.sold:
            raise ValidationError("This product has already been sold.")

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
