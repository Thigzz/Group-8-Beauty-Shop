from flask import Flask
from flask_cors import CORS
import os

def create_app():
    """
    Application factory function to create and configure the Flask app.
    """
    app = Flask(__name__)
    
    # Load configuration from environment variables with sensible defaults
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///beauty_shop.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "a_super_secret_key_for_dev")
    
    # Import extensions using the 'server.app' structure
    from server.app.extensions import db, migrate, jwt, bcrypt
    
    # Initialize extensions with the Flask app instance
    db.init_app(app)
    migrate.init_app(app, db) 
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    
    # Import models to ensure they are registered with SQLAlchemy
    from server.app.models.users import User
    from server.app import models 

    # Callback to load the user object from a JWT
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(username=identity).one_or_none()

    # --- Register Blueprints ---
    # Import all blueprints
    from server.app.routes.auth import auth_bp
    from server.app.api.products import products_bp
    from server.app.api.security_questions import security_questions_bp
    from server.app.api.checkout import checkout_bp
    from server.app.api.orders import orders_bp
    from server.app.api.admin_reset_password import admin_reset_bp
    from server.app.api.categories import categories_bp

    # **UPDATED**: Register blueprints with specific URL prefixes
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(products_bp, url_prefix='/products')
    app.register_blueprint(categories_bp, url_prefix='/categories')
    app.register_blueprint(security_questions_bp, url_prefix='/security-questions')
    app.register_blueprint(checkout_bp, url_prefix='/checkout')
    app.register_blueprint(orders_bp, url_prefix='/orders')
    app.register_blueprint(admin_reset_bp, url_prefix='/admin/reset-password')
    
    @app.route('/')
    def home():
        return {"message": "Welcome to the Pambo Beauty Shop API"}
    
    return app