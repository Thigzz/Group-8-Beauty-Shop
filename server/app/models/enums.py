from enum import Enum

class UserRole(Enum):
    customer = "customer"
    admin = "admin"

class OrderStatus(Enum):
    pending = "pending"
    paid = "paid"
    dispatched = "dispatched"
    delivered = "delivered"
    cancelled = "cancelled"

class PaymentMethod(Enum):
    mpesa = "mpesa"
    cash = "Cash"
    credit_card = "credit_card"
    debit_card = "debit_card"
    voucher = "voucher"

class PaymentStatus(Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"

class CartStatus(Enum):
    open = "open"
    closed = "closed"

class CartItemStatus(Enum):
    active = "active"
    closed = "closed"
    removed = "removed"
