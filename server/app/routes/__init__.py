from flask import Flask
from app.extensions import db
from app.routes.orders import orders_bp
from app.routes.admin_reset_password import admin_reset_bp
from app.routes.categories import categories_bp

def create_app():
    app = Flask(__name__)
    db.init_app(app)

    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_reset_bp)
    app.register_blueprint(categories_bp)

    return app
