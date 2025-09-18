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
    """Fixture to create a user for cart tests."""
    with test_client.application.app_context():
        user = User(username="cartuser", email="cart@test.com", first_name="Cart", last_name="User", primary_phone_no="cartphone")
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        yield user

@pytest.fixture
def sample_product(test_client):
    """Fixture to create a sample product."""
    with test_client.application.app_context():
        # Create and commit the category first to get an ID
        category = Category(category_name="Test Cat")
        db.session.add(category)
        db.session.commit()

        # create the sub_category using the valid category.id
        sub_category = SubCategory(sub_category_name="Test SubCat", category_id=category.id)
        db.session.add(sub_category)
        db.session.commit()

        product = Product(product_name="Test Item", price=10, stock_qty=50, category_id=category.id, sub_category_id=sub_category.id)
        db.session.add(product)
        db.session.commit()
        yield product

def test_add_item_user(test_client, create_user, sample_product):
    with test_client.application.app_context():
        user = User.query.get(create_user.id)
        product = Product.query.get(sample_product.id)
        
        user_cart_resp = test_client.post("/api/carts/", json={"user_id": str(user.id)})
        cart_id = user_cart_resp.json["id"]

        response = test_client.post("/api/carts/items", json={"cart_id": cart_id, "product_id": str(product.id)})
        assert response.status_code == 201
        assert response.json["quantity"] == 1