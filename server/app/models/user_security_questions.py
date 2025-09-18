import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.app.extensions import db
from .base import Base, GUID

class UserSecurityQuestion(Base):
    __tablename__ = "user_security_questions"
    user_id =Column(GUID(), ForeignKey("users.id"), nullable=False)
    question_id =Column(GUID(), ForeignKey("security_questions.id"), nullable=False)
    answer_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="security_questions")
    security_question = relationship("SecurityQuestion", back_populates="user_answers")