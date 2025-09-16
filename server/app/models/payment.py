from datetime import datetime
from app.extensions import db
from app.models.enums import PaymentMethod
import uuid

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id = db.Column(db.String(36), db.ForeignKey('invoices.id'), nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), default=PaymentMethod.mpesa)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_id = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Payment {self.transaction_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'payment_method': self.payment_method.value if self.payment_method else None,
            'amount': float(self.amount),
            'transaction_id': self.transaction_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
