import pytest
import json
from server.app.extensions import db
from server.app.models.product import Product
from server.app.models.category import Category
from server.app.models.sub_category import SubCategory

@pytest.fixture
def sample_data(test_client):
    """Fixture to create sample data for search tests."""
    with test_client.application.app_context():
        # Create categories
        cat1 = Category(category_name="Makeup")
        cat2 = Category(category_name="Skincare")
        db.session.add_all([cat1, cat2])
        db.session.commit()

        # Create sub-categories
        sub1 = SubCategory(sub_category_name="Lipstick", category_id=cat1.id)
        sub2 = SubCategory(sub_category_name="Moisturizer", category_id=cat2.id)
        db.session.add_all([sub1, sub2])
        db.session.commit()

        # Create products
        prod1 = Product(
            product_name="Ruby Red Lipstick",
            description="A vibrant red lipstick.",
            price=15.99,
            stock_qty=50,
            category_id=cat1.id,
            sub_category_id=sub1.id
        )
        prod2 = Product(
            product_name="Hydrating Moisturizer",
            description="A daily moisturizer for all skin types.",
            price=25.00,
            stock_qty=100,
            category_id=cat2.id,
            sub_category_id=sub2.id
        )
        prod3 = Product(
            product_name="Soothing Red Balm",
            description="A calming balm for sensitive skin.",
            price=12.50,
            stock_qty=30,
            category_id=cat2.id,
            sub_category_id=sub2.id
        )
        db.session.add_all([prod1, prod2, prod3])
        db.session.commit()


def test_search_with_results(test_client, sample_data):
    """
    GIVEN a populated database
    WHEN the '/api/search/' endpoint is called with a query that matches items
    THEN check that the response contains the correct products and categories
    """
    response = test_client.get('/api/search/?q=Red')
    assert response.status_code == 200
    data = response.get_json()

    # Check for products
    assert len(data['products']) == 2
    product_names = [p['product_name'] for p in data['products']]
    assert "Ruby Red Lipstick" in product_names
    assert "Soothing Red Balm" in product_names

    # Check for categories
    assert len(data['categories']) == 0
    
    # Check for sub-categories
    assert len(data['sub_categories']) == 0

def test_search_no_results(test_client, sample_data):
    """
    GIVEN a populated database
    WHEN the '/api/search/' endpoint is called with a query that matches nothing
    THEN check that the response is empty
    """
    response = test_client.get('/api/search/?q=nonexistentquery')
    assert response.status_code == 200
    data = response.get_json()

    assert len(data['products']) == 0
    assert len(data['categories']) == 0
    assert len(data['sub_categories']) == 0

def test_search_empty_query(test_client, sample_data):
    """
    GIVEN a populated database
    WHEN the '/api/search/' endpoint is called with an empty query
    THEN check that the response is empty
    """
    response = test_client.get('/api/search/?q=')
    assert response.status_code == 200
    data = response.get_json()

    assert len(data['products']) == 0
    assert len(data['categories']) == 0
    assert len(data['sub_categories']) == 0