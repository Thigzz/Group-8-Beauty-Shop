import uuid
from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from server.app.extensions import db
from .base import Base, GUID
from .enums import PaymentStatus

class Invoice(Base):
    __tablename__ = 'invoices'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey('orders.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    invoice_number = Column(String, unique=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    paid_at = Column(DateTime, nullable=True)

    order = relationship('Order', backref='invoice')
    user = relationship('User', backref='invoices')

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'user_id': self.user_id,
            'invoice_number': self.invoice_number,
            'amount': float(self.amount),
            'payment_status': self.payment_status.value,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }