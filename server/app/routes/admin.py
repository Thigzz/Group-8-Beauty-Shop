from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from server.app.extensions import db
from server.app.models.users import User
from server.app.decorators import admin_required
# --- ADDED IMPORTS ---
from server.app.models.orders import Order
from server.app.models.order_items import OrderItem
from server.app.models.enums import OrderStatus
from sqlalchemy.orm import joinedload

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

#---------Get all users --------------------
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required()
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

# --------Get single user------------------
@admin_bp.route("/users/<uuid:user_id>", methods=["GET"])
@jwt_required()
@admin_required()
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.to_dict()), 200


#----- Activate user------------
@admin_bp.route("/users/<uuid:user_id>/activate", methods=["PATCH"])
@jwt_required()
@admin_required()
def activate_user(user_id):
    user = db.session.get(User, user_id)
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
    user = db.session.get(User, user_id)
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

# -------- Update user -----------------
@admin_bp.route("/users/<uuid:user_id>", methods=["PUT"])
@jwt_required()
@admin_required()
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    user.primary_phone_no = data.get('primary_phone_no', user.primary_phone_no)
    user.secondary_phone_no = data.get('secondary_phone_no', user.secondary_phone_no)
    
    db.session.commit()
    return jsonify(user.to_dict()), 200

# -------- Get single order for Admin ---
@admin_bp.route("/orders/<uuid:order_id>", methods=["GET"])
@jwt_required()
@admin_required()
def get_admin_order_details(order_id):
    order = (
        db.session.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.customer)
        )
        .filter(Order.id == order_id)
        .first_or_404(description="Order not found")
    )
    return jsonify(order.to_dict(include_items=True, include_customer=True))


# -------- Update Order Status for Admin ---
@admin_bp.route("/orders/<uuid:order_id>/status", methods=["PUT"])
@jwt_required()
@admin_required()
def update_admin_order_status(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    new_status_str = data.get("status")

    if not new_status_str:
        return jsonify({"error": "Status is required"}), 400

    try:
        new_status = OrderStatus[new_status_str.lower()]
    except KeyError:
        return jsonify({"error": f"Invalid status '{new_status_str}'"}), 400

    order.status = new_status
    db.session.commit()
    
    return jsonify(order.to_dict(include_items=True, include_customer=True))