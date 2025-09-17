from app.utils.cart_utils import merge_guest_cart
from flask import request, jsonify


# ---merge cart when user logs in----
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    session_id = data.get("session_id")  # optional, guest session cart

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Merge guest cart into user cart
    if session_id:
        merge_guest_cart(user.id, session_id)

    # return token/session info
    return jsonify({"message": "Login successful", "user_id": str(user.id)}), 200
