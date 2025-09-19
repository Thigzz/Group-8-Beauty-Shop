import pytest
import json
from server.app.extensions import db
from server.app.models.users import User, UserRole
from server.app.models.orders import Order
from server.app.models.product import Product
from server.app.models.category import Category
from server.app.models.sub_category import SubCategory

@pytest.fixture
def admin_token(test_client, new_admin):
    """Fixture to register and log in an admin user, returning an access token."""
    # Register admin
    test_client.post('/auth/register', data=json.dumps({
        "username": new_admin.username,
        "email": new_admin.email,
        "password": "password123",
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


@pytest.fixture
def test_category(test_client):
    """Fixture to create a test category."""
    with test_client.application.app_context():
        category = Category(category_name="Makeup")
        db.session.add(category)
        db.session.commit()
        yield category

@pytest.fixture
def test_product(test_client, test_category):
    """Fixture to create a test product."""
    with test_client.application.app_context():
        sub_category = SubCategory(sub_category_name="Lipstick", category_id=test_category.id)
        db.session.add(sub_category)
        db.session.commit()
        product = Product(
            product_name="Test Lipstick",
            description="Test description",
            price=25.99,
            stock_qty=5,  # Low stock for testing
            category_id=test_category.id,
            sub_category_id=sub_category.id
        )
        db.session.add(product)
        db.session.commit()
        yield product

def test_dashboard_analytics(test_client, admin_token):
    """Test dashboard analytics endpoint returns correct structure."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.get('/api/analytics/dashboard', headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    # Check required fields exist
    required_fields = ['total_revenue', 'total_orders', 'total_customers',
                       'total_products', 'recent_orders_30_days', 'average_order_value']
    for field in required_fields:
        assert field in response.json
        assert isinstance(response.json[field], (int, float))

def test_sales_analytics(test_client, admin_token):
    """Test sales analytics endpoint returns correct structure."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.get('/api/analytics/sales', headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    # Check structure
    assert 'period_days' in response.json
    assert 'period_revenue' in response.json
    assert 'daily_sales' in response.json
    assert 'order_status_breakdown' in response.json
    # Test with custom period
    response = test_client.get('/api/analytics/sales?days=7', headers=headers)
    assert response.status_code == 200
    assert response.json['period_days'] == 7

def test_product_analytics(test_client, admin_token):
    """Test product analytics endpoint returns correct structure."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.get('/api/analytics/products', headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    required_fields = ['best_sellers_by_quantity', 'best_sellers_by_revenue',
                      'low_stock_products', 'category_performance']
    for field in required_fields:
        assert field in response.json
        assert isinstance(response.json[field], list)

def test_customer_analytics(test_client, admin_token):
    """Test customer analytics endpoint returns correct structure."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.get('/api/analytics/customers', headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    required_fields = ['period_days', 'new_customers', 'active_customers',
                      'daily_registrations', 'top_customers']
    for field in required_fields:
        assert field in response.json

def test_financial_analytics(test_client, admin_token):
    """Test financial analytics endpoint returns correct structure."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = test_client.get('/api/analytics/financial', headers=headers)
    assert response.status_code == 200
    assert response.json is not None
    required_fields = ['payment_status_breakdown', 'monthly_revenue_trend',
                      'outstanding_invoices_amount']
    for field in required_fields:
        assert field in response.json

def test_analytics_with_test_data(test_client, admin_token, test_product):
    """Test analytics endpoints with actual test data."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    # Dashboard should show the test product
    response = test_client.get('/api/analytics/dashboard', headers=headers)
    assert response.status_code == 200
    assert response.json['total_products'] >= 1
    # Product analytics should show low stock
    response = test_client.get('/api/analytics/products', headers=headers)
    assert response.status_code == 200
    # Should detect low stock (stock_qty = 5 < 10)
    low_stock = response.json['low_stock_products']
    assert len(low_stock) >= 1
    assert any(p['product_name'] == 'Test Lipstick' for p in low_stock)