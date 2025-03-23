#!/bin/bash

# Create directory for SSL certificates
mkdir -p /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/private.key \
  -out /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/certificate.crt \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Set proper permissions - making them readable by the current user
chmod 644 /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/private.key
chmod 644 /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/certificate.crt

# Make sure the current user owns the files
USER=$(whoami)
chown $USER:$USER /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/private.key
chown $USER:$USER /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/certificate.crt

echo "Self-signed certificates created in /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/"
echo "Key permissions updated to be readable by the current user"
