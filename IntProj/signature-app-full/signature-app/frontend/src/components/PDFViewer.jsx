import { useState, useRef } from 'react'

// NOTE: In production wire up react-pdf here.
// This component renders a mock PDF with real click-to-place logic.
// Replace MockPDFContent with <Document><Page /></Document> from react-pdf.

function MockPDFContent() {
  return (
    <div
      className="w-full bg-white rounded shadow-2xl"
      style={{ color: '#333', fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.8, padding: '3rem', minHeight: 700 }}
    >
      <h2 style={{ fontSize: 18, textAlign: 'center', marginBottom: '1.5rem', color: '#111' }}>
        EMPLOYMENT AGREEMENT
      </h2>
      <p style={{ marginBottom: '1rem' }}>
        This Employment Agreement ("Agreement") is entered into as of January 1, 2025, between{' '}
        <strong>Acme Corporation</strong> ("Employer") and the undersigned employee ("Employee").
      </p>
      <p style={{ marginBottom: '1rem' }}>
        <strong>1. Position.</strong> Employee agrees to serve in the role of Software Engineer.
        Primary responsibilities shall include software development, code review, and technical
        collaboration as directed by management.
      </p>
      <p style={{ marginBottom: '1rem' }}>
        <strong>2. Compensation.</strong> Employer agrees to pay Employee a base salary of $120,000
        USD per annum, payable bi-weekly, subject to applicable tax withholdings and deductions.
      </p>
      <p style={{ marginBottom: '1rem' }}>
        <strong>3. Confidentiality.</strong> Employee acknowledges that during employment, Employee
        will have access to proprietary and confidential information of Employer. Employee agrees to
        maintain strict confidentiality and not disclose any such information.
      </p>
      <p style={{ marginBottom: '1rem' }}>
        <strong>4. Term.</strong> This Agreement shall commence January 1, 2025, and continue unless
        terminated by either party upon thirty (30) days written notice.
      </p>
      <p style={{ marginBottom: '3rem' }}>
        <strong>5. Governing Law.</strong> This Agreement shall be governed by the laws of the State
        of California, without regard to its conflict of law principles.
      </p>
      <div
        style={{
          borderTop: '1px solid #333',
          paddingTop: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#666',
        }}
      >
        <span>Employee Signature ______________________</span>
        <span>Date ___________________</span>
      </div>
    </div>
  )
}

export default function PDFViewer({ docName, onPlaceSignature, signatures, onRemoveSignature }) {
  const wrapRef = useRef(null)
  const [page, setPage] = useState(1)
  const totalPages = 1 // Update when wiring real PDF

  const handleClick = (e) => {
    const wrap = wrapRef.current
    if (!wrap) return
    // Only place if click is on the PDF content itself
    if (e.target === wrap || wrap.contains(e.target)) {
      const rect = wrap.getBoundingClientRect()
      const x = e.clientX - rect.left + wrap.scrollLeft
      const y = e.clientY - rect.top + wrap.scrollTop
      onPlaceSignature?.({ x, y, page })
    }
  }

  return (
    <div className="flex flex-col bg-surface border border-border rounded-lg overflow-hidden h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface2 border-b border-border">
        <span className="text-sm font-semibold text-muted">📄 {docName || 'Document.pdf'}</span>
        <div className="flex items-center gap-2 ml-auto text-xs text-muted">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-0.5 bg-surface3 border border-border2 rounded text-xs"
          >
            ‹
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-0.5 bg-surface3 border border-border2 rounded text-xs"
          >
            ›
          </button>
        </div>
        <span className="text-xs text-muted/60 hidden md:block">Click document to place signature</span>
      </div>

      {/* PDF Area */}
      <div
        ref={wrapRef}
        className="flex-1 overflow-auto flex items-start justify-center p-6 cursor-crosshair relative"
        onClick={handleClick}
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
          <MockPDFContent />

          {/* Signature fields overlay */}
          {signatures.map((sig) => (
            <div
              key={sig.id}
              style={{
                position: 'absolute',
                left: sig.x,
                top: sig.y,
                width: sig.w || 160,
                height: sig.h || 60,
                border: '2px solid #52c278',
                borderRadius: 4,
                background: 'rgba(82,194,120,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={sig.data}
                alt="signature"
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
              />
              <button
                onClick={() => onRemoveSignature(sig.id)}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#e05252',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
