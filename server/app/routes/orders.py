from flask import Blueprint, request, jsonify
from server.app.models.orders import Order, OrderStatus
from server.app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt

orders_bp = Blueprint("orders", __name__, url_prefix="/orders")


# ------order fulfillment-------
@orders_bp.route("/<order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):
    """
    Admin-only endpoint to update the status of an order.
    Expects JSON: { "status": "fulfilled" } 
    """
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin privileges required"}), 403

    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()
    new_status = data.get("status")

    if new_status not in [status.value for status in OrderStatus]:
        return jsonify({"error": f"Invalid status '{new_status}'"}), 400

    order.status = OrderStatus(new_status)
    db.session.commit()

    return jsonify({
        "message": "Order status updated",
        "order_id": str(order.id),
        "status": order.status.value
    })
