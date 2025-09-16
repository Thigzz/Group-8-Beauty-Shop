import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Enum, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base
import enum


class UserRole(enum.Enum):
    customer = "customer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    primary_phone_no = Column(String, nullable=False)
    secondary_phone_no = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.customer)
    password_hash = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_loggedin_date = Column(TIMESTAMP, nullable=True)
    is_active = Column(Boolean, default=True)
    force_password_reset = Column(Boolean, default=False)

    # Relationships section
    addresses = relationship("Address", back_populates="user")