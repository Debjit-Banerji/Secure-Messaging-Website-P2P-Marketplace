from django.urls import path
from .views import sample_api
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import register_user

urlpatterns = [
    # path('hello/', sample_api),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register_user, name='register'),

]
