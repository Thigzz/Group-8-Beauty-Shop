import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from server.app.extensions import db
from .base import Base, USE_POSTGRES, PG_UUID

class SecurityQuestion(Base):
    __tablename__ = "security_questions"
    question = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

    user_answers = relationship("UserSecurityQuestion", back_populates="security_question")
