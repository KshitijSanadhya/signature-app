from sqlalchemy.orm import Session
from models.audit_log import AuditLog
from typing import Optional


def log_event(
    db: Session,
    document_id: str,
    event_type: str,
    user_id: Optional[str] = None,
    actor_email: Optional[str] = None,
    event_detail: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> AuditLog:
    """Create an audit log entry."""
    log = AuditLog(
        document_id=document_id,
        user_id=user_id,
        event_type=event_type,
        actor_email=actor_email,
        event_detail=event_detail,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_audit_logs(db: Session, document_id: str):
    """Retrieve all audit logs for a document, newest first."""
    return (
        db.query(AuditLog)
        .filter(AuditLog.document_id == document_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )
