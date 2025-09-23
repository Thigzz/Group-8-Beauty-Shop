import pytest
from server.app.models.category import Category
from server.app.models.sub_category import SubCategory
from server.app.models.users import User, UserRole
from server.app.extensions import db
import json

@pytest.fixture
def admin_token(test_client, new_admin):
    """Fixture to register and log in an admin user, returning an access token."""
    # Register admin
    test_client.post('/auth/register', data=json.dumps({
        "username": new_admin.username, "email": new_admin.email, "password": "password123", "confirm_password": "password123",
        "first_name": "Admin", "last_name": "User", "primary_phone_no": "456"
    }), content_type='application/json')
    with test_client.application.app_context():
        admin_user = User.query.filter_by(username=new_admin.username).first()
        admin_user.role = UserRole.admin
        db.session.commit()
    login_res = test_client.post('/auth/login', data=json.dumps({
        "login_identifier": new_admin.username, "password": "password123"
    }), content_type='application/json')
    return json.loads(login_res.data)['access_token']

@pytest.fixture
def test_category():
    category = Category(category_name="MakeUp")
    db.session.add(category)
    db.session.commit()
    return category


def test_create_sub_category(test_client, admin_token, test_category):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/sub_categories/' endpoint is posted to (POST)
    THEN check that a new sub_category is created
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    data = {
        "category_id": str(test_category.id),
        "sub_category_name": "Mascara"
    }
    response = test_client.post(
        "/api/sub_categories/",
        headers={"Authorization": f"Bearer {admin_token}"},
        data=json.dumps(data),
        content_type="application/json"
    )
    assert response.status_code == 201
    assert response.json["message"] == "SubCategory created"


def test_get_sub_categories(test_client, test_category):
    """
    GIVEN a Flask application
    WHEN the '/api/sub_categories/' endpoint is requested (GET)
    THEN check that the response is valid
    """
    sub_category = SubCategory(category_id=test_category.id, sub_category_name="Lipstick")
    db.session.add(sub_category)
    db.session.commit()

    response = test_client.get("/api/sub_categories/")
    assert response.status_code == 200
    assert any(sc["sub_category_name"] == "Lipstick" for sc in response.json)


def test_update_sub_category(test_client, admin_token, test_category):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/sub_categories/' endpoint is posted to (POST)
    THEN check that a new sub_category is updated successfully
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    sub_category = SubCategory(category_id=test_category.id, sub_category_name="TVs")
    db.session.add(sub_category)
    db.session.commit()

    response = test_client.patch(
        f"/api/sub_categories/{sub_category.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        data=json.dumps({"sub_category_name": "LED TVs"}),
        content_type="application/json"
    )
    assert response.status_code == 200
    assert response.json["message"] == "SubCategory updated"
    updated = SubCategory.query.get(sub_category.id)
    assert updated.sub_category_name == "LED TVs"


def test_delete_sub_category(test_client, admin_token, test_category):
    """
    GIVEN a Flask application and a logged-in admin user
    WHEN the '/api/categories/<category_id>' endpoint is deleted (DELETE)
    THEN check that the category is deleted successfully
    """
    headers = {"Authorization": f"Bearer {admin_token}"}
    sub_category = SubCategory(category_id=test_category.id, sub_category_name="Tablets")
    db.session.add(sub_category)
    db.session.commit()

    response = test_client.delete(
        f"/api/sub_categories/{sub_category.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json["message"] == "SubCategory deleted"
    assert SubCategory.query.get(sub_category.id) is None


def test_get_sub_categories_by_category(test_client, test_category):
    """
    GIVEN a category with sub-categories
    WHEN the '/api/sub_categories/by_category/<category_id>' endpoint is requested
    THEN check that it returns only the sub-categories for that category
    """
    # Create another category to ensure we are filtering correctly
    other_category = Category(category_name="Skincare")
    db.session.add(other_category)
    db.session.commit()

    # Create sub-categories for both
    sub1 = SubCategory(category_id=test_category.id, sub_category_name="Lipstick")
    sub2 = SubCategory(category_id=test_category.id, sub_category_name="Mascara")
    sub3 = SubCategory(category_id=other_category.id, sub_category_name="Moisturizer")
    db.session.add_all([sub1, sub2, sub3])
    db.session.commit()

    response = test_client.get(f"/api/sub_categories/by_category/{test_category.id}")
    assert response.status_code == 200
    data = response.get_json()
    
    assert len(data) == 2
    sub_category_names = [sc['sub_category_name'] for sc in data]
    assert "Lipstick" in sub_category_names
    assert "Mascara" in sub_category_names
    assert "Moisturizer" not in sub_category_names