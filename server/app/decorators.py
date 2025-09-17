from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            current_user = get_jwt_identity()
            if current_user and current_user.get('role') == 'admin':
                return fn(*args, **kwargs)
            else:
                return jsonify({"message": "Admins only!"}), 403
        return decorator
    return wrapper