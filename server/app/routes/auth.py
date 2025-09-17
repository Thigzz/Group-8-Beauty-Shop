from flask import Blueprint, request, jsonify
from app.models.users import User
from app.extensions import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"message": "User with this email already exists"}), 409

    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"message": "Username is already taken"}), 409

    new_user = User(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        username=data.get('username'),
        email=data.get('email'),
        primary_phone_no=data.get('primary_phone_no')
    )
    new_user.set_password(data.get('password'))

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if user and user.check_password(data.get('password')):
        access_token = create_access_token(identity={'username': user.username, 'role': user.role.name})
        return jsonify(access_token=access_token)

    return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    
    if user:
        return jsonify({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "role": user.role.name
        }), 200
    
    return jsonify({"message": "User not found"}), 404