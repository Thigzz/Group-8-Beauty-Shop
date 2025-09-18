from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get("role") == 'admin':
                return fn(*args, **kwargs)
            else:
                return jsonify({"message": "Admins only!"}), 403
        return decorator
    return wrapper