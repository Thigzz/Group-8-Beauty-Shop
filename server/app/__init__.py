import os
from flask import Flask
from .extensions import db, migrate
from app.config import  DevelopmentConfig, ProductionConfig
from app import models  

def create_app():
    app = Flask(__name__)

 # config class based on FLASK_ENV
    env = os.getenv("FLASK_ENV", "development")
    if env == "production":
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    db.init_app(app)
    migrate.init_app(app, db)


    return app
