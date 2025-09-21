import pytest
import json
from uuid import uuid4
from server.app.models.users import User, UserRole
from server.app.extensions import db

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


def test_get_all_categories(test_client):
    """
    GIVEN a Flask application
    WHEN the '/api/categories/' endpoint is requested (GET)
    THEN check that the response is valid
    """
    response = test_client.get('/api/categories/')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)


def test_create_category(test_client, admin_token):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/categories/' endpoint is posted to (POST)
    THEN check that a new category is created
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    category_data = {"category_name": "New Category"}
    response = test_client.post('/api/categories/', headers=headers, data=json.dumps(category_data), content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.data)
    assert "id" in data


def test_get_single_category(test_client, admin_token):
    """
    GIVEN a Flask application
    WHEN the '/api/categories/<category_id>' endpoint is requested (GET)
    THEN check that the response is valid and returns the correct category
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    category_data = {"category_name": "Another Category"}
    post_response = test_client.post('/api/categories/', headers=headers, data=json.dumps(category_data), content_type='application/json')
    category_id = json.loads(post_response.data)['id']

    response = test_client.get(f'/api/categories/{category_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == category_id
    assert data['category_name'] == category_data['category_name']


def test_update_category(test_client, admin_token):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/categories/<category_id>' endpoint is updated (PATCH)
    THEN check that the category is updated successfully
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    category_data = {"category_name": "Original Name"}
    post_response = test_client.post('/api/categories/', headers=headers, data=json.dumps(category_data), content_type='application/json')
    category_id = json.loads(post_response.data)['id']

    update_data = {"category_name": "Updated Name"}
    response = test_client.patch(f'/api/categories/{category_id}', headers=headers, data=json.dumps(update_data), content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Category updated'

    # Verify the update
    get_response = test_client.get(f'/api/categories/{category_id}')
    get_data = json.loads(get_response.data)
    assert get_data['category_name'] == 'Updated Name'


def test_delete_category(test_client, admin_token):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/categories/<category_id>' endpoint is deleted (DELETE)
    THEN check that the category is deleted successfully
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    category_data = {"category_name": "To Be Deleted"}
    post_response = test_client.post('/api/categories/', headers=headers, data=json.dumps(category_data), content_type='application/json')
    category_id = json.loads(post_response.data)['id']

    response = test_client.delete(f'/api/categories/{category_id}', headers=headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Category deleted'