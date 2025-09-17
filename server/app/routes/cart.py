from flask import Blueprint, request, jsonify
from uuid import UUID
from app.extensions import db
from app.models.carts import Cart, CartItem
from app.models.enums import CartStatus

cart_bp = Blueprint("cart", __name__, url_prefix="/api/carts")

# ------------------ CART CRUD ------------------
# Create cart (guest or user)
@cart_bp.route("/", methods=["POST"])
def create_cart():
    data = request.json
    user_id = data.get("user_id")
    session_id = data.get("session_id")
    if not user_id and not session_id:
        return jsonify({"error": "user_id or session_id required"}), 400

    cart = Cart(user_id=UUID(user_id) if user_id else None, session_id=session_id)
    db.session.add(cart)
    db.session.commit()
    return jsonify({"id": str(cart.id), "user_id": str(cart.user_id) if cart.user_id else None, 
                    "session_id": cart.session_id, "status": cart.status.name}), 201

# Get cart by user_id or session_id
@cart_bp.route("/", methods=["GET"])
def get_cart():
    user_id = request.args.get("user_id")
    session_id = request.args.get("session_id")
    if user_id:
        cart = Cart.query.filter_by(user_id=user_id, status=CartStatus.open).first()
    elif session_id:
        cart = Cart.query.filter_by(session_id=session_id, status=CartStatus.open).first()
    else:
        return jsonify({"error": "user_id or session_id required"}), 400

    if not cart:
        return jsonify({"error": "Cart not found"}), 404

    return jsonify({
        "id": str(cart.id),
        "user_id": str(cart.user_id) if cart.user_id else None,
        "session_id": cart.session_id,
        "status": cart.status.name,
        "items": [{"product_id": str(item.product_id), "quantity": item.quantity} for item in cart.items]
    }), 200

# Update cart status
@cart_bp.route("/<uuid:cart_id>", methods=["PUT"])
def update_cart(cart_id):
    cart = Cart.query.get_or_404(cart_id)
    status = request.json.get("status")
    if status not in CartStatus.__members__:
        return jsonify({"error": "Invalid status"}), 400
    cart.status = CartStatus[status]
    db.session.commit()
    return jsonify({"id": str(cart.id), "status": cart.status.name}), 200

# Delete cart
@cart_bp.route("/<uuid:cart_id>", methods=["DELETE"])
def delete_cart(cart_id):
    cart = Cart.query.get_or_404(cart_id)
    db.session.delete(cart)
    db.session.commit()
    return jsonify({"message": "Cart deleted"}), 200

# ------------------ CART ITEM CRUD ------------------

# Add item to cart
@cart_bp.route("/items", methods=["POST"])
def add_item():
    data = request.json
    cart_id = data.get("cart_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)
    if not cart_id or not product_id:
        return jsonify({"error": "cart_id and product_id are required"}), 400

    cart_item = CartItem(cart_id=UUID(cart_id), product_id=UUID(product_id), quantity=quantity)
    db.session.add(cart_item)
    db.session.commit()
    return jsonify({"cart_id": str(cart_item.cart_id), "product_id": str(cart_item.product_id), "quantity": cart_item.quantity}), 201

# Update item quantity
@cart_bp.route("/items/<uuid:item_id>", methods=["PUT"])
def update_item(item_id):
    item = CartItem.query.get_or_404(item_id)
    quantity = request.json.get("quantity")
    if not quantity or quantity < 1:
        return jsonify({"error": "quantity must be >= 1"}), 400
    item.quantity = quantity
    db.session.commit()
    return jsonify({"cart_id": str(item.cart_id), "product_id": str(item.product_id), "quantity": item.quantity}), 200

# Delete item
@cart_bp.route("/items/<uuid:item_id>", methods=["DELETE"])
def delete_item(item_id):
    item = CartItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200
