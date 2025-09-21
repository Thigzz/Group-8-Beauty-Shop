import pytest
from uuid import uuid4
import json
from server.app.models.users import User
from server.app.models.product import Product
from server.app.models.category import Category
from server.app.models.sub_category import SubCategory
from server.app.extensions import db

@pytest.fixture
def create_user(test_client):
    """Fixture to create a user for cart merge tests."""
    with test_client.application.app_context():
        user = User(username="mergeuser", email="merge@test.com", first_name="Merge", last_name="User", primary_phone_no="mergephone")
        user.set_password("password")
        db.session.add(user)
        db.session.commit()
        yield user

@pytest.fixture
def sample_product(test_client):
    """Fixture to create a sample product."""
    with test_client.application.app_context():
        # Create and commit the category first to get an ID
        category = Category(category_name="Merge Cat")
        db.session.add(category)
        db.session.commit()

        # Create the sub_category using the valid category.id
        sub_category = SubCategory(sub_category_name="Merge SubCat", category_id=category.id)
        db.session.add(sub_category)
        db.session.commit()
        
        product = Product(product_name="Merge Item", price=25, stock_qty=10, category_id=category.id, sub_category_id=sub_category.id)
        db.session.add(product)
        db.session.commit()
        yield product

def test_guest_cart_merge(test_client, create_user, sample_product):
    session_id = str(uuid4())

    with test_client.application.app_context():
        product = Product.query.get(sample_product.id)
        
        guest_cart_resp = test_client.post("/api/carts/", json={"session_id": session_id})
        cart_id = guest_cart_resp.json["id"]
        test_client.post("/api/carts/items", json={"cart_id": cart_id, "product_id": str(product.id), "quantity": 2})

        user = User.query.get(create_user.id)
        
        login_resp = test_client.post("/auth/login", json={"login_identifier": user.email, "password": "password", "session_id": session_id})
        assert login_resp.status_code == 200

        user_cart_resp = test_client.get(f"/api/carts/?user_id={user.id}")
        assert user_cart_resp.status_code == 200
        items = user_cart_resp.json["items"]
        assert any(i["product_id"] == str(product.id) and i["stock_qty"] == 2 for i in items)