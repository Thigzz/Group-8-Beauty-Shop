from datetime import datetime
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Integer, Text, DateTime
from server.app.extensions import db
from .base import Base, USE_POSTGRES, PG_UUID 

class Product(Base):
    __tablename__ = 'products'
    id = Column(PG_UUID if USE_POSTGRES else String(36), primary_key=True,default=uuid.uuid4 if USE_POSTGRES else lambda: str(uuid.uuid4()))
    product_name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    stock_qty = Column(Integer, nullable=False)
    image_url = Column(String(255))
    
    # Foreign keys
    category_id = Column(PG_UUID if USE_POSTGRES else String(36),
                         ForeignKey('categories.id'),
                         nullable=False)
    sub_category_id = Column(PG_UUID if USE_POSTGRES else String(36),
                             ForeignKey('sub_categories.id'),
                             nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    category = relationship("Category", back_populates="products")
    sub_category = relationship("SubCategory", back_populates="products")

    def __repr__(self):
        return f'<Product {self.product_name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'product_name': self.product_name,
            'description': self.description,
            'price': float(self.price),
            'stock_qty': self.stock_qty,
            'image_url': self.image_url,
            'category_id': str(self.category_id),
            'sub_category_id': str(self.sub_category_id),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
