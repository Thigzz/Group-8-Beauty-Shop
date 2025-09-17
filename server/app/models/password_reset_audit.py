import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.extensions import db
from .base import Base, USE_POSTGRES, PG_UUID


class PasswordResetAudit(Base):
    __tablename__ = "password_reset_audit"
    user_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("users.id"), nullable=False)
    admin_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)

    user = relationship("User", foreign_keys=[user_id], backref="password_reset_actions")
    admin = relationship("User", foreign_keys=[admin_id], backref="password_reset_performed")
