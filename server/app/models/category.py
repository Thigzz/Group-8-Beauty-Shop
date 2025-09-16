import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base




class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_name = Column(String, nullable=False)

 # relationships
    sub_categories = relationship("SubCategory", back_populates="category")
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")