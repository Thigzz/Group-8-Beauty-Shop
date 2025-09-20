from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from server.app.models import Product, Category, SubCategory

search_bp = Blueprint('search', __name__, url_prefix='/api/search')

@search_bp.route('/', methods=['GET'])
def search():
    """
    Searches across products, categories, and sub-categories.
    Accepts a query parameter 'q'.
    """
    query = request.args.get('q', '').strip()

    if not query:
        return jsonify({
            "products": [],
            "categories": [],
            "sub_categories": []
        })

    search_term = f"%{query}%"

    # Search products by name or description
    products = Product.query.filter(
        or_(
            Product.product_name.ilike(search_term),
            Product.description.ilike(search_term)
        )
    ).limit(20).all()

    # Search categories
    categories = Category.query.filter(
        Category.category_name.ilike(search_term)
    ).limit(10).all()
    
    # Search sub-categories
    sub_categories = SubCategory.query.filter(
        SubCategory.sub_category_name.ilike(search_term)
    ).limit(10).all()

    return jsonify({
        "products": [p.to_dict() for p in products],
        "categories": [{"id": str(c.id), "category_name": c.category_name} for c in categories],
        "sub_categories": [{"id": str(sc.id), "sub_category_name": sc.sub_category_name} for sc in sub_categories]
    })