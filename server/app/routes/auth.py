from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import or_
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature
from flask_jwt_extended import create_access_token, jwt_required, current_user


from server.app.models.users import User
from server.app.extensions import db, bcrypt
from server.app.decorators import admin_required
from server.app.utils.cart_utils import merge_guest_cart

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if email or username already exists
    if User.query.filter(or_(User.email == data.get('email'), User.username == data.get('username'))).first():
        return jsonify({"message": "User with this email or username already exists"}), 409

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
    """
    Handles user login, merges guest cart if present, and returns a JWT.
    """
    data = request.get_json()
    login_identifier = data.get('login_identifier')
    password = data.get('password')
    session_id = data.get('session_id')

    # Allows login with either username or email
    user = User.query.filter(
        or_(User.username == login_identifier, User.email == login_identifier)
    ).first()

    if user and user.check_password(password):
        # If a guest session exists, merge the cart
        if session_id:
            merge_guest_cart(user.id, session_id)
        
        # Create and return the JWT access token
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token)

    return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route('/reset-questions', methods=['POST'])
def get_reset_questions():
    login_identifier = request.get_json().get('login_identifier')
    user = User.query.filter(or_(User.username == login_identifier, User.email == login_identifier)).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    questions = user.security_questions
    if not questions:
        return jsonify({"message": "No security questions found for this user."}), 404
        
    return jsonify([
        {"id": str(q.security_question.id), "question": q.security_question.question}
        for q in questions
    ]), 200


@auth_bp.route('/verify-answers', methods=['POST'])
def verify_answers():
    data = request.get_json()
    login_identifier = data.get('login_identifier')
    answers = data.get('answers')

    user = User.query.filter(or_(User.username == login_identifier, User.email == login_identifier)).first()

    if not user or not answers:
        return jsonify({"message": "Invalid request"}), 400

    user_questions = {str(q.question_id): q.answer_hash for q in user.security_questions}

    if len(answers) != len(user_questions):
        return jsonify({"message": "Incorrect number of answers submitted"}), 400

    for ans in answers:
        question_id = ans.get('question_id')
        answer_text = ans.get('answer')
        
        if question_id not in user_questions or not bcrypt.check_password_hash(user_questions[question_id], answer_text):
            return jsonify({"message": "One or more answers are incorrect."}), 401

    # If answers are correct, generate a short-lived reset token
    s = URLSafeTimedSerializer(current_app.config['JWT_SECRET_KEY'])
    token = s.dumps(user.email, salt='password-reset-salt')
    
    return jsonify({"message": "Answers verified.", "reset_token": token}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    s = URLSafeTimedSerializer(current_app.config['JWT_SECRET_KEY'])
    try:
        # Token is valid for 15 minutes
        email = s.loads(token, salt='password-reset-salt', max_age=900)
    except (SignatureExpired, BadTimeSignature):
        return jsonify({"message": "Token is invalid or has expired."}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        user.set_password(new_password)
        db.session.commit()
        return jsonify({"message": "Password has been reset successfully."}), 200
    
    return jsonify({"message": "User not found."}), 404


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    return jsonify({
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role.name
    }), 200


@auth_bp.route('/admin/dashboard', methods=['GET'])
@jwt_required()
@admin_required()
def admin_dashboard():
    return jsonify({"message": "Welcome to the admin dashboard!"}), 200