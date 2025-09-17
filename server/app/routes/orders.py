from flask import Blueprint, request, jsonify
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
        return jsonify({"message": "Order created successfully", "order_id": str(order.id)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@orders_bp.route("/", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        "id": str(o.id),
        "cart_id": str(o.cart_id),
        "status": o.status.value,
        "total_amount": float(o.total_amount)
    } for o in orders])


@orders_bp.route("/<uuid:order_id>", methods=["GET"])
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({
        "id": str(order.id),
        "cart_id": str(order.cart_id),
        "status": order.status.value,
        "total_amount": float(order.total_amount)
    })


@orders_bp.route("/<uuid:order_id>", methods=["PATCH"])
def update_order(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    if "status" in data:
        order.status = OrderStatus[data["status"]]
    db.session.commit()
    return jsonify({"message": "Order updated"})


@orders_bp.route("/<uuid:order_id>", methods=["DELETE"])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Order deleted"})

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

