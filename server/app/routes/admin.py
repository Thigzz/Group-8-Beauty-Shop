from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from server.app.extensions import db
from server.app.models.users import User
from server.app.decorators import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

#---------Get all users --------------------
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required()
def get_users():
    users = User.query.all()
    return jsonify([
        {"id": str(user.id), "email": user.email, "is_active": user.is_active}
        for user in users
    ]), 200

# --------Get single user------------------
@admin_bp.route("/users/<uuid:user_id>", methods=["GET"])
@jwt_required()
@admin_required()
def get_user(user_id):
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
@admin_required()
def activate_user(user_id):
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
@admin_required()
def deactivate_user(user_id):
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