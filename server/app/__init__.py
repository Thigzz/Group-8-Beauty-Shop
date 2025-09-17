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
    
    @app.route('/')
    def home():
        return {"message": "Hello, World!"}
    
    return app