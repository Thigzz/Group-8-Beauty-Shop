import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, GUID
from server.app.extensions import db

class Address(Base):
    __tablename__ = "addresses"
    user_id = Column(GUID(), ForeignKey("users.id"),nullable=False)
    address_line_1 = Column(String, nullable=False)
    address_line_2 = Column(String, nullable=True)
    city = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)

    # Relationships section
    user = relationship("User", back_populates="addresses")