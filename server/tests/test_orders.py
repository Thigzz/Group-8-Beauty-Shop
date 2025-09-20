import pytest
import json
from uuid import uuid4
from server.app.models.orders import Order, OrderStatus
from server.app.models.users import User, UserRole
from server.app.extensions import db

# (Keep the admin_token and user_token fixtures as they were in the last step)
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