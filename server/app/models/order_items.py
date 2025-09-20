import uuid
from sqlalchemy import Column, Integer, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship
from server.app.extensions import db
from .base import Base, GUID

class OrderItem(Base):
    __tablename__ = "order_items"
    order_id =Column(GUID(), ForeignKey("orders.id"), nullable=False)
    product_id =Column(GUID(), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    sub_total = Column(Numeric(10, 2))

    order = relationship("Order", back_populates="items")
    product = relationship("Product", backref="order_items")