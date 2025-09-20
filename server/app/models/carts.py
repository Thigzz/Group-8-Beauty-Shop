import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Enum, func, String
from sqlalchemy.orm import relationship
from server.app.extensions import db
from server.app.models.enums import CartStatus
from .base import Base, GUID

class Cart(Base):
    __tablename__ = "carts"
    user_id = Column(GUID(), ForeignKey("users.id"),nullable=True)
    status = Column(Enum(CartStatus), default=CartStatus.open, nullable=False)

# session_id for guest carts
    session_id = Column(String(128), nullable=True)

    user = relationship("User", back_populates="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")