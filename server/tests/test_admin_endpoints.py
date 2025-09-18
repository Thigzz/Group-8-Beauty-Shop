import pytest
import json
from flask_jwt_extended import create_access_token
from server.app.extensions import db
from server.app.models.users import User, UserRole

@pytest.fixture
def admin_token(test_client, new_admin):
    """Fixture to register and log in an admin user, returning an access token."""
    # Register admin
    test_client.post('/auth/register', data=json.dumps({
        "username": new_admin.username, "email": new_admin.email, "password": "password123",
        "first_name": "Admin", "last_name": "User", "primary_phone_no": "456"
    }), content_type='application/json')

    # Set user role to admin in the database
    with test_client.application.app_context():
        admin_user = User.query.filter_by(username=new_admin.username).first()
        admin_user.role = UserRole.admin
        db.session.commit()

    # Log in to get token
    login_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_admin.username, "password": "password123"
    }), content_type='application/json')
    return json.loads(login_res.data)['access_token']


@pytest.fixture
def test_user(test_client):
    """Fixture to create a test user in the database."""
    with test_client.application.app_context():
        user = User(
            first_name="Test", last_name="User", username="testuser",
            email="test@example.com", primary_phone_no="0712345678",
            is_active=False
        )
        user.set_password("password")
        db.session.add(user)
        db.session.commit()
        yield user

def test_activate_user(test_client, test_user, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.patch(
        f"/admin/users/{test_user.id}/activate",
        headers=headers
    )
    assert response.status_code == 200
    assert response.json["message"] == "User activated successfully"

def test_deactivate_user(test_client, test_user, admin_token):
    # Ensure user starts active
    with test_client.application.app_context():
        test_user.is_active = True
        db.session.commit()

    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.patch(
        f"/admin/users/{test_user.id}/deactivate",
        headers=headers
    )
    assert response.status_code == 200
    assert response.json["message"] == "User deactivated successfully"