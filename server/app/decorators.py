from functools import wraps
from flask import jsonify
from flask_jwt_extended import current_user

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            if current_user and current_user.role.name == 'admin':
                return fn(*args, **kwargs)
            else:
                return jsonify({"message": "Admins only!"}), 403
        return decorator
    return wrapper