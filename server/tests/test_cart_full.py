import pytest
from uuid import uuid4

@pytest.fixture
def guest_cart(client):
    session_id = str(uuid4())
    response = client.post("/api/carts/", json={"session_id": session_id})
    return response.json

@pytest.fixture
def user_cart(client, create_user):
    user = create_user()
    response = client.post("/api/carts/", json={"user_id": str(user.id)})
    return response.json

def test_add_item_guest(client, guest_cart):
    cart_id = guest_cart["id"]
    product_id = str(uuid4())
    response = client.post("/api/carts/items", json={"cart_id": cart_id, "product_id": product_id, "quantity": 2})
    assert response.status_code == 201
    assert response.json["quantity"] == 2

def test_add_item_user(client, user_cart):
    cart_id = user_cart["id"]
    product_id = str(uuid4())
    response = client.post("/api/carts/items", json={"cart_id": cart_id, "product_id": product_id})
    assert response.status_code == 201
    assert response.json["quantity"] == 1

def test_get_cart_with_items(client, user_cart):
    cart_id = user_cart["id"]
    product_id = str(uuid4())
    client.post("/api/carts/items", json={"cart_id": cart_id, "product_id": product_id})
    response = client.get(f"/api/carts/?user_id={user_cart['user_id']}")
    assert response.status_code == 200
    assert len(response.json["items"]) >= 1

def test_update_cart_status(client, user_cart):
    cart_id = user_cart["id"]
    response = client.put(f"/api/carts/{cart_id}", json={"status": "completed"})
    assert response.status_code == 200
    assert response.json["status"] == "completed"

def test_delete_cart_item(client, user_cart):
    cart_id = user_cart["id"]
    product_id = str(uuid4())
    item_resp = client.post("/api/carts/items", json={"cart_id": cart_id, "product_id": product_id})
    item_id = item_resp.json.get("product_id") 
