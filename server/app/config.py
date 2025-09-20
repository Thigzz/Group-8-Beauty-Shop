import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "a_default_secret_key")

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///Pambo.db"
    JWT_COOKIE_SECURE = False         
    JWT_COOKIE_SAMESITE = "Lax"       


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("sqlite:///beauty_shop.db")
    JWT_COOKIE_SECURE = True          
    JWT_COOKIE_SAMESITE = "None" 