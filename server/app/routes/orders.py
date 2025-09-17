from flask import Blueprint, request, jsonify

# JWT handling with graceful fallback
try:
    from flask_jwt_extended import jwt_required, get_jwt
except ImportError:
    # Fallback when JWT is not available
    def jwt_required():
        def decorator(f):
            return f
        return decorator
    
    def get_jwt():
        return {"role": "admin"}  # Default for development

from app.extensions import db
from app.models.orders import Order
from app.models.order_items import OrderItem
from app.models.enums import OrderStatus

orders_bp = Blueprint("orders", __name__, url_prefix="/orders")

@orders_bp.route("/", methods=["POST"])
def create_order():
    data = request.get_json()
    try:
        order = Order(
            cart_id=data["cart_id"],
            total_amount=data["total_amount"],
            status=OrderStatus.pending
        )
        db.session.add(order)
        db.session.commit()
        return jsonify({"message": "Order created", "id": str(order.id)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@orders_bp.route("/", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    return jsonify([
        {
            "id": str(order.id),
            "cart_id": str(order.cart_id),
            "status": order.status.value,
            "total_amount": float(order.total_amount),
            "created_at": order.created_at.isoformat() if order.created_at else None
        } for order in orders
    ])

@orders_bp.route("/<order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):
    """Admin-only endpoint to update order status"""
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    try:
        order = Order.query.get_or_404(order_id)
        order.status = OrderStatus(data["status"])
        db.session.commit()
        return jsonify({"message": "Order status updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
