#!/bin/bash

echo "Testing HTTPS connectivity to localhost..."
echo "Using OpenSSL to connect to localhost:443..."

# Test SSL connection
openssl s_client -connect localhost:443 -servername localhost

echo ""
echo "Testing Nginx configuration..."
sudo nginx -t

echo ""
echo "Checking Nginx status..."
sudo systemctl status nginx
