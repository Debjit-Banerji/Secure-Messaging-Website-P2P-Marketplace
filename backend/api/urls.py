from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register, name="register"),
    path("send_message/", views.send_message, name="send_message"),
    path("get_messages/<str:chat_id>/", views.get_messages, name="get_messages"),
]