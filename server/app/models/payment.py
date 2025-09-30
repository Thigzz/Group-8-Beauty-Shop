import uuid
from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from server.app.extensions import db
from .base import Base, GUID
from .enums import PaymentMethod, PaymentStatus

class Payment(Base):
    __tablename__ = 'payments'
    invoice_id = Column(String, ForeignKey('invoices.id'), nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), default=PaymentMethod.mpesa)
    amount = Column(Numeric(10, 2), nullable=False)
    transaction_id = Column(String, unique=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)

    invoice = relationship('Invoice', backref='payment')

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'payment_method': self.payment_method.value,
            'amount': float(self.amount),
            'transaction_id': self.transaction_id,
            'status': self.status.value
        }