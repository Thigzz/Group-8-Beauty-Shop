from flask import Flask
from flask_cors import CORS
import os
import click
from flask.cli import with_appcontext

def create_app():
    """
    Application factory function to create and configure the Flask app.
    """
    instance_path = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')), 'instance')
    app = Flask(__name__, instance_path=instance_path)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    db_path = os.path.join(app.instance_path, "beauty_shop.db")
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "a_super_secret_key_for_dev")
    
    from server.app.extensions import db, migrate, jwt, bcrypt
    
    db.init_app(app)
    migrate.init_app(app, db) 
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # CORRECTED: Apply CORS to all routes ("/*") to include /auth, /api, etc.
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "https://pambo.onrender.com"]}}, supports_credentials=True)
    
    from server.app.models.users import User
    from server.app import models 

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.filter_by(username=identity).one_or_none()

    # --- Register Blueprints ---
    from server.app.routes.auth import auth_bp
    from server.app.routes.products import products_bp
    from server.app.routes.security_questions import security_questions_bp
    from server.app.routes.checkout import checkout_bp
    from server.app.routes.orders import orders_bp
    from server.app.routes.admin_reset_password import admin_reset_bp
    from server.app.routes.categories import categories_bp
    from server.app.routes.admin import admin_bp
    from server.app.routes.cart import cart_bp
    from server.app.routes.reports import reports_bp
    from server.app.routes.analytics import analytics_bp
    from server.app.routes.addresses import addresses_bp
    from server.app.routes.sub_categories import sub_categories_bp
    from server.app.routes.search import search_bp


    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(security_questions_bp)
    app.register_blueprint(checkout_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_reset_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(addresses_bp)
    app.register_blueprint(sub_categories_bp)
    app.register_blueprint(search_bp)

    
    @app.cli.command("init-db")
    @with_appcontext
    def init_db_command():
        """Creates the database tables."""
        db.create_all()
        click.echo("Initialized the database.")

    @app.cli.command("seed-db")
    @with_appcontext
    def seed_db_command():
        """Seeds the database."""
        from server.app.seed import seed_data
        seed_data()
        click.echo("Seeded the database.")

    @app.route('/')
    def home():
        return {"message": "Welcome to the Pambo Beauty Shop API"}
    
    return app