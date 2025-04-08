from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings # Import settings
# Use the names defined earlier or directly here
ACCESS_TOKEN_COOKIE_NAME = 'access_token'

class JWTCookieAuthentication(JWTAuthentication):
    """
    An authentication plugin that authenticates requests through a JSON web
    token provided in a request cookie (instead of an Authorization header).
    """
    def authenticate(self, request):
        # Get token from cookie
        raw_token = request.COOKIES.get(ACCESS_TOKEN_COOKIE_NAME)
        if raw_token is None:
            return None # No token found in cookie

        try:
            # Attempt to validate the token from the cookie
            validated_token = self.get_validated_token(raw_token)
            # Get user associated with the token
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception as e:
            # Handle potential exceptions like TokenError, InvalidToken, AuthenticationFailed
            # Log the failed authentication attempt if needed
            # print(f"Cookie Authentication Failed: {e}")
            return None # Authentication failed