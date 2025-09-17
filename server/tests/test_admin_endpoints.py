import json
from flask_jwt_extended import create_access_token
from app.models.users import User
from app.extensions import db

def get_admin_token():
    return create_access_token(identity={"id": "admin123", "role": "admin"})

def test_activate_user(client):
    user = User(email="test@example.com", is_active=False)
    db.session.add(user)
    db.session.commit()

    token = get_admin_token()

    response = client.patch(
        f"/admin/users/{user.id}/activate",
        headers={"Authorization": f"Bearer {token}"}
    )

    data = json.loads(response.data)
    assert response.status_code == 200
    assert data["is_active"] is True


def test_deactivate_user(client):
    user = User(email="test2@example.com", is_active=True)
    db.session.add(user)
    db.session.commit()

    token = get_admin_token()

    response = client.patch(
        f"/admin/users/{user.id}/deactivate",
        headers={"Authorization": f"Bearer {token}"}
    )

    data = json.loads(response.data)
    assert response.status_code == 200
    assert data["is_active"] is False
