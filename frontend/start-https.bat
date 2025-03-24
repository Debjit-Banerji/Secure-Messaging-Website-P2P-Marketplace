@echo off
set HTTPS=true
set SSL_CRT_FILE=../ssl/certificate.crt
set SSL_KEY_FILE=../ssl/private.key
npm run react-scripts start
