# At the top, add proper handling
try:
    from flask_jwt_extended import jwt_required, get_jwt
    JWT_AVAILABLE = True
except ImportError:
    JWT_AVAILABLE = False
    # Create dummy decorators for when JWT is not available
    def jwt_required():
        def decorator(f):
            return f
        return decorator
    
    def get_jwt():
        return {"role": "admin"}  # Default for testing
