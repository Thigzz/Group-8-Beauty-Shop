import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from server.app import create_app
from server.app.extensions import db
from server.app.models.users import User, UserRole

@pytest.fixture(scope='module')
def new_user():
    """Fixture for creating a new regular user instance."""
    user = User(
        first_name='Test',
        last_name='User',
        username='testuser',
        email='test@example.com',
        primary_phone_no='1234567890',
        role=UserRole.customer
    )
    user.set_password('password123')
    return user

@pytest.fixture(scope='module')
def new_admin():
    """Fixture for creating a new admin user instance."""
    admin = User(
        first_name='Admin',
        last_name='User',
        username='adminuser',
        email='admin@example.com',
        primary_phone_no='0987654321',
        role=UserRole.admin
    )
    admin.set_password('password123')
    return admin

@pytest.fixture(scope='function')
def test_client():
    """
    Creates a Flask app and test client for each test function.
    This provides a clean database and application context for isolated testing.
    """
    flask_app = create_app()
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret-key"
    })

    with flask_app.app_context():
        db.create_all()
        yield flask_app.test_client()
        db.session.remove()
        db.drop_all()