import uuid
from datetime import datetime
from sqlalchemy import Column, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

class Base(db.Model):
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)