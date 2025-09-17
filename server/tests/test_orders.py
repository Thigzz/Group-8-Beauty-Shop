import pytest
from server.app.models.orders import Order, OrderStatus

def test_update_order_status_admin(client, db_session, admin_token):
    # Create a sample order
    order = Order(status=OrderStatus.pending, total_amount=500)
    db_session.add(order)
    db_session.commit()

    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.put(
        f"/orders/{order.id}/status",
        headers=headers,
        json={"status": "fulfilled"}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "fulfilled"

    # Verify in DB
    db_session.refresh(order)
    assert order.status == OrderStatus.fulfilled

def test_update_order_status_non_admin(client, db_session, user_token):
    # Create a sample order
    order = Order(status=OrderStatus.pending, total_amount=500)
    db_session.add(order)
    db_session.commit()

    headers = {"Authorization": f"Bearer {user_token}"}
    response = client.put(
        f"/orders/{order.id}/status",
        headers=headers,
        json={"status": "fulfilled"}
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["error"] == "Admin privileges required"

def test_update_order_status_invalid(client, db_session, admin_token):
    order = Order(status=OrderStatus.pending, total_amount=500)
    db_session.add(order)
    db_session.commit()

    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.put(
        f"/orders/{order.id}/status",
        headers=headers,
        json={"status": "shipped"}  # invalid status
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Invalid status" in data["error"]
