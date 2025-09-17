import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Enum, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import enum
from app.extensions import db, bcrypt


class UserRole(enum.Enum):
    customer = "customer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    primary_phone_no = Column(String, nullable=False)
    secondary_phone_no = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.customer)
    password_hash = Column(String, nullable=False)

    last_loggedin_date = Column(TIMESTAMP, nullable=True)
    is_active = Column(Boolean, default=True)
    force_password_reset = Column(Boolean, default=False)

    # Relationships section
    addresses = relationship("Address", back_populates="user")
    security_questions = relationship("UserSecurityQuestion", back_populates="user")
    carts = relationship("Cart", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)