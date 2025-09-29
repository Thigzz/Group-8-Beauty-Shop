from flask import Blueprint, request, jsonify
import uuid

from server.app.extensions import db
from server.app.models.product import Product
from flask_jwt_extended import jwt_required
from server.app.decorators import admin_required

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/', methods=['GET'])
def get_all_products():
    """Get all products with optional filtering"""
    try:
        category_id = request.args.get('category_id')
        sub_category_id = request.args.get('sub_category_id')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Product.query

        query = Product.query.filter(Product.status == True)

        status = request.args.get('status')

        if status:
            query = query.filter_by(status=status)
        if category_id:
            query = query.filter_by(category_id=category_id)
        if sub_category_id:
            query = query.filter_by(sub_category_id=sub_category_id)
        
        if search:
            query = query.filter(Product.product_name.contains(search))
        
        products = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<string:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    try:
        # Manually converts the string to a UUID object for querying
        product_uuid = uuid.UUID(product_id)
        product = Product.query.get_or_404(product_uuid)
        return jsonify(product.to_dict()), 200
    except ValueError:
        return jsonify({'error': 'Invalid product ID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@products_bp.route('/categories/<string:category_id>', methods=['GET'])
def get_category_products(category_id):
    """Get all products for a specific category"""
    try:
        products = Product.query.filter_by(category_id=category_id).all()
        return jsonify([product.to_dict() for product in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/subcategories/<string:sub_category_id>', methods=['GET'])
def get_subcategory_products(sub_category_id):
    """Get all products for a specific subcategory"""
    try:
        products = Product.query.filter_by(sub_category_id=sub_category_id).all()
        return jsonify([product.to_dict() for product in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required()
def create_product():
    """Create a new product (Admin only)"""
    try:
        data = request.get_json()
        
        required_fields = ['product_name', 'price', 'stock_qty', 'category_id', 'sub_category_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Ensure UUIDs are valid strings before creating the product
        try:
            uuid.UUID(data['category_id'])
            uuid.UUID(data['sub_category_id'])
        except ValueError:
            return jsonify({'error': 'category_id and sub_category_id must be valid UUIDs'}), 400
        
        product = Product(
            product_name=data['product_name'],
            description=data.get('description'),
            price=data['price'],
            stock_qty=data['stock_qty'],
            image_url=data.get('image_url'),
            category_id=data['category_id'],
            sub_category_id=data['sub_category_id'],
            status = bool(data.get("status", True))

        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify(product.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating product: {e}")
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<string:product_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_product(product_id):
    """Update a product (Admin only)"""
    try:
        product_uuid = uuid.UUID(product_id)
        product = Product.query.get_or_404(product_uuid)
        data = request.get_json()
        
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
            product.category_id = str(uuid.UUID(data['category_id']))
        if 'sub_category_id' in data:
            product.sub_category_id = str(uuid.UUID(data['sub_category_id']))
        if 'status' in data:
            product.status = bool(data["status"])

        
        db.session.commit()
        return jsonify(product.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<string:product_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_product(product_id):
    """Soft delete a product (set status=deleted)"""
    try:
        product_uuid = uuid.UUID(product_id)
        product = Product.query.get_or_404(product_uuid)

        product.status = False
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
