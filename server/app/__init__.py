from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # DB configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///beauty_shop.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Import extensions
    from server.app.extensions import db, migrate
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db) 
    CORS(app)
    
    # Import models AFTER extensions are initialized
    from server.app import models
    
    # Register all API blueprints
    from app.api.products import products_bp
    from app.api.security_questions import security_questions_bp
    from app.api.checkout import checkout_bp
    from app.api.orders import orders_bp
    from app.api.admin_reset_password import admin_reset_bp
    from app.api.categories import categories_bp
    
    app.register_blueprint(products_bp)
    app.register_blueprint(security_questions_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_reset_bp)
    app.register_blueprint(categories_bp)
    
    @app.route('/')
    def home():
        return {"message": "Pambo Beauty Shop API"}
    
    return app
