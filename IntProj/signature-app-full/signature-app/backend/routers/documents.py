from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from models.document import Document, DocumentStatus
from schemas.document import DocumentOut, DocumentListOut, SendSigningLinkRequest, SendSigningLinkResponse
from services.pdf_service import save_uploaded_pdf, get_pdf_page_count
from services.audit_service import log_event
import uuid
import os
import secrets
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/docs", tags=["Documents"])

ALLOWED_TYPES = {"application/pdf"}
MAX_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF document."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {os.getenv('MAX_FILE_SIZE_MB', 10)}MB limit")

    document_id = str(uuid.uuid4())
    file_path = save_uploaded_pdf(content, file.filename, document_id)
    page_count = get_pdf_page_count(file_path)

    doc = Document(
        id=document_id,
        owner_id=current_user.id,
        title=file.filename.replace(".pdf", "").replace("_", " ").title(),
        filename=file.filename,
        file_path=file_path,
        page_count=page_count,
        status=DocumentStatus.DRAFT,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    log_event(
        db,
        document_id=doc.id,
        event_type="uploaded",
        user_id=current_user.id,
        actor_email=current_user.email,
        event_detail=f"Document '{doc.title}' uploaded ({page_count} pages)",
        ip_address=request.client.host if request.client else None,
    )

    return doc


@router.get("", response_model=DocumentListOut)
async def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents for the current user."""
    docs = db.query(Document).filter(Document.owner_id == current_user.id).order_by(Document.created_at.desc()).all()
    return DocumentListOut(documents=docs, total=len(docs))


@router.get("/{doc_id}", response_model=DocumentOut)
async def get_document(
    doc_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single document by ID."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    log_event(
        db, document_id=doc.id, event_type="viewed",
        user_id=current_user.id, actor_email=current_user.email,
        ip_address=request.client.host if request.client else None,
    )
    return doc


@router.get("/{doc_id}/download")
async def download_document(
    doc_id: str,
    signed: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download the original or signed PDF."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if signed and doc.signed_file_path and os.path.exists(doc.signed_file_path):
        return FileResponse(doc.signed_file_path, media_type="application/pdf", filename=f"signed_{doc.filename}")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(doc.file_path, media_type="application/pdf", filename=doc.filename)


@router.post("/send-link", response_model=SendSigningLinkResponse)
async def send_signing_link(
    payload: SendSigningLinkRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a signing link for a document."""
    doc = db.query(Document).filter(Document.id == payload.document_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    token = secrets.token_urlsafe(32)
    doc.signing_token = token
    doc.signer_email = payload.signer_email
    doc.status = DocumentStatus.SENT
    doc.signing_token_expires = datetime.utcnow() + timedelta(days=7)
    db.commit()

    signing_url = f"{request.base_url}sign/{token}"

    log_event(
        db, document_id=doc.id, event_type="link_sent",
        user_id=current_user.id, actor_email=current_user.email,
        event_detail=f"Signing link sent to {payload.signer_email}",
        ip_address=request.client.host if request.client else None,
    )

    return SendSigningLinkResponse(
        signing_token=token,
        signing_url=signing_url,
        signer_email=payload.signer_email,
    )


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
