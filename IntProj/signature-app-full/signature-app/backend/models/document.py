from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from database import Base


class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    SIGNED = "signed"
    EXPIRED = "expired"


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    signed_file_path = Column(String, nullable=True)
    page_count = Column(Integer, default=1)
    status = Column(SAEnum(DocumentStatus), default=DocumentStatus.DRAFT)
    signing_token = Column(String, unique=True, nullable=True)
    signing_token_expires = Column(DateTime(timezone=True), nullable=True)
    signer_email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="documents")
    signatures = relationship("Signature", back_populates="document", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="document", cascade="all, delete-orphan")
