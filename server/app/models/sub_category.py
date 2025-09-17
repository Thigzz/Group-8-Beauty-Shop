import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from server.app.extensions import db
from .base import Base, USE_POSTGRES, PG_UUID


class SubCategory(Base):
    __tablename__ = "sub_categories"
    category_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("categories.id"), nullable=False)
    sub_category_name = Column(String, nullable=False)

    category = relationship("Category", back_populates="sub_categories")
    products = relationship("Product", back_populates="sub_category")
