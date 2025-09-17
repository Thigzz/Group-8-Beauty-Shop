import pytest
from flask_jwt_extended import create_access_token
from server.app.extensions import db
from server.app.models.users import User


@pytest.fixture
def test_user(app):
    """Fixture to create a test user in the database."""
    user = User(
        first_name="Test",
        last_name="User",
        username="testuser",
        email="test@example.com",
        primary_phone_no="0712345678",   
        role="customer",
        password_hash="hashedpassword",
        is_active=False
    )
    db.session.add(user)
    db.session.commit()
    yield user
    db.session.delete(user)
    db.session.commit()


def test_activate_user(client, app, test_user):
    # Generate admin token
    access_token = create_access_token(identity={"role": "admin"})
    headers = {"Authorization": f"Bearer {access_token}"}

    response = client.put(
        f"/admin/users/{test_user.id}/activate",
        headers=headers
    )

    assert response.status_code == 200
    assert response.json["message"] == "User activated successfully"

    # Check DB
    with app.app_context():
        db.session.refresh(test_user)
        assert test_user.is_active is True


def test_deactivate_user(client, app, test_user):
    # Ensure user starts active
    with app.app_context():
        test_user.is_active = True
        db.session.commit()

    # Generate admin token
    access_token = create_access_token(identity={"role": "admin"})
    headers = {"Authorization": f"Bearer {access_token}"}

    response = client.put(
        f"/admin/users/{test_user.id}/deactivate",
        headers=headers
    )

    assert response.status_code == 200
    assert response.json["message"] == "User deactivated successfully"

    # Check DB
    with app.app_context():
        db.session.refresh(test_user)
        assert test_user.is_active is False
