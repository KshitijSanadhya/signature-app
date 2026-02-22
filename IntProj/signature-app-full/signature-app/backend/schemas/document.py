from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from models.document import DocumentStatus


class DocumentOut(BaseModel):
    id: str
    title: str
    filename: str
    page_count: int
    status: DocumentStatus
    signer_email: Optional[str]
    signing_token: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DocumentListOut(BaseModel):
    documents: List[DocumentOut]
    total: int


class SendSigningLinkRequest(BaseModel):
    document_id: str
    signer_email: EmailStr
    signer_name: Optional[str] = None


class SendSigningLinkResponse(BaseModel):
    signing_token: str
    signing_url: str
    signer_email: str
