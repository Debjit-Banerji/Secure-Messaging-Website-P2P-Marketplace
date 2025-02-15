# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    bio = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    # Many-to-many for friend relationships.
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)

    def __str__(self):
        return self.name if self.name else self.username

class Group(models.Model):
    name = models.CharField(max_length=100)
    # Use a different related_name to avoid clashing with the built-in User.groups
    members = models.ManyToManyField(User, related_name='custom_groups', blank=True)

    def __str__(self):
        return self.name

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, related_name="sent_messages", on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name="received_messages", on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} -> {self.receiver}: {self.message[:30]}"
