from server.app.extensions import db
from server.app.models.carts import Cart
from server.app.models.cart_items import CartItem
from server.app.models.enums import CartStatus
from server.app.models.product import Product

def merge_guest_cart(user_id, session_id):
    """
    Merge a guest cart (identified by session_id) into the user's cart.
    """
    guest_cart = Cart.query.filter_by(session_id=session_id, status=CartStatus.open).first()
    if not guest_cart:
        return None

    user_cart = Cart.query.filter_by(user_id=user_id, status=CartStatus.open).first()
    if not user_cart:
        user_cart = Cart(user_id=user_id)
        db.session.add(user_cart)
        db.session.flush()

    for item in list(guest_cart.items):
        existing_item = CartItem.query.filter_by(
            cart_id=user_cart.id, product_id=item.product_id
        ).first()

        product = Product.query.get(item.product_id)
        if not product:
            db.session.delete(item)
            continue

        if existing_item:
            existing_item.quantity += item.quantity
            existing_item.total_amount = existing_item.quantity * product.price
            db.session.delete(item)
        else:
            new_item = CartItem(
                cart_id=user_cart.id,
                product_id=item.product_id,
                quantity=item.quantity,
                total_amount=item.quantity * product.price
            )
            db.session.add(new_item)
            db.session.delete(item)

    # Delete the now-empty guest cart
    db.session.delete(guest_cart)
    db.session.commit()

    return user_cart