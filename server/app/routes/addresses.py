from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.app.extensions import db
from server.app.models.address import Address
from server.app.models.users import User

addresses_bp = Blueprint('addresses', __name__, url_prefix='/api/addresses')

@addresses_bp.route('/', methods=['POST'])
@jwt_required()
def create_address():
    """Create a new address for the current user."""
    try:
        data = request.get_json()
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first_or_404()

        address = Address(
            user_id=user.id,
            address_line_1=data['address_line_1'],
            address_line_2=data.get('address_line_2'),
            city=data['city'],
            postal_code=data['postal_code']
        )
        db.session.add(address)
        db.session.commit()
        return jsonify(address.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@addresses_bp.route('/', methods=['GET'])
@jwt_required()
def get_addresses():
    """Get all addresses for the current user."""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first_or_404()
    addresses = Address.query.filter_by(user_id=user.id).all()
    return jsonify([address.to_dict() for address in addresses]), 200

@addresses_bp.route('/<uuid:address_id>', methods=['PUT'])
@jwt_required()
def update_address(address_id):
    """Update an address for the current user."""
    try:
        data = request.get_json()
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first_or_404()

        address = Address.query.filter_by(id=address_id, user_id=user.id).first_or_404()

        address.address_line_1 = data.get('address_line_1', address.address_line_1)
        address.address_line_2 = data.get('address_line_2', address.address_line_2)
        address.city = data.get('city', address.city)
        address.postal_code = data.get('postal_code', address.postal_code)

        db.session.commit()
        return jsonify(address.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@addresses_bp.route('/<uuid:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    """Delete an address for the current user."""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first_or_404()

    address = Address.query.filter_by(id=address_id, user_id=user.id).first_or_404()
    db.session.delete(address)
    db.session.commit()
    return jsonify({'message': 'Address deleted'}), 200