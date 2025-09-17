from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # DB configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///beauty_shop.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "a_default_secret_key")
    
    # Import extensions
    from app.extensions import db, migrate, jwt, bcrypt
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db) 
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    
    # Import models
    from app.models.users import User

    # This function is called whenever a protected endpoint is accessed and returns the user object that the token belongs to.
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(username=identity).one_or_none()

    # Import and register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    @app.route('/')
    def home():
        return {"message": "Hello, World!"}
    
    return app