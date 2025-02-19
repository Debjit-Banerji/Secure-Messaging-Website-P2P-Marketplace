# api/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the connection
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        """
        Receive a message from the WebSocket, then echo it back.
        """
        if text_data:
            data = json.loads(text_data)
            message = data.get("message", "")
            # For example, echo back the received message
            await self.send(text_data=json.dumps({"message": message}))

    async def disconnect(self, close_code):
        # Handle disconnection if needed
        pass
