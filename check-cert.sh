#!/bin/bash

# Check if certificate files exist
if [ -f "/home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/certificate.crt" ] && [ -f "/home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/private.key" ]; then
  echo "Certificate files exist."
  # Verify certificate content
  openssl x509 -in /home/iiitd/Secure-Messaging-Website-P2P-Marketplace/ssl/certificate.crt -text -noout | grep -E "Subject:|Issuer:|Validity"
else
  echo "Certificate files are missing. Please run generate-ssl-cert.sh again."
fi
