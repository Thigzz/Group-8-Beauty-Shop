from flask import Blueprint, request, jsonify
from uuid import UUID
from server.app.extensions import db
from server.app.models.carts import Cart
from server.app.models.cart_items import CartItem
from server.app.models.product import Product
from server.app.models.enums import CartStatus

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
                    "session_id": cart.session_id, "status": cart.status.name,  "grand_total": 0.0, "items": []}), 201

# Get or create cart by user_id or session_id
@cart_bp.route("/", methods=["GET"])
def get_cart():
    user_id_str = request.args.get("user_id")
    session_id = request.args.get("session_id")
    cart = None

    if user_id_str:
        cart = Cart.query.filter_by(user_id=user_id_str, status=CartStatus.open).first()
    elif session_id:
        cart = Cart.query.filter_by(session_id=session_id, status=CartStatus.open).first()
    else:
        return jsonify({"error": "user_id or session_id required"}), 400

    # If no open cart is found, create one
    if not cart:
        if user_id_str:
            cart = Cart(user_id=UUID(user_id_str))
        elif session_id:
            cart = Cart(session_id=session_id)
        
        db.session.add(cart)
        db.session.commit()
    
    items_data = [
        {
            "id": str(item.id),
            "product": {
                "id": str(item.product.id),
                "product_name": item.product.product_name,
                "price": float(item.product.price),
                "image_url": item.product.image_url
            },
            "quantity": item.quantity,
            "total_amount": float(item.total_amount)
        }
        for item in cart.items
    ]
    grand_total = sum(i["total_amount"] for i in items_data)

    return jsonify({
        "id": str(cart.id),
        "user_id": str(cart.user_id) if cart.user_id else None,
        "session_id": cart.session_id,
        "status": cart.status.name,
        "grand_total": grand_total,
        "items": items_data
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
    items_data = [
        {
            "id": str(item.id),
            "product": {
                "id": str(item.product.id),
                "product_name": item.product.product_name,
                "price": float(item.product.price),
                "image_url": item.product.image_url
            },
            "quantity": item.quantity,
            "total_amount": float(item.total_amount)
        }
        for item in cart.items
    ]
    grand_total = sum(i["total_amount"] for i in items_data)

    return jsonify({
        "id": str(cart.id),
        "user_id": str(cart.user_id) if cart.user_id else None,
        "session_id": cart.session_id,
        "status": cart.status.name,
        "grand_total": grand_total,
        "items": items_data
    }), 200

# Delete cart
@cart_bp.route("/<uuid:cart_id>", methods=["DELETE"])
def delete_cart(cart_id):
    cart = Cart.query.get_or_404(cart_id)
    db.session.delete(cart)
    db.session.commit()
    return jsonify({
        "id": str(cart.id),
        "user_id": str(cart.user_id) if cart.user_id else None,
        "session_id": cart.session_id,
        "status": cart.status.name,
        "grand_total": 0.0,
        "items": []
    }), 200

# Add item to cart
@cart_bp.route("/items", methods=["POST"])
def add_item():
    data = request.json
    cart_id = data.get("cart_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not cart_id or not product_id:
        return jsonify({"error": "cart_id and product_id are required"}), 400

    product = Product.query.get_or_404(product_id)
    cart = Cart.query.get_or_404(cart_id)

    # check if item already exists and update instead of duplicate
    item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
    if item:
        item.quantity += quantity
        item.total_amount = product.price * item.quantity
    else:
        item = CartItem(
            cart_id=UUID(cart_id),
            product_id=UUID(product_id),
            quantity=quantity,
            total_amount=product.price * quantity
        )
        db.session.add(item)

    db.session.commit()

    # recalc grand total
    items_data = [
        {
            "id": str(i.id),
            "product": {
                "id": str(i.product.id),
                "product_name": i.product.product_name,
                "price": float(i.product.price),
                "image_url": i.product.image_url
            },
            "quantity": i.quantity,
            "total_amount": float(i.total_amount)
        }
        for i in cart.items
    ]
    grand_total = sum(i["total_amount"] for i in items_data)

    return jsonify({
        "message": "Item added successfully",
        "cart_id": str(cart.id),
        "grand_total": grand_total,
        "items": items_data
    }), 201


# Update item quantity
@cart_bp.route("/items/<uuid:item_id>", methods=["PUT"])
def update_item(item_id):
    item = CartItem.query.get_or_404(item_id)
    quantity = request.json.get("quantity")

    if not quantity or quantity < 1:
        return jsonify({"error": "quantity must be >= 1"}), 400

    product = Product.query.get(item.product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # update and recalc
    item.quantity = quantity
    item.total_amount = product.price * quantity
    cart = item.cart

    db.session.commit()

    items_data = [
        {
            "id": str(i.id),
            "product": {
                "id": str(i.product.id),
                "product_name": i.product.product_name,
                "price": float(i.product.price),
                "image_url": i.product.image_url
            },
            "quantity": i.quantity,
            "total_amount": float(i.total_amount)
        }
        for i in cart.items
    ]
    grand_total = sum(i["total_amount"] for i in items_data)

    return jsonify({
        "message": "Item updated successfully",
        "cart_id": str(cart.id),
        "grand_total": grand_total,
        "items": items_data
    }), 200


# Delete item
@cart_bp.route("/items/<uuid:item_id>", methods=["DELETE"])
def delete_item(item_id):
    item = CartItem.query.get_or_404(item_id)
    cart = item.cart 

    db.session.delete(item)
    db.session.commit()

    # recalc grand total after deletion
    items_data = [
        {
            "id": str(i.id),
            "product": {
                "id": str(i.product.id),
                "product_name": i.product.product_name,
                "price": float(i.product.price),
                "image_url": i.product.image_url
            },
            "quantity": i.quantity,
            "total_amount": float(i.total_amount)
        }
        for i in cart.items
    ]
    grand_total = sum(i["total_amount"] for i in items_data)

    return jsonify({
        "message": "Item deleted",
        "cart_id": str(cart.id),
        "grand_total": grand_total,
        "items": items_data
    }), 200