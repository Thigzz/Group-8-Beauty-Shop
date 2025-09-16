import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.extensions import db



class PasswordResetAudit(db.Model):
    __tablename__ = "password_reset_audit"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="password_reset_actions")
    admin = relationship("User", foreign_keys=[admin_id], backref="password_reset_performed")
