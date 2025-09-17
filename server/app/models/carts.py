import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Enum, func, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.extensions import db
from app.models.enums import CartStatus  
from .base import Base, USE_POSTGRES, PG_UUID


class Cart(Base):
    __tablename__ = "carts"
    user_id = Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("users.id"),nullable=False)
    status = Column(Enum(CartStatus), default=CartStatus.open, nullable=False)

    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
