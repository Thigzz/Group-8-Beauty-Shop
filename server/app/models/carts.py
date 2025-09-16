import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.extensions import db
from app.models.enums import CartStatus  

class Cart(db.Model):
    __tablename__ = "carts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(CartStatus), default=CartStatus.open, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", backref="carts")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
