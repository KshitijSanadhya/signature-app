from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from models.document import Document, DocumentStatus
from models.signature import Signature
from schemas.signature import SignatureCreate, SignatureOut, FinalizeRequest, FinalizeResponse
from services.pdf_service import embed_signatures_into_pdf, get_signed_pdf_path
from services.audit_service import log_event
from typing import List
import os

router = APIRouter(prefix="/api/signatures", tags=["Signatures"])


@router.post("", response_model=SignatureOut, status_code=201)
async def create_signature(
    payload: SignatureCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Save a signature to a document.
    Works both for authenticated owners and public signers (via signing link).
    """
    doc = db.query(Document).filter(Document.id == payload.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    sig = Signature(
        document_id=payload.document_id,
        signer_name=payload.signer_name,
        signer_email=payload.signer_email,
        signature_type=payload.signature_type,
        signature_data=payload.signature_data,
        page_number=payload.page_number,
        x_position=payload.x_position,
        y_position=payload.y_position,
        width=payload.width,
        height=payload.height,
        ip_address=request.client.host if request.client else None,
    )
    db.add(sig)
    db.commit()
    db.refresh(sig)

    log_event(
        db, document_id=doc.id, event_type="signature_placed",
        actor_email=payload.signer_email,
        event_detail=f"Signature placed on page {payload.page_number}",
        ip_address=request.client.host if request.client else None,
    )

    return sig


@router.get("/{doc_id}", response_model=List[SignatureOut])
async def get_signatures(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all signatures for a document."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return db.query(Signature).filter(Signature.document_id == doc_id).all()


@router.post("/finalize", response_model=FinalizeResponse)
async def finalize_document(
    payload: FinalizeRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Embed all signatures into the PDF and lock the document."""
    doc = db.query(Document).filter(Document.id == payload.document_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status == DocumentStatus.SIGNED:
        raise HTTPException(status_code=400, detail="Document is already finalized")

    signatures = db.query(Signature).filter(Signature.document_id == doc.id).all()
    if not signatures:
        raise HTTPException(status_code=400, detail="No signatures found to embed")

    output_path = get_signed_pdf_path(doc.id, doc.filename)
    success = embed_signatures_into_pdf(doc.file_path, output_path, signatures)

    if not success:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    doc.signed_file_path = output_path
    doc.status = DocumentStatus.SIGNED
    db.commit()

    log_event(
        db, document_id=doc.id, event_type="finalized",
        user_id=current_user.id, actor_email=current_user.email,
        event_detail=f"Document finalized with {len(signatures)} signature(s)",
        ip_address=request.client.host if request.client else None,
    )

    download_url = f"{request.base_url}api/docs/{doc.id}/download?signed=true"
    return FinalizeResponse(
        message="Document finalized successfully",
        document_id=doc.id,
        download_url=download_url,
    )


@router.post("/sign-with-token")
async def sign_with_token(
    token: str,
    payload: SignatureCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Public signing endpoint — used when signer clicks a signing link."""
    from datetime import datetime
    doc = db.query(Document).filter(Document.signing_token == token).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Invalid or expired signing link")

    if doc.signing_token_expires and doc.signing_token_expires < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Signing link has expired")

    payload.document_id = doc.id
    sig = Signature(
        document_id=doc.id,
        signer_name=payload.signer_name,
        signer_email=payload.signer_email,
        signature_type=payload.signature_type,
        signature_data=payload.signature_data,
        page_number=payload.page_number,
        x_position=payload.x_position,
        y_position=payload.y_position,
        width=payload.width,
        height=payload.height,
        ip_address=request.client.host if request.client else None,
    )
    db.add(sig)
    doc.status = DocumentStatus.SIGNED
    db.commit()

    log_event(
        db, document_id=doc.id, event_type="signed_via_link",
        actor_email=payload.signer_email,
        event_detail="Document signed via public signing link",
        ip_address=request.client.host if request.client else None,
    )

    return {"message": "Document signed successfully", "document_id": doc.id}
