import uuid
from sqlalchemy import Column, Integer, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.extensions import db
from .base import Base, USE_POSTGRES, PG_UUID

class OrderItem(Base):
    __tablename__ = "order_items"
    order_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("orders.id"), nullable=False)
    product_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    sub_total = Column(Numeric(10, 2))

    order = relationship("Order", back_populates="items")
    product = relationship("Product", backref="order_items")
