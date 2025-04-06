from django.contrib import admin
from django.utils import timezone
from django.contrib import messages # Import messages framework
from .models import ( # Add VerificationRequest
    User, Group, ChatMessage, OTP, Product, Purchase,
    GroupMembership, GroupMessage, LogBlock, VerificationRequest
)
from .models import add_log_entry, LogAction

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'name', 'phone', 'created_at')
    search_fields = ('username', 'email', 'name', 'phone')
    filter_horizontal = ('friends',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'created_at')
    search_fields = ('name', 'admin__username')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'group', 'added_at')
    list_filter = ('group',)
    search_fields = ('user__username', 'group__name')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'type', 'timestamp')
    list_filter = ('type', 'timestamp')
    search_fields = ('sender__username', 'receiver__username')
    readonly_fields = ('timestamp',)

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'created_at', 'expires_at', 'is_valid')
    readonly_fields = ('created_at', 'expires_at')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'price', 'sold', 'created_at')
    list_filter = ('sold', 'created_at')
    search_fields = ('name', 'description', 'user__username')
    readonly_fields = ('created_at',)

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('product', 'buyer', 'purchase_price', 'purchased_at')
    list_filter = ('purchased_at',)
    search_fields = ('product__name', 'buyer__username')
    readonly_fields = ('purchased_at',)

@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ('group', 'sender', 'type', 'timestamp')
    list_filter = ('group', 'type', 'timestamp')
    search_fields = ('group__name', 'sender__username')
    readonly_fields = ('timestamp',)

@admin.register(LogBlock)
class LogBlockAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'action', 'current_hash', 'previous_hash')
    list_filter = ('action', 'timestamp', 'user')
    search_fields = ('user__username', 'action', 'details__icontains', 'current_hash', 'previous_hash') # Search JSON details
    readonly_fields = ('timestamp', 'user', 'action', 'details', 'previous_hash', 'current_hash') # Make fields read-only in admin
    ordering = ('-timestamp',) # Show newest first

    def has_add_permission(self, request):
        return False # Prevent manual creation via admin

    def has_change_permission(self, request, obj=None):
        return False # Prevent editing via admin

    def has_delete_permission(self, request, obj=None):
        return False # Prevent deletion via admin
    
    actions = ['verify_chain_integrity']
    def verify_chain_integrity(self, request, queryset):
        is_valid = LogBlock.verify_chain_integrity()
        if is_valid:
            self.message_user(request, "Blockchain integrity verified successfully.")
        else:
            self.message_user(request, "Blockchain integrity check FAILED! Possible tampering detected.", level='ERROR')
    
    verify_chain_integrity.short_description = "Verify blockchain integrity"

# --- Verification Request Admin ---
@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'verification_type', 'status', 'requested_at', 'reviewed_at', 'reviewed_by')
    list_filter = ('status', 'verification_type', 'requested_at')
    search_fields = ('user__username', 'user__email', 'user__phone')
    readonly_fields = ('user', 'verification_type', 'requested_at', 'reviewed_at', 'reviewed_by')
    list_per_page = 25
    ordering = ('-requested_at',)

    fieldsets = (
        (None, {'fields': ('user', 'verification_type', 'status', 'requested_at')}),
        ('Review Details', {'fields': ('reviewed_at', 'reviewed_by', 'admin_notes')}),
    )

    actions = ['approve_requests', 'reject_requests']

    def approve_requests(self, request, queryset):
        """Admin action to approve selected verification requests."""
        updated_count = 0
        for req in queryset.filter(status=VerificationRequest.VerificationStatus.PENDING):
            req.status = VerificationRequest.VerificationStatus.APPROVED
            req.reviewed_at = timezone.now()
            req.reviewed_by = request.user # The admin performing the action
            req.save()

            # Update the corresponding User field
            if req.verification_type == VerificationRequest.VerificationType.EMAIL:
                req.user.email_verified = True
            elif req.verification_type == VerificationRequest.VerificationType.PHONE:
                req.user.phone_verified = True
            req.user.save(update_fields=['email_verified', 'phone_verified']) # Only update specific fields

            # Log the approval
            add_log_entry(request.user, LogAction.VERIFICATION_APPROVED, {
                'request_id': req.id,
                'approved_user_id': req.user.id,
                'type': req.verification_type
            })
            updated_count += 1

        if updated_count > 0:
            self.message_user(request, f'{updated_count} verification request(s) successfully approved.', messages.SUCCESS)
        else:
             self.message_user(request, 'No pending requests were selected or updated.', messages.WARNING)

    approve_requests.short_description = "Approve selected PENDING requests"

    def reject_requests(self, request, queryset):
        """Admin action to reject selected verification requests."""
        updated_count = 0
        for req in queryset.filter(status=VerificationRequest.VerificationStatus.PENDING):
            req.status = VerificationRequest.VerificationStatus.REJECTED
            req.reviewed_at = timezone.now()
            req.reviewed_by = request.user
            # Optionally capture rejection reason from admin notes if needed in future
            req.save()

            # Log the rejection
            add_log_entry(request.user, LogAction.VERIFICATION_REJECTED, {
                'request_id': req.id,
                'rejected_user_id': req.user.id,
                'type': req.verification_type
            })
            updated_count += 1

        if updated_count > 0:
            self.message_user(request, f'{updated_count} verification request(s) successfully rejected.', messages.SUCCESS)
        else:
            self.message_user(request, 'No pending requests were selected or updated.', messages.WARNING)

    reject_requests.short_description = "Reject selected PENDING requests"

    # Prevent direct editing of status via admin form once reviewed
    def get_readonly_fields(self, request, obj=None):
        readonly = list(super().get_readonly_fields(request, obj))
        if obj and obj.status != VerificationRequest.VerificationStatus.PENDING:
            readonly.extend(['status', 'admin_notes'])
        return readonly

    # Prevent adding requests manually via admin
    def has_add_permission(self, request):
        return False

    # Prevent deletion of requests via admin (maintain history)
    def has_delete_permission(self, request, obj=None):
        # Allow deletion only if needed for cleanup, otherwise return False
        return super().has_delete_permission(request, obj) # Or return False


from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Unregister the default User admin if it's already registered
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'name', 'phone', 'created_at', 'email_verified', 'phone_verified')
    search_fields = ('username', 'email', 'name', 'phone')
    filter_horizontal = ('friends',)
    readonly_fields = ('created_at', 'updated_at')
    list_filter = ('email_verified', 'phone_verified')
    
    # --- Override deletion methods to add logging ---
    def delete_model(self, request, obj):
        """Log deletion when deleting a single user from the change form."""
        user_id = obj.id
        username = obj.username
        add_log_entry(request.user, LogAction.USER_DELETED_BY_ADMIN, {
            'deleted_user_id': user_id,
            'deleted_username': username,
            'admin_user_id': request.user.id,
            'admin_username': request.user.username
        })
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        """Log deletion when deleting users from the admin list view action."""
        for obj in queryset:
            user_id = obj.id
            username = obj.username
            add_log_entry(request.user, LogAction.USER_DELETED_BY_ADMIN, {
                'deleted_user_id': user_id,
                'deleted_username': username,
                'admin_user_id': request.user.id,
                'admin_username': request.user.username
            })
        super().delete_queryset(request, queryset)

