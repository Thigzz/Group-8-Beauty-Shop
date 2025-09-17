import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from server.app.extensions import db
import os

# Determine if we are using Postgres
USE_POSTGRES = os.getenv("DATABASE_URL", "").startswith("postgres")

class Base(db.Model):
    __abstract__ = True

    if USE_POSTGRES:
        id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    else:
        id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    created_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
