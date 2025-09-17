import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Enum, Numeric, func, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from server.app.extensions import db
from server.app.models.enums import OrderStatus
from .base import Base, USE_POSTGRES, PG_UUID


class Order(Base):
    __tablename__ = "orders"
    cart_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("carts.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=func.now())

    cart = relationship("Cart", backref="order")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
