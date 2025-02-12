from django.http import JsonResponse
import base64
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User, Chat, db

@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data["username"]
        password = data["password"]
        email = data.get("email")
        phone = data.get("phone")
        User(username, password, email=email, phone=phone)
        return JsonResponse({"message": "User registered successfully."})

@csrf_exempt
def send_message(request):
    if request.method == "POST":
        data = json.loads(request.body)
        chat_id = data["chat_id"]
        sender_id = data["sender_id"]
        content = data["message"]

        chat = db.chats.find_one({"_id": chat_id})
        if not chat:
            return JsonResponse({"error": "Chat not found."}, status=404)

        chat_obj = Chat(chat["sender_id"], chat["recipient_id"])
        chat_obj.aes_key = base64.b64decode(chat["aes_key"])
        chat_obj.add_message(sender_id, content)

        return JsonResponse({"message": "Message sent successfully."})

@csrf_exempt
def get_messages(request, chat_id):
    chat = db.chats.find_one({"_id": chat_id})
    if not chat:
        return JsonResponse({"error": "Chat not found."}, status=404)

    messages = chat["messages"]
    return JsonResponse({"messages": messages})
