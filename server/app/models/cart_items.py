import uuid
from sqlalchemy import Column, Integer, ForeignKey, Enum, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.extensions import db
from app.models.enums import CartItemStatus
from .base import Base, USE_POSTGRES, PG_UUID

class CartItem(Base):
    __tablename__ = "cart_items"
    cart_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("carts.id"), nullable=False)
    product_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(Enum(CartItemStatus), default=CartItemStatus.active, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", backref="cart_items")
