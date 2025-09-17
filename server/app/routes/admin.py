from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.users import User

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def is_admin():
    identity = get_jwt_identity()  
    return identity.get("role") == "admin"

#---------Get all users --------------------
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403
    
    users = User.query.all()
    return jsonify([
        {"id": str(user.id), "email": user.email, "is_active": user.is_active}
        for user in users
    ]), 200

# --------Get single user------------------
@admin_bp.route("/users/<uuid:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": str(user.id),
        "email": user.email,
        "is_active": user.is_active
    }), 200


#----- Activate user------------
@admin_bp.route("/users/<uuid:user_id>/activate", methods=["PATCH"])
@jwt_required()
def activate_user(user_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.is_active:
        return jsonify({"message": "User is already active"}), 200
    
    user.is_active = True
    db.session.commit()
    
    return jsonify({
        "message": "User activated successfully",
        "user_id": str(user.id),
        "is_active": user.is_active
    }), 200

# -------- Deactivate user -----------------
@admin_bp.route("/users/<uuid:user_id>/deactivate", methods=["PATCH"])
@jwt_required()
def deactivate_user(user_id):
    if not is_admin():
        return jsonify({"error": "Admin access required"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if not user.is_active:
        return jsonify({"message": "User is already deactivated"}), 200
    
    user.is_active = False
    db.session.commit()
    
    return jsonify({
        "message": "User deactivated successfully",
        "user_id": str(user.id),
        "is_active": user.is_active
    }), 200
