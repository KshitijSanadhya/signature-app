from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from database import Base


class SignatureType(str, enum.Enum):
    DRAWN = "drawn"
    TYPED = "typed"
    IMAGE = "image"


class Signature(Base):
    __tablename__ = "signatures"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    signer_name = Column(String, nullable=True)
    signer_email = Column(String, nullable=True)
    signature_type = Column(SAEnum(SignatureType), default=SignatureType.DRAWN)
    signature_data = Column(Text, nullable=True)   # Base64 PNG data
    page_number = Column(Integer, nullable=False)
    x_position = Column(Float, nullable=False)     # As percentage of page width
    y_position = Column(Float, nullable=False)     # As percentage of page height
    width = Column(Float, default=200.0)
    height = Column(Float, default=80.0)
    signed_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String, nullable=True)

    # Relationships
    document = relationship("Document", back_populates="signatures")
