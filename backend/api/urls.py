from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView, register_user, search_users, update_profile, search_friends_groups, get_chats, send_chat, sample_api, add_contact, list_contacts, remove_contact, profile_view, send_otp_email, verify_otp, products, buy_product

urlpatterns = [
    path('hello/', sample_api, name='hello'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name='register'),
    path('search-users/', search_users, name='search-users'),
    path('update-profile/', update_profile, name='update-profile'),
    path('search-friends-groups/', search_friends_groups, name='search-friends-groups'),
    path('chats/<int:user_id>/', get_chats, name='get-chats'),
    path('send-chat/', send_chat, name='send-chat'),
    path('contacts/add/', add_contact, name='add-contact'),
    path('contacts/', list_contacts, name='list-contacts'),
    path('contacts/remove/', remove_contact, name='remove-contact'),
    path('profile/', profile_view, name='profile'),
    path('send-otp/', send_otp_email, name="send-otp"),
    path('verify-otp/', verify_otp, name="verify-otp"),
    path('products/', products, name="products"),
    path('buy/<int:product_id>/', buy_product, name="buy-product"),
]
