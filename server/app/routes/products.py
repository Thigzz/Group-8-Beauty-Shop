from flask import Blueprint, request, jsonify
import uuid
from app.extensions import db
from app.models.product import Product

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/', methods=['GET'])
def get_all_products():
    """Get all products with optional filtering"""
    try:
        # Getting query param
        category_id = request.args.get('category_id')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Building query
        query = Product.query
        
        if category_id:
            query = query.filter_by(category_id=category_id)
        
        if search:
            query = query.filter(Product.product_name.contains(search))
        
        # Paginating results
        products = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify(product.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@products_bp.route('/', methods=['POST'])
def create_product():
    """Create a new product (Admin only)"""
    try:
        data = request.get_json()
        
        # Validating required fields
        required_fields = ['product_name', 'price', 'stock_qty', 'category_id', 'sub_category_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Converting string UUIDs to proper UUID objects if needed
        try:
            if isinstance(data['sub_category_id'], str):
                sub_category_uuid = uuid.UUID(data['sub_category_id'])
            else:
                sub_category_uuid = data['sub_category_id']
        except ValueError:
            return jsonify({'error': 'sub_category_id must be a valid UUID'}), 400
        
        # Creating new product
        product = Product(
            product_name=data['product_name'],
            description=data.get('description'),
            price=data['price'],
            stock_qty=data['stock_qty'],
            image_url=data.get('image_url'),
            category_id=data['category_id'],
            sub_category_id=sub_category_uuid
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify(product.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update a product (Admin only)"""
    try:
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        
        # Updating fields if provided
        if 'product_name' in data:
            product.product_name = data['product_name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'stock_qty' in data:
            product.stock_qty = data['stock_qty']
        if 'image_url' in data:
            product.image_url = data['image_url']
        if 'category_id' in data:
            product.category_id = data['category_id']
        if 'sub_category_id' in data:
            if isinstance(data['sub_category_id'], str):
                product.sub_category_id = uuid.UUID(data['sub_category_id'])
            else:
                product.sub_category_id = data['sub_category_id']
        
        db.session.commit()
        return jsonify(product.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product (Admin only)"""
    try:
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
