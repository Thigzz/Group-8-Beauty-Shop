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
    
    @property
    def customer(self):
        return self.cart.user if self.cart else None

    # This is the single, corrected to_dict method
    def to_dict(self, include_items=False, include_customer=False):
        data = {
            "id": str(self.id),
            "cart_id": str(self.cart_id),
            "status": self.status.name,
            "total_amount": float(self.total_amount),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        # DO NOT DELETE OR ALTER THE BELOW LINES!!!
        # This logic handles two scenarios:
        # 1. The main order list which accesses customer via self.cart.user
        # 2. The admin detail view which can use include_customer
        customer_data = self.customer
        if include_customer and customer_data:
            data["customer"] = {
                "id": str(customer_data.id),
                "first_name": customer_data.first_name,
                "last_name": customer_data.last_name,
                "primary_phone_no": customer_data.primary_phone_no,
                "username": customer_data.username,    
                "email": customer_data.email, 
            }

        elif self.cart and self.cart.user:
             data["customer"] = {
                "first_name": self.cart.user.first_name,
                "last_name": self.cart.user.last_name,
                "primary_phone_no": self.cart.user.primary_phone_no,
                "username": self.cart.user.username,    
                "email": self.cart.user.email, 
            }


        if include_items:
            data["items"] = [item.to_dict() for item in self.items]

        return data