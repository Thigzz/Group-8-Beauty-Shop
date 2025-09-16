from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.extensions import db
from app.models.enums import *


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock_qty = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(255))
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id'), nullable=False)
    sub_category_id = db.Column(UUID(as_uuid=True), db.ForeignKey("sub_categories.id"), nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # relationships
    category = relationship("Category", back_populates="products")
    sub_category = relationship("SubCategory", back_populates="products")

    def __repr__(self):
        return f'<Product {self.product_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_name': self.product_name,
            'description': self.description,
            'price': float(self.price),
            'stock_qty': self.stock_qty,
            'image_url': self.image_url,
            'category_id': self.category_id,
            'sub_category_id': str(self.sub_category_id),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }