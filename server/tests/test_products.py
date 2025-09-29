import pytest
import json
from uuid import uuid4
from server.app.models.users import User, UserRole
from server.app.models.category import Category
from server.app.models.sub_category import SubCategory
from server.app.extensions import db
from server.app.models.product import Product


@pytest.fixture
def admin_token(test_client, new_admin):
    """Fixture to register and log in an admin user, returning an access token."""
    # Register admin
    test_client.post('/auth/register', data=json.dumps({
        "username": new_admin.username,
        "email": new_admin.email,
        "password": "password123", "confirm_password": "password123",
        "first_name": "Admin",
        "last_name": "User",
        "primary_phone_no": "456"
    }), content_type='application/json')

    # Set user role to admin in the database
    with test_client.application.app_context():
        admin_user = User.query.filter_by(username=new_admin.username).first()
        admin_user.role = UserRole.admin
        db.session.commit()

    # Log in to get token
    login_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_admin.username,
        "password": "password123"
    }), content_type='application/json')
    return json.loads(login_res.data)['access_token']


@pytest.fixture
def sample_product_data(test_client):
    """Fixture to create sample category and sub-category for product tests."""
    with test_client.application.app_context():
        category = Category(category_name="Test Category")
        db.session.add(category)
        db.session.commit()

        sub_category = SubCategory(sub_category_name="Test SubCategory", category_id=category.id)
        db.session.add(sub_category)
        db.session.commit()

        # Create products
        product1 = Product(
            product_name="Product 1",
            description="First product",
            price=10.99,
            stock_qty=50,
            category_id=str(category.id),
            sub_category_id=sub_category.id
        )
        product2 = Product(
            product_name="Product 2",
            description="Second product",
            price=15.99,
            stock_qty=30,
            category_id=str(category.id),
            sub_category_id=str(sub_category.id)
        )
        db.session.add_all([product1, product2])
        db.session.commit()


        return {
            "product_name": "Test Product",
            "description": "A product for testing.",
            "price": 10.99,
            "stock_qty": 100,
            "category_id": str(category.id),
            "sub_category_id": str(sub_category.id)
        }


