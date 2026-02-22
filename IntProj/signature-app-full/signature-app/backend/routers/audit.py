from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from models.document import Document
from models.audit_log import AuditLog
from services.audit_service import get_audit_logs
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/api/audit", tags=["Audit"])


class AuditLogOut(BaseModel):
    id: str
    document_id: str
    event_type: str
    event_detail: Optional[str]
    actor_email: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("/{doc_id}", response_model=List[AuditLogOut])
async def get_document_audit(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the full audit trail for a document."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    logs = get_audit_logs(db, doc_id)
    return logs
