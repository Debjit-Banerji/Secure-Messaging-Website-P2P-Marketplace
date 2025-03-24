from django.contrib import admin
from .models import (
    User, Group, GroupMembership, ChatMessage, 
    OTP, Product, Purchase, GroupMessage
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
