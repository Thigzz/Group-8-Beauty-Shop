import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.app.extensions import db
from .base import Base, GUID

class UserSecurityAudit(Base):
    __tablename__ = "user_security_audit"
    user_id =Column(GUID(), ForeignKey("users.id"), nullable=False)
    question_id =Column(GUID(), ForeignKey("security_questions.id"))
    action = Column(String, nullable=False)
    performed_by =Column(GUID(), ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id], backref="security_audits")
    question = relationship("SecurityQuestion", backref="security_audits")
    performed_by_user = relationship("User", foreign_keys=[performed_by], backref="security_actions")