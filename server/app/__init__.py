from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # DB configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///beauty_shop.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Import extensions
    from app.extensions import db, migrate, jwt, bcrypt
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db) 
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    
    # Import models AFTER extensions are initialized
    from app import models

    # Import and register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    @app.route('/')
    def home():
        return {"message": "Hello, World!"}
    
    return app