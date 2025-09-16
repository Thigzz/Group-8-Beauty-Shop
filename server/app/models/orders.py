import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Enum, Numeric, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.extensions import db
from app.models.enums import OrderStatus




class Order(db.Model):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cart_id = Column(UUID(as_uuid=True), ForeignKey("carts.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=func.now())

    cart = relationship("Cart", backref="order")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
