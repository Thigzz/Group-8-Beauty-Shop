import pytest
from server.app.extensions import db
from server.app.models.users import User
from server.app.models.orders import Order
from server.app.models.product import Product
from server.app.models.category import Category


@pytest.fixture
def test_category(app):
    """Fixture to create a test category."""
    category = Category(category_name="Makeup")
    db.session.add(category)
    db.session.commit()
    yield category
    db.session.delete(category)
    db.session.commit()


@pytest.fixture
def test_product(app, test_category):
    """Fixture to create a test product."""
    product = Product(
        product_name="Test Lipstick",
        description="Test description",
        price=25.99,
        stock_qty=5,  # Low stock for testing
        category_id=test_category.id,
        sub_category_id=test_category.id
    )
    db.session.add(product)
    db.session.commit()
    yield product
    db.session.delete(product)
    db.session.commit()


def test_dashboard_analytics(client):
    """Test dashboard analytics endpoint returns correct structure."""
    response = client.get('/api/analytics/dashboard')
    
    assert response.status_code == 200
    assert response.json is not None
    
    # Check required fields exist
    required_fields = ['total_revenue', 'total_orders', 'total_customers', 
                      'total_products', 'recent_orders_30_days', 'average_order_value']
    for field in required_fields:
        assert field in response.json
        assert isinstance(response.json[field], (int, float))


def test_sales_analytics(client):
    """Test sales analytics endpoint returns correct structure."""
    response = client.get('/api/analytics/sales')
    assert response.status_code == 200
    assert response.json is not None
    
    # Check structure
    assert 'period_days' in response.json
    assert 'period_revenue' in response.json
    assert 'daily_sales' in response.json
    assert 'order_status_breakdown' in response.json
    
    # Test with custom period
    response = client.get('/api/analytics/sales?days=7')
    assert response.status_code == 200
    assert response.json['period_days'] == 7


def test_product_analytics(client):
    """Test product analytics endpoint returns correct structure."""
    response = client.get('/api/analytics/products')
    assert response.status_code == 200
    assert response.json is not None
    
    required_fields = ['best_sellers_by_quantity', 'best_sellers_by_revenue',
                      'low_stock_products', 'category_performance']
    for field in required_fields:
        assert field in response.json
        assert isinstance(response.json[field], list)


def test_customer_analytics(client):
    """Test customer analytics endpoint returns correct structure."""
    response = client.get('/api/analytics/customers')
    assert response.status_code == 200
    assert response.json is not None
    
    required_fields = ['period_days', 'new_customers', 'active_customers',
                      'daily_registrations', 'top_customers']
    for field in required_fields:
        assert field in response.json


def test_financial_analytics(client):
    """Test financial analytics endpoint returns correct structure."""
    response = client.get('/api/analytics/financial')
    assert response.status_code == 200
    assert response.json is not None
    
    required_fields = ['payment_status_breakdown', 'monthly_revenue_trend',
                      'outstanding_invoices_amount']
    for field in required_fields:
        assert field in response.json


def test_analytics_with_test_data(client, app, test_product):
    """Test analytics endpoints with actual test data."""
    # Dashboard should show the test product
    response = client.get('/api/analytics/dashboard')
    assert response.status_code == 200
    assert response.json['total_products'] == 1
    
    # Product analytics should show low stock
    response = client.get('/api/analytics/products')
    assert response.status_code == 200
    # Should detect low stock (stock_qty = 5 < 10)
    low_stock = response.json['low_stock_products']
    assert len(low_stock) == 1
    assert low_stock[0]['product_name'] == 'Test Lipstick'
