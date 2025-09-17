from flask import Blueprint, request, jsonify
from app.models.users import User
from app.extensions import db
from flask_jwt_extended import create_access_token, jwt_required, current_user
from app.decorators import admin_required
from sqlalchemy import or_

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
    login_identifier = data.get('login_identifier')

    # Query for user by either username or email
    user = User.query.filter(
        or_(User.username == login_identifier, User.email == login_identifier)
    ).first()

    if user and user.check_password(data.get('password')):
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token)

    return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    if current_user:
        return jsonify({
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role.name
        }), 200
    
    return jsonify({"message": "User not found"}), 404

@auth_bp.route('/admin/dashboard', methods=['GET'])
@jwt_required()
@admin_required()
def admin_dashboard():
    return jsonify({"message": "Welcome to the admin dashboard!"}), 200