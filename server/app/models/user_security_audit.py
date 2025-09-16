import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.extensions import db


class UserSecurityAudit(db.Model):
    __tablename__ = "user_security_audit"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("security_questions.id"))
    action = Column(String, nullable=False)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="security_audits")
    question = relationship("SecurityQuestion", backref="security_audits")
    performed_by_user = relationship("User", foreign_keys=[performed_by], backref="security_actions")
