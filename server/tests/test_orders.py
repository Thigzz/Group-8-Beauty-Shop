import pytest
import json
from uuid import uuid4
from server.app.models.orders import Order, OrderStatus
from server.app.models.users import User, UserRole
from server.app.extensions import db
from server.app.models.carts import Cart


@pytest.fixture
def admin_token(test_client, new_admin):
    test_client.post('/auth/register', data=json.dumps({
        "username": new_admin.username, "email": new_admin.email, "password": "password123", "confirm_password": "password123",
        "first_name": "Admin", "last_name": "User", "primary_phone_no": "456"
    }), content_type='application/json')
    with test_client.application.app_context():
        user = User.query.filter_by(username=new_admin.username).first()
        user.role = UserRole.admin
        db.session.commit()
    login_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_admin.username, "password": "password123"
    }), content_type='application/json')
    return json.loads(login_res.data)['access_token']

@pytest.fixture
def user_token(test_client, new_user):
    test_client.post('/auth/register', data=json.dumps({
        "username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123",
        "first_name": "Test", "last_name": "User", "primary_phone_no": "123"
    }), content_type='application/json')
    login_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_user.username, "password": "password123"
    }), content_type='application/json')
    return json.loads(login_res.data)['access_token']


@pytest.fixture
def sample_order(test_client):
    """Fixture to create a sample order."""
    with test_client.application.app_context():
        order = Order(id=uuid4(), status=OrderStatus.pending, total_amount=500, cart_id=str(uuid4()))
        db.session.add(order)
        db.session.commit()
        yield order

def test_update_order_status_admin(test_client, sample_order, admin_token):
    with test_client.application.app_context():
        order = db.session.get(Order, sample_order.id)
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.put(
            f"/api/orders/{order.id}/status",
            headers=headers,
            json={"status": "dispatched"}
        )
        assert response.status_code == 200

def test_update_order_status_non_admin(test_client, sample_order, user_token):
    with test_client.application.app_context():
        order = db.session.get(Order, sample_order.id)
        headers = {"Authorization": f"Bearer {user_token}"}
        response = test_client.put(
            f"/api/orders/{order.id}/status",
            headers=headers,
            json={"status": "dispatched"}
        )
        assert response.status_code == 403

def test_update_order_status_invalid(test_client, sample_order, admin_token):
    with test_client.application.app_context():
        order = db.session.get(Order, sample_order.id)
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = test_client.put(
            f"/api/orders/{order.id}/status",
            headers=headers,
            json={"status": "shipped"}
        )
        assert response.status_code == 400

@pytest.fixture
def user_with_orders(test_client, new_user):
    """Fixture to create a user and some orders for them."""
    with test_client.application.app_context():
        # Create user
        test_client.post('/auth/register', data=json.dumps({
            "username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123",
            "first_name": "Test", "last_name": "User", "primary_phone_no": "123"
        }), content_type='application/json')
        user = User.query.filter_by(username=new_user.username).first()

        # Create orders for this user
        cart1 = Cart(user_id=user.id)
        cart2 = Cart(user_id=user.id)
        db.session.add_all([cart1, cart2])
        db.session.commit()
        order1 = Order(cart_id=cart1.id, total_amount=100)
        order2 = Order(cart_id=cart2.id, total_amount=200)
        db.session.add_all([order1, order2])
        db.session.commit()

        login_res = test_client.post('/auth/login', data=json.dumps({
            "login_identifier": new_user.username, "password": "password123"
        }), content_type='application/json')
        return json.loads(login_res.data)['access_token']


def test_get_user_order_history(test_client, user_with_orders):
    """
    GIVEN a logged-in user with orders
    WHEN the '/api/orders/history' endpoint is requested
    THEN check that it returns only that user's orders
    """
    headers = {"Authorization": f"Bearer {user_with_orders}"}
    response = test_client.get("/api/orders/history", headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2