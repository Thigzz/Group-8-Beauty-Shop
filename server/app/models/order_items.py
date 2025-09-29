import uuid
from sqlalchemy import Column, Integer, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship
from server.app.extensions import db
from .base import Base, GUID
from sqlalchemy.orm import validates

class OrderItem(Base):
    __tablename__ = "order_items"
    order_id =Column(GUID(), ForeignKey("orders.id"), nullable=False)
    product_id =Column(GUID(), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    sub_total = Column(Numeric(10, 2))

    order = relationship("Order", back_populates="items")
    product = relationship("Product", backref="order_items")

    def to_dict(self):
        return {
        "product_id": str(self.product_id),
        "quantity": self.quantity,
        "price": float(self.price),
        "sub_total": float(self.sub_total) if self.sub_total else None,
        "product": self.product.to_dict() if self.product else None,
        "product_name": self.product.product_name if self.product else None,
        "sub_total": float(self.sub_total) if self.sub_total else None,
    }