def test_get_all_products(test_client):
    """
    GIVEN a Flask application
    WHEN the '/api/products/' endpoint is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get('/api/products/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data['products'], list)


def test_create_product(test_client, admin_token, sample_product_data):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/products/' endpoint is posted to (POST)
    THEN check that a new product is created
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.post('/api/products/', headers=headers, data=json.dumps(sample_product_data), content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['product_name'] == sample_product_data['product_name']


def test_get_single_product(test_client, admin_token, sample_product_data):
    """
    GIVEN a Flask application
    WHEN the '/api/products/<product_id>' endpoint is requested (GET)
    THEN check that the response is valid and returns the correct product
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    post_response = test_client.post('/api/products/', headers=headers, data=json.dumps(sample_product_data), content_type='application/json')
    product_id = json.loads(post_response.data)['id']

    response = test_client.get(f'/api/products/{product_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == product_id
    assert data['product_name'] == sample_product_data['product_name']


def test_update_product(test_client, admin_token, sample_product_data):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/products/<product_id>' endpoint is updated (PUT)
    THEN check that the product is updated successfully
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    post_response = test_client.post('/api/products/', headers=headers, data=json.dumps(sample_product_data), content_type='application/json')
    product_id = json.loads(post_response.data)['id']

    update_data = {"price": 15.99}
    response = test_client.put(f'/api/products/{product_id}', headers=headers, data=json.dumps(update_data), content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['price'] == 15.99


def test_delete_product(test_client, admin_token, sample_product_data):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/products/<product_id>' endpoint is deleted (DELETE)
    THEN check that the product is deleted successfully
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    post_response = test_client.post('/api/products/', headers=headers, data=json.dumps(sample_product_data), content_type='application/json')
    product_id = json.loads(post_response.data)['id']

    response = test_client.delete(f'/api/products/{product_id}', headers=headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Product deleted successfully'

def test_get_products_by_category(test_client, sample_product_data):
    category_id = sample_product_data['category_id']
    response = test_client.get(f'/api/products/?category_id={category_id}')
    assert response.status_code == 200

    data = json.loads(response.data)
    assert isinstance(data['products'], list)
    assert len(data['products']) >= 2
    assert all(prod['category_id'] == category_id for prod in data['products'])


def test_get_products_by_subcategory(test_client, sample_product_data):
    sub_category_id = sample_product_data['sub_category_id']
    response = test_client.get(f'/api/products/?sub_category_id={sub_category_id}')
    assert response.status_code == 200

    data = json.loads(response.data)
    assert isinstance(data['products'], list)
    assert len(data['products']) >= 2
    assert all(prod['sub_category_id'] == sub_category_id for prod in data['products'])


def test_get_products_by_category_and_subcategory(test_client, sample_product_data):
    category_id = sample_product_data['category_id']
    sub_category_id = sample_product_data['sub_category_id']
    response = test_client.get(f'/api/products/?category_id={category_id}&sub_category_id={sub_category_id}')
    assert response.status_code == 200

    data = json.loads(response.data)
    assert isinstance(data['products'], list)
    assert len(data['products']) >= 2
    assert all(
        prod['category_id'] == category_id and prod['sub_category_id'] == sub_category_id
        for prod in data['products']
    )

def test_update_product_status(test_client, admin_token, sample_product_data):
    """
    GIVEN a Flask app and logged-in admin
    WHEN a product status is updated
    THEN it should reflect the new status in DB
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Create product
    post_response = test_client.post(
        '/api/products/', 
        headers=headers, 
        data=json.dumps(sample_product_data), 
        content_type='application/json'
    )
    product_id = json.loads(post_response.data)['id']

    # Update status -> inactive
    update_data = {"status": False}
    response = test_client.put(
        f'/api/products/{product_id}',
        headers=headers,
        data=json.dumps(update_data),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == False

    # Update status -> active again
    update_data = {"status": True}
    response = test_client.put(
        f'/api/products/{product_id}',
        headers=headers,
        data=json.dumps(update_data),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == True


def test_update_product_details_and_status(test_client, admin_token, sample_product_data):
    """
    GIVEN a Flask app and logged-in admin
    WHEN product details + status are updated together
    THEN check both updates persist
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Create product
    post_response = test_client.post(
        '/api/products/',
        headers=headers,
        data=json.dumps(sample_product_data),
        content_type='application/json'
    )
    product_id = json.loads(post_response.data)['id']

    # Update name + price + status
    update_data = {
        "product_name": "Updated Product Name",
        "price": 99.99,
        "status": False
    }
    response = test_client.put(
        f'/api/products/{product_id}',
        headers=headers,
        data=json.dumps(update_data),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)

    assert data['product_name'] == "Updated Product Name"
    assert data['price'] == 99.99
    assert data['status'] == False

def test_deleted_products_not_listed(test_client, admin_token, sample_product_data):
    """
    GIVEN a Flask app and logged-in admin
    WHEN a product is soft deleted
    THEN it should not appear in the GET /api/products/ results
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Create product
    post_response = test_client.post(
        '/api/products/',
        headers=headers,
        data=json.dumps(sample_product_data),
        content_type='application/json'
    )
    product_id = json.loads(post_response.data)['id']

    # Soft delete product
    delete_response = test_client.delete(
        f'/api/products/{product_id}',
        headers=headers
    )
    assert delete_response.status_code == 200
    delete_data = json.loads(delete_response.data)
    assert delete_data['message'] == 'Product deleted successfully'

    # Fetch all products -> deleted one should not appear
    response = test_client.get('/api/products/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert all(prod['id'] != product_id for prod in data['products'])

@pytest.fixture
def user_token(test_client):
    """Fixture to register and log in a normal user, returning an access token."""
    username = "testuser"
    email = "testuser@example.com"

    # Register normal user
    test_client.post(
        "/auth/register",
        data=json.dumps({
            "username": username,
            "email": email,
            "password": "password123",
            "confirm_password": "password123",
            "first_name": "Test",
            "last_name": "User",
            "primary_phone_no": "123456789"
        }),
        content_type="application/json"
    )

    # Ensure role is set to customer (normal user)
    with test_client.application.app_context():
        user = User.query.filter_by(username=username).first()
        user.role = UserRole.customer   # 👈 adjust to match your enum
        db.session.commit()

    # Log in to get token
    login_res = test_client.post(
        "/auth/login",
        data=json.dumps({
            "login_identifier": username,
            "password": "password123"
        }),
        content_type="application/json"
    )

    return json.loads(login_res.data)["access_token"]

def test_get_products_normal_user(test_client, user_token, sample_product_data):
    """Normal user should only see active products"""
    headers = {"Authorization": f"Bearer {user_token}"}

    res = test_client.get("/api/products/", headers=headers)
    assert res.status_code == 200
    data = res.get_json()["products"]

    # Regular users should never see inactive/deleted products
    assert all(p["status"] == True for p in data)
