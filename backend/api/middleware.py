from django.http import HttpResponse
from .models import LogBlock

class BlockchainIntegrityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Periodically check chain integrity (e.g., 1% of requests)
        import random
        if random.random() < 0.01:  # 1% chance
            is_valid = LogBlock.verify_chain_integrity()
            if not is_valid:
                # Log the integrity failure to a separate system
                # This could be a file, database table, or external service
                print("CRITICAL ERROR: Blockchain integrity check failed!")
                # You might want to notify administrators
                
        return response