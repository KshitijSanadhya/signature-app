from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from models.signature import SignatureType


class SignatureCreate(BaseModel):
    document_id: str
    signer_name: Optional[str] = None
    signer_email: Optional[str] = None
    signature_type: SignatureType = SignatureType.DRAWN
    signature_data: str   # Base64 PNG
    page_number: int
    x_position: float
    y_position: float
    width: float = 200.0
    height: float = 80.0


class SignatureOut(BaseModel):
    id: str
    document_id: str
    signer_name: Optional[str]
    signer_email: Optional[str]
    signature_type: SignatureType
    page_number: int
    x_position: float
    y_position: float
    width: float
    height: float
    signed_at: datetime

    model_config = {"from_attributes": True}


class FinalizeRequest(BaseModel):
    document_id: str


class FinalizeResponse(BaseModel):
    message: str
    document_id: str
    download_url: str
