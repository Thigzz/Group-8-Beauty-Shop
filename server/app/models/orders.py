import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Enum, Numeric, func, String
from sqlalchemy.orm import relationship
from server.app.extensions import db
from server.app.models.enums import OrderStatus
from .base import Base, GUID

class Order(Base):
    __tablename__ = "orders"
    cart_id =Column(GUID(), ForeignKey("carts.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=func.now())

    cart = relationship("Cart", backref="order")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")