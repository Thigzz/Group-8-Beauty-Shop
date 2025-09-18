from server.app.extensions import db
from server.app.models.carts import Cart
from server.app.models.cart_items import CartItem
from server.app.models.enums import CartStatus

def merge_guest_cart(user_id, session_id):
    """
    Merge a guest cart (identified by session_id) into the user's cart.
    """
    # 1. Find the guest cart
    guest_cart = Cart.query.filter_by(session_id=session_id, status=CartStatus.open).first()
    if not guest_cart:
        return None 

    # 2. Find or create user cart
    user_cart = Cart.query.filter_by(user_id=user_id, status=CartStatus.open).first()
    if not user_cart:
        user_cart = Cart(user_id=user_id)
        db.session.add(user_cart)
        db.session.commit()

    # 3. Move all guest items to user cart
    for item in guest_cart.items:
        # Check if product already exists in user cart
        existing_item = CartItem.query.filter_by(cart_id=user_cart.id, product_id=item.product_id).first()
        if existing_item:
            existing_item.quantity += item.quantity  
        else:
            item.cart_id = user_cart.id 

    # 4. Delete the guest cart
    db.session.delete(guest_cart)
    db.session.commit()

    return user_cart