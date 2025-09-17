from datetime import datetime
from server.app.extensions import db
from server.app.models.enums import PaymentStatus
import uuid
from server.app.extensions import db
from .base import Base, USE_POSTGRES, PG_UUID
from sqlalchemy import Column, String, Boolean, ForeignKey


class Invoice(Base):
    __tablename__ = 'invoices'
    invoice_number = db.Column(db.String(255), nullable=False, unique=True)
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.pending)
    paid_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Invoice {self.invoice_number}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'order_id': self.order_id,
            'user_id': self.user_id,
            'amount': float(self.amount),
            'payment_status': self.payment_status.value if self.payment_status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }
