"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from backend.routing import application as channels_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Combine Django ASGI application with Channels routing
django_app = get_asgi_application()

application = channels_application  # or use a ProtocolTypeRouter to combine

