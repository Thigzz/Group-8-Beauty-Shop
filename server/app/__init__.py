from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # DB configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///beauty_shop.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Import extensions
    from app.extensions import db, migrate
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db) 
    CORS(app)
    
    # Import models AFTER extensions are initialized
    from app import models
    
    # Register all route blueprints (updated to use routes folder)
    from app.routes.products import products_bp
    from app.routes.security_questions import security_questions_bp
    from app.routes.checkout import checkout_bp
    from app.routes.orders import orders_bp
    from app.routes.admin_reset_password import admin_reset_bp
    from app.routes.categories import categories_bp
    from app.routes.analytics import analytics_bp
    
    app.register_blueprint(products_bp)
    app.register_blueprint(security_questions_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_reset_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(analytics_bp)
    
    @app.route('/')
    def home():
        return {"message": "Pambo Beauty Shop API"}
    
    return app
