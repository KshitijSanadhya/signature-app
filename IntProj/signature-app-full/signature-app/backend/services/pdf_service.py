import fitz  # PyMuPDF
import base64
import io
import os
from PIL import Image
from typing import List
from models.signature import Signature


UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")


def get_pdf_page_count(file_path: str) -> int:
    """Return the number of pages in a PDF."""
    try:
        doc = fitz.open(file_path)
        count = doc.page_count
        doc.close()
        return count
    except Exception:
        return 1


def embed_signatures_into_pdf(
    source_pdf_path: str,
    output_pdf_path: str,
    signatures: List[Signature]
) -> bool:
    """
    Embed signature images into the PDF at the specified positions.
    Positions are stored as percentages of page dimensions.
    """
    try:
        doc = fitz.open(source_pdf_path)

        for sig in signatures:
            if not sig.signature_data:
                continue

            # Decode base64 signature image
            img_data = sig.signature_data
            if "," in img_data:
                img_data = img_data.split(",")[1]

            img_bytes = base64.b64decode(img_data)

            # Get target page (0-indexed)
            page_idx = sig.page_number - 1
            if page_idx < 0 or page_idx >= doc.page_count:
                continue

            page = doc[page_idx]
            page_rect = page.rect

            # Convert percentage positions to absolute pixel coords
            x = (sig.x_position / 100) * page_rect.width
            y = (sig.y_position / 100) * page_rect.height
            w = (sig.width / 100) * page_rect.width
            h = (sig.height / 100) * page_rect.height

            rect = fitz.Rect(x, y, x + w, y + h)

            # Insert image
            page.insert_image(rect, stream=img_bytes)

            # Add a subtle annotation line below the signature
            line_y = y + h + 2
            page.draw_line(
                fitz.Point(x, line_y),
                fitz.Point(x + w, line_y),
                color=(0.4, 0.4, 0.4),
                width=0.5
            )

            # Add signer name below line if available
            if sig.signer_name:
                page.insert_text(
                    fitz.Point(x, line_y + 10),
                    f"Signed by: {sig.signer_name}",
                    fontsize=7,
                    color=(0.4, 0.4, 0.4)
                )

        # Save the finalized PDF
        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
        doc.save(output_pdf_path, garbage=4, deflate=True)
        doc.close()
        return True

    except Exception as e:
        print(f"PDF embedding error: {e}")
        return False


def save_uploaded_pdf(file_bytes: bytes, filename: str, document_id: str) -> str:
    """Save uploaded PDF to disk and return path."""
    doc_dir = os.path.join(UPLOAD_DIR, document_id)
    os.makedirs(doc_dir, exist_ok=True)
    file_path = os.path.join(doc_dir, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return file_path


def get_signed_pdf_path(document_id: str, filename: str) -> str:
    """Get the output path for a signed PDF."""
    doc_dir = os.path.join(UPLOAD_DIR, document_id)
    os.makedirs(doc_dir, exist_ok=True)
    base = os.path.splitext(filename)[0]
    return os.path.join(doc_dir, f"{base}_signed.pdf")
