import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.app.extensions import db
from .base import Base, GUID

class PasswordResetAudit(Base):
    __tablename__ = "password_reset_audit"
    user_id =Column(GUID(), ForeignKey("users.id"), nullable=False)
    admin_id =Column(GUID(), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)

    user = relationship("User", foreign_keys=[user_id], backref="password_reset_actions")
    admin = relationship("User", foreign_keys=[admin_id], backref="password_reset_performed")