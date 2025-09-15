from datetime import datetime
from app import db
import uuid

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock_qty = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(255))
    category_id = db.Column(db.String(36), db.ForeignKey('categories.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
