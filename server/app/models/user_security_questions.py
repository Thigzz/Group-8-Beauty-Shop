import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.extensions import db
from .base import Base, USE_POSTGRES, PG_UUID

class UserSecurityQuestion(Base):
    __tablename__ = "user_security_questions"
    user_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("users.id"), nullable=False)
    question_id =Column(PG_UUID(as_uuid=True) if USE_POSTGRES else String(36), ForeignKey("security_questions.id"), nullable=False)
    answer_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="security_questions")
    security_question = relationship("SecurityQuestion", back_populates="user_answers")
