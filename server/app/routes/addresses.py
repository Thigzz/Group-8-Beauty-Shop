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


        is_default = data.get('isDefault', False)
        
        existing_addresses = Address.query.filter_by(user_id=user.id).count()
        if existing_addresses == 0:
            is_default = True

        address = Address(
            user_id=user.id,
            address_line_1=data['address_line_1'],
            address_line_2=data.get('address_line_2'),
            city=data['city'],
            postal_code=data['postal_code'],
            is_default=is_default

        )
        db.session.add(address)
        db.session.commit()

        response_data = address.to_dict()
        response_data['isDefault'] = response_data.pop('is_default')

        return jsonify(response_data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@addresses_bp.route('/', methods=['GET'])
@jwt_required()
def get_addresses():
    """Get all addresses for the current user."""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first_or_404()
    addresses = Address.query.filter_by(user_id=user.id).all()

    addresses_data = []
    for address in addresses:
        address_data = address.to_dict()
        address_data['isDefault'] = address_data.pop('is_default') 
        addresses_data.append(address_data)

    return jsonify(addresses_data), 200


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

        if 'isDefault' in data:
            if data['isDefault']:
                Address.query.filter_by(user_id=user.id).update({'is_default': False})
                address.is_default = True
            else:
                address.is_default = False

        db.session.commit()

        response_data = address.to_dict()
        response_data['isDefault'] = response_data.pop('is_default')

        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@addresses_bp.route('/<uuid:address_id>/set-default', methods=['PUT'])
@jwt_required()
def set_default_address(address_id):
    """Set an address as the default shipping address."""
    try:
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first_or_404()
        address = Address.query.filter_by(id=address_id, user_id=user.id).first_or_404()
        Address.query.filter_by(user_id=user.id).update({'is_default': False})
        address.is_default = True
        db.session.commit()
        
        response_data = address.to_dict()
        response_data['isDefault'] = response_data.pop('is_default')  

        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400   

@addresses_bp.route('/<uuid:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    """Delete an address for the current user."""
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first_or_404()

    address = Address.query.filter_by(id=address_id, user_id=user.id).first_or_404()
    
    was_default = address.is_default 

    db.session.delete(address)
    db.session.commit()

    if was_default:
        remaining_address = Address.query.filter_by(user_id=user.id).first()
        if remaining_address:
            remaining_address.is_default = True
            db.session.commit()
            
    return jsonify({'message': 'Address deleted'}), 200