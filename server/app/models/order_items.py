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
        # The frontend expects the product details nested inside a "product" object.
        # This method now provides that structure directly.
        product_details = None
        if self.product:
            product_details = {
                "id": str(self.product.id),
                "name": self.product.product_name, # Correctly maps product_name to name
                "image_url": self.product.image_url
            }

        return {
            "product_id": str(self.product_id),
            "quantity": self.quantity,
            "price": float(self.price),
            "sub_total": float(self.sub_total) if self.sub_total else None,
            "product": product_details # Nest the product details under "product"
    }