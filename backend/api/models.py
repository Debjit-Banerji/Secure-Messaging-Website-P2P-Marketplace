# models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings 
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
import hashlib
import json
from django.db import transaction

class LogAction:
    USER_REGISTER = 'USER_REGISTER'
    USER_LOGIN = 'USER_LOGIN' # You'll need to integrate this where login happens
    USER_LOGOUT = 'USER_LOGOUT' # Similarly for logout
    PROFILE_UPDATE = 'PROFILE_UPDATE'
    OTP_REQUEST = 'OTP_REQUEST'
    OTP_VERIFY_SUCCESS = 'OTP_VERIFY_SUCCESS'
    OTP_VERIFY_FAIL = 'OTP_VERIFY_FAIL'
    PRODUCT_CREATE = 'PRODUCT_CREATE'
    PRODUCT_UPDATE = 'PRODUCT_UPDATE'
    PRODUCT_DELETE = 'PRODUCT_DELETE'
    PRODUCT_PURCHASE = 'PRODUCT_PURCHASE'
    CONTACT_ADD = 'CONTACT_ADD'
    CONTACT_REMOVE = 'CONTACT_REMOVE'
    GROUP_CREATE = 'GROUP_CREATE'
    GROUP_MEMBER_ADD = 'GROUP_MEMBER_ADD'
    GROUP_MEMBER_REMOVE = 'GROUP_MEMBER_REMOVE'
    GROUP_MESSAGE_SEND = 'GROUP_MESSAGE_SEND'
    USER_REPORT = 'USER_REPORT' 
    VERIFICATION_REQUESTED = 'VERIFICATION_REQUESTED'
    VERIFICATION_APPROVED = 'VERIFICATION_APPROVED'
    VERIFICATION_REJECTED = 'VERIFICATION_REJECTED'
    USER_DELETED_BY_ADMIN = 'USER_DELETED_BY_ADMIN'


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
    members = models.ManyToManyField(User, related_name='member_groups', through='GroupMembership', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin = models.ForeignKey(
        User,
        related_name='admin_groups',
        on_delete=models.CASCADE, # Or models.CASCADE if you prefer, but SET_NULL is safer if admin can be deleted
        null=True, # Allow NULL in the database
        blank=True # Allow the field to be blank in forms/admin (often used with null=True)
    )
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

class LogBlock(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='log_entries')
    action = models.CharField(max_length=50, db_index=True) # Use LogAction constants here
    details = models.JSONField(default=dict) # Store action-specific details
    previous_hash = models.CharField(max_length=64, default='0') # Hash of the previous block
    current_hash = models.CharField(max_length=64, unique=True, blank=True) # Hash of this block's data + previous hash

    @staticmethod
    def verify_chain_integrity():
        """
        Verifies the integrity of the entire chain.
        Returns True if the chain is valid, False otherwise.
        """
        blocks = LogBlock.objects.order_by('timestamp')
        previous_hash = '0'  # Genesis block has previous hash of '0'
        
        for block in blocks:
            # Verify link to previous block
            if block.previous_hash != previous_hash:
                return False
            
            # Verify block's hash
            calculated_hash = block.calculate_hash()
            if block.current_hash != calculated_hash:
                return False
            
            previous_hash = block.current_hash
        
        return True

    class Meta:
        ordering = ['timestamp'] # Ensure order for chaining

    def calculate_hash(self):
        """Calculates the SHA-256 hash for the current block."""
        block_data = {
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'user_id': str(self.user.id) if self.user else None,
            'action': self.action,
            'details': json.dumps(self.details, sort_keys=True),
            'previous_hash': self.previous_hash
        }
        # Create a consistent string representation
        block_string = json.dumps(block_data, sort_keys=True).encode('utf-8')
        return hashlib.sha256(block_string).hexdigest()

    def save(self, *args, **kwargs):
        """Overrides save to calculate hash before saving."""
        if not self.current_hash: # Only calculate if not already set (e.g., during initial creation)
             # Ensure previous_hash is set correctly before calculating current_hash
             # This is handled by the add_log_entry function below
             self.current_hash = self.calculate_hash()
        super().save(*args, **kwargs) # Call the "real" save() method.

    def __str__(self):
        user_str = self.user.username if self.user else "System"
        return f"{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')} - {user_str} - {self.action}"

# --- Helper function to add log entries ---
# Replace add_log_entry function in models.py
@transaction.atomic
def add_log_entry(user, action, details):
    """
    Creates a new log entry, linking it to the previous one.
    Returns the created block or None if an error occurred.
    """
    try:
        # Get lock on the last block to prevent race conditions
        last_block = LogBlock.objects.select_for_update().order_by('-timestamp').first()
        previous_hash = last_block.current_hash if last_block else '0'

        new_block = LogBlock(
            user=user,
            action=action,
            details=details,
            previous_hash=previous_hash
        )
        # Calculate hash before saving
        new_block.current_hash = new_block.calculate_hash()
        new_block.save()
        return new_block
    except Exception as e:
        # Log the error
        print(f"Error creating log entry: {e}")
        return None
    
class VerificationRequest(models.Model):
    class VerificationType(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        PHONE = 'PHONE', 'Phone'

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_requests')
    verification_type = models.CharField(max_length=10, choices=VerificationType.choices)
    status = models.CharField(max_length=10, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_verifications')
    admin_notes = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('user', 'verification_type', 'status') # Prevent multiple pending requests of same type? Or allow history? Let's allow history for now. Remove unique_together if history is desired.
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_verification_type_display()} - {self.get_status_display()}"
