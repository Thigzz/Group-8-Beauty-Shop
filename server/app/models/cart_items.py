import uuid
from sqlalchemy import Column, Integer, ForeignKey, Enum, Numeric, String
from sqlalchemy.orm import relationship
from server.app.extensions import db
from server.app.models.enums import CartItemStatus
from .base import Base, GUID

class CartItem(Base):
    __tablename__ = "cart_items"
    cart_id =Column(GUID(), ForeignKey("carts.id"), nullable=False)
    product_id =Column(GUID(), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(Enum(CartItemStatus), default=CartItemStatus.active, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", backref="cart_items")