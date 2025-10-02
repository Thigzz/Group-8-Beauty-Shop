from flask import Blueprint, request, jsonify
from server.app.extensions import db
from server.app.models.orders import Order
from server.app.models.order_items import OrderItem
from server.app.models.enums import OrderStatus
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.app.models.users import User
from server.app.models.carts import Cart
from sqlalchemy.orm import joinedload
from sqlalchemy import or_, cast, String

# Allowed transitions
VALID_STATUS_TRANSITIONS = {
    OrderStatus.pending: [OrderStatus.paid, OrderStatus.cancelled],
    OrderStatus.paid: [OrderStatus.dispatched],
    OrderStatus.dispatched: [OrderStatus.delivered],
    OrderStatus.delivered: [],
    OrderStatus.cancelled: []
}


orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


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
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    sort = request.args.get("sort", "desc")
    search = request.args.get("search", "").strip() 
    status = request.args.get("status", "all", type=str).lower()
    date_filter = request.args.get("date", "", type=str)  

    query = db.session.query(Order).options(
            joinedload(Order.cart).joinedload(Cart.user),
            joinedload(Order.items).joinedload(OrderItem.product)
        ) 
    if status and status != "all":
        query = query.filter(Order.status == status)

    if search:
            query = query.join(Cart).join(User).filter(
                or_(
                    User.username.ilike(f"%{search}%"),
                    cast(Order.status, String).ilike(f"%{search}%"),
                    cast(Order.id,String).ilike(f"%{search}%"),
                    cast(Order.cart_id, String).ilike(f"%{search}%"),
                    User.first_name.ilike(f"%{search}%"),
                    User.last_name.ilike(f"%{search}%"),
                    User.primary_phone_no.ilike(f"%{search}%"),
                )
            )

    if date_filter:
        try:
            from datetime import datetime
            date_obj = datetime.strptime(date_filter, "%Y-%m-%d").date()
            query = query.filter(db.func.date(Order.created_at) == date_obj)
        except ValueError:
            pass  # ignore invalid date format
        
    if sort == "asc": 
        query = query.order_by(Order.created_at.asc()) 
    else:
        query = query.order_by(Order.created_at.desc())
        
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    orders = [order.to_dict(include_items=True) for order in pagination.items]

    return jsonify({
        "orders": orders,
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": pagination.per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev
    })


@orders_bp.route("/<uuid:order_id>", methods=["GET"])
def get_order(order_id):
    order = (
        db.session.query(Order)
        .options(
            joinedload(Order.cart).joinedload(Cart.user),
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .filter(Order.id == order_id)
        .first_or_404()
    )

    return jsonify(order.to_dict(include_items=True))


@orders_bp.route("/<uuid:order_id>", methods=["PATCH"])
def update_order(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    if "status" in data:
        try:
            new_status = OrderStatus[data["status"]]
        except KeyError:
            return jsonify({"error": f"Invalid status: {data['status']}"}), 400

        allowed_next = VALID_STATUS_TRANSITIONS.get(order.status, [])
        if new_status not in allowed_next:
            return jsonify({
                "error": f"Invalid transition {order.status.name} → {new_status.name}",
                "allowed": [s.name for s in allowed_next]
            }), 400
        
        order.status = new_status
    db.session.commit()

    return jsonify(order.to_dict(include_items=True))


@orders_bp.route("/<uuid:order_id>", methods=["DELETE"])
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Order deleted"})


# ------order history-------
@orders_bp.route("/history", methods=["GET"])
@jwt_required()
def get_user_order_history():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first_or_404()

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    pagination = (
        Order.query.join(Cart)
        .filter(Cart.user_id == user.id)
        .order_by(Order.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    orders = [
        {
            "id": str(o.id),
            "status": o.status.value,
            "total_amount": float(o.total_amount),
            "created_at": o.created_at.isoformat() if o.created_at else None
        }
        for o in pagination.items
    ]

    return jsonify({
        "orders": orders,
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": pagination.per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev
    })