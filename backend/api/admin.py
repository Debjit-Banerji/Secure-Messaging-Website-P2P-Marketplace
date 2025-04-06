from django.contrib import admin
from .models import (
    User, Group, GroupMembership, ChatMessage, 
    OTP, Product, Purchase, GroupMessage, LogAction, LogBlock
)

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
