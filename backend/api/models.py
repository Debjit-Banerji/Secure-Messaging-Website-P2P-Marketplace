import os
import base64
import hashlib
import rsa
from Crypto.Cipher import AES
from Crypto.PublicKey import DSA
from Crypto.Random import get_random_bytes
from Crypto.Util.number import getPrime, bytes_to_long, long_to_bytes
from pymongo import MongoClient

# MongoDB setup
client = MongoClient("mongodb://localhost:3000/")
db = client.fcs_project

def hash_password(password):
    """Hashes the password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def pad(data):
    """Pads data to make it a multiple of 16 bytes (AES block size)."""
    return data + (16 - len(data) % 16) * " "

def encrypt_aes(data, key):
    """Encrypts data using AES-256 (ECB)."""
    cipher = AES.new(key, AES.MODE_ECB)
    padded_data = pad(data)
    return base64.b64encode(cipher.encrypt(padded_data.encode())).decode()

def decrypt_aes(encrypted_data, key):
    """Decrypts AES-256 (ECB) encrypted data."""
    cipher = AES.new(key, AES.MODE_ECB)
    decrypted_data = cipher.decrypt(base64.b64decode(encrypted_data)).decode().strip()
    return decrypted_data

class User:
    """User model stored in MongoDB with encrypted fields."""

    def __init__(self, username, password, profile_pic=None, email=None, phone=None):

        # Generate RSA key pair
        (self.public_key, private_key) = rsa.newkeys(2048)
        self.public_key_str = self.public_key.save_pkcs1().decode()

        # Generate AES key for encrypting personal data
        aes_key = os.urandom(32)
        encrypted_aes_key = rsa.encrypt(aes_key, self.public_key)

        # Encrypt user data using AES
        self.username = encrypt_aes(username, aes_key)
        self.password = hash_password(password)
        self.profile_pic = encrypt_aes(profile_pic, aes_key) if profile_pic else None
        self.email = encrypt_aes(email, aes_key) if email else None
        self.phone = encrypt_aes(phone, aes_key) if phone else None

        # Save to MongoDB
        self.user_id = db.users.insert_one({
            "username": self.username,
            "password": self.password,  # Store hashed password
            "profile_pic": self.profile_pic,
            "email": self.email,
            "phone": self.phone,
            "public_key": self.public_key_str,
            "encrypted_aes_key": base64.b64encode(encrypted_aes_key).decode()  # Store encrypted AES key
        }).inserted_id

def generate_dh_keypair():
    """Generates a Diffie-Hellman key pair."""
    prime = getPrime(2048)
    base = 2
    private_key = bytes_to_long(get_random_bytes(32)) % prime  # Private key
    public_key = pow(base, private_key, prime)  # Public key
    return prime, base, private_key, public_key

def derive_shared_key(their_public, my_private, prime):
    """Derives shared AES key using Diffie-Hellman."""
    shared_secret = pow(their_public, my_private, prime)
    return hashlib.sha256(long_to_bytes(shared_secret)).digest()  # AES-256 key

class Chat:
    """Chat model stored in MongoDB with end-to-end encryption."""

    def __init__(self, sender_id, recipient_id):
        self.sender_id = sender_id
        self.recipient_id = recipient_id

        # Fetch recipient's public key
        recipient = db.users.find_one({"_id": recipient_id})
        recipient_public_key = rsa.PublicKey.load_pkcs1(recipient["public_key"].encode())

        # Generate Diffie-Hellman key pair
        prime, base, self.private_key, self.public_key = generate_dh_keypair()

        # Encrypt sender and recipient IDs using AES (key derived via DH)
        self.encrypted_sender_id = None
        self.encrypted_recipient_id = None
        self.encrypted_aes_key = None
        self.aes_key = None  # Will be derived when the recipient joins

        # Save initial chat to MongoDB
        self.chat_id = db.chats.insert_one({
            "sender_id": self.encrypted_sender_id,
            "recipient_id": self.encrypted_recipient_id,
            "public_key": self.public_key,  # Sender's DH public key
            "aes_key": self.encrypted_aes_key,  # Encrypted symmetric key
            "messages": []
        }).inserted_id

    def establish_shared_key(self, recipient_public_key):
        """Establish shared AES key using Diffie-Hellman."""
        self.aes_key = derive_shared_key(recipient_public_key, self.private_key, prime)

        # Encrypt IDs using AES
        self.encrypted_sender_id = encrypt_aes(str(self.sender_id), self.aes_key)
        self.encrypted_recipient_id = encrypt_aes(str(self.recipient_id), self.aes_key)

        # Encrypt the symmetric key using itself (self-encryption to prevent tampering)
        self.encrypted_aes_key = encrypt_aes(base64.b64encode(self.aes_key).decode(), self.aes_key)

        # Update chat in MongoDB
        db.chats.update_one({"_id": self.chat_id}, {
            "$set": {
                "sender_id": self.encrypted_sender_id,
                "recipient_id": self.encrypted_recipient_id,
                "aes_key": self.encrypted_aes_key
            }
        })

    def add_message(self, sender_id, content):
        """Encrypts and stores a message."""
        encrypted_msg = encrypt_aes(content, self.aes_key)
        db.chats.update_one(
            {"_id": self.chat_id},
            {"$push": {"messages": encrypted_msg}}
        )
