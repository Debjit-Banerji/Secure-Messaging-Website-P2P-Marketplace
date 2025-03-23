#!/bin/bash

# Make sure certificates exist
if [ ! -f "./ssl/certificate.crt" ] || [ ! -f "./ssl/private.key" ]; then
  echo "SSL certificates not found. Generating them now..."
  ./generate-ssl-cert.sh
else
  # Update permissions on existing files
  echo "Updating permissions on existing SSL files..."
  chmod 644 ./ssl/private.key
  chmod 644 ./ssl/certificate.crt
  # Make sure the current user owns the files
  USER=$(whoami)
  chown $USER:$USER ./ssl/private.key
  chown $USER:$USER ./ssl/certificate.crt
fi

# Create symbolic links if needed
cd frontend
if [ ! -d "./ssl" ]; then
  echo "Creating symbolic link to SSL certificates for frontend..."
  ln -s ../ssl ./ssl
fi

# Create or update .env file
echo "HTTPS=true" > .env
echo "SSL_CRT_FILE=../ssl/certificate.crt" >> .env
echo "SSL_KEY_FILE=../ssl/private.key" >> .env

echo "Frontend HTTPS setup complete. Run 'npm start' in the frontend directory to start with HTTPS."
cd ..
