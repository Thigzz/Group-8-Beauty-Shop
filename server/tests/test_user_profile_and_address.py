import pytest
import json
from server.app.extensions import db
from server.app.models.users import User, UserRole
from server.app.models.address import Address

@pytest.fixture
def user_token(test_client, new_user):
    """Fixture to register and log in a regular user, returning an access token."""
    test_client.post('/auth/register', data=json.dumps({
        "username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123",
        "first_name": "Test", "last_name": "User", "primary_phone_no": "123"
    }), content_type='application/json')
    login_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_user.username, "password": "password123"
    }), content_type='application/json')
    return json.loads(login_res.data)['access_token']

@pytest.fixture
def admin_token(test_client, new_admin):
    """Fixture to register and log in an admin user, returning an access token."""
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

def test_update_own_profile(test_client, user_token):
    """Test that a user can update their own profile."""
    headers = {"Authorization": f"Bearer {user_token}"}
    update_data = {"first_name": "Updated", "last_name": "Name"}
    response = test_client.put('/auth/profile', headers=headers, data=json.dumps(update_data), content_type='application/json')
    assert response.status_code == 200
    assert response.json['first_name'] == "Updated"
    assert response.json['last_name'] == "Name"

def test_admin_update_user_profile(test_client, admin_token, new_user):
    """Test that an admin can update another user's profile."""
    with test_client.application.app_context():
        user = User.query.filter_by(username=new_user.username).first()
        if not user:
            # If the user doesn't exist, create it for the test
            test_client.post('/auth/register', data=json.dumps({
                "username": new_user.username, "email": new_user.email, "password": "password123", "confirm_password": "password123",
                "first_name": "Test", "last_name": "User", "primary_phone_no": "123"
            }), content_type='application/json')
            user = User.query.filter_by(username=new_user.username).first()
        user_id = user.id

    headers = {"Authorization": f"Bearer {admin_token}"}
    update_data = {"first_name": "AdminUpdated", "email": "newemail@test.com"}
    response = test_client.put(f'/admin/users/{user_id}', headers=headers, data=json.dumps(update_data), content_type='application/json')
    assert response.status_code == 200
    assert response.json['first_name'] == "AdminUpdated"
    assert response.json['email'] == "newemail@test.com"

def test_address_crud(test_client, user_token):
    """Test the full CRUD cycle for addresses."""
    headers = {"Authorization": f"Bearer {user_token}"}
    address_data = {
        "address_line_1": "123 Test St",
        "city": "Testville",
        "postal_code": "12345"
    }
    
    # Create
    response = test_client.post('/api/addresses/', headers=headers, data=json.dumps(address_data), content_type='application/json')
    assert response.status_code == 201
    address_id = response.json['id']

    # Read
    response = test_client.get('/api/addresses/', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]['city'] == "Testville"

    # Update
    update_data = {"city": "Newville"}
    response = test_client.put(f'/api/addresses/{address_id}', headers=headers, data=json.dumps(update_data), content_type='application/json')
    assert response.status_code == 200
    assert response.json['city'] == "Newville"

    # Delete
    response = test_client.delete(f'/api/addresses/{address_id}', headers=headers)
    assert response.status_code == 200
    
    # Verify Deletion
    response = test_client.get('/api/addresses/', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 0