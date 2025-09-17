import pytest
from uuid import uuid4

def test_guest_cart_merge(client, create_user):
    session_id = str(uuid4())
    product_id = str(uuid4())

    # Create guest cart and add item
    guest_cart_resp = client.post("/api/carts/", json={"session_id": session_id})
    guest_cart_id = guest_cart_resp.json["id"]
    client.post("/api/carts/items", json={"cart_id": guest_cart_id, "product_id": product_id, "quantity": 2})

    # Create user
    user = create_user()
    user_id = str(user.id)

    # Simulate login with session_id (merge guest cart)
    login_resp = client.post("/api/auth/login", json={"email": user.email, "password": "password", "session_id": session_id})
    assert login_resp.status_code == 200

    # Check user cart has the merged item
    user_cart_resp = client.get(f"/api/carts/?user_id={user_id}")
    assert user_cart_resp.status_code == 200
    items = user_cart_resp.json["items"]
    assert any(i["product_id"] == product_id and i["quantity"] == 2 for i in items)
