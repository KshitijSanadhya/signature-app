import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { docsApi, sigApi } from '../utils/api'
import { downloadBlob } from '../utils/helpers'
import PageHeader from '../components/PageHeader'
import PDFViewer from '../components/PDFViewer'
import SignatureCanvas from '../components/SignatureCanvas'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

export default function Sign() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signatureData, setSignatureData] = useState(null)
  const [placedSigs, setPlacedSigs] = useState([])
  const [finalizing, setFinalizing] = useState(false)
  const [sendLinkOpen, setSendLinkOpen] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [signerEmail, setSignerEmail] = useState('')
  const [signerName, setSignerName] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [sendingLink, setSendingLink] = useState(false)

  const STEPS = ['Upload', 'Place Fields', 'Sign', 'Finalize']
  const currentStep = placedSigs.length > 0 ? 3 : signatureData ? 2 : 1

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await docsApi.get(docId)
        setDoc(data)
      } catch {
        toast.error('Document not found')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [docId])

  const handleCapture = (data) => {
    setSignatureData(data)
    toast.success('Signature ready! Click the document to place it ✓')
  }

  const handlePlaceSignature = ({ x, y, page }) => {
    if (!signatureData) {
      toast.error('Create a signature first, then click the document to place it')
      return
    }
    const newSig = {
      id: `sig-${Date.now()}`,
      x: x - 80, // center horizontally
      y: y - 30, // center vertically
      w: 160,
      h: 60,
      page,
      data: signatureData,
    }
    setPlacedSigs((prev) => [...prev, newSig])
    setSignatureData(null)
    toast.success('Signature placed ✓')
  }

  const handleRemoveSig = (id) => {
    setPlacedSigs((prev) => prev.filter((s) => s.id !== id))
  }

  const handleFinalize = async () => {
    if (placedSigs.length === 0) {
      toast.error('Place at least one signature before finalizing')
      return
    }
    setFinalizing(true)
    try {
      // Save all signatures first
      for (const sig of placedSigs) {
        await sigApi.create({
          document_id: docId,
          signature_data: sig.data,
          signature_type: 'drawn',
          page_number: sig.page,
          x_position: (sig.x / 600) * 100,
          y_position: (sig.y / 800) * 100,
          width: (sig.w / 600) * 100,
          height: (sig.h / 800) * 100,
        })
      }
      // Finalize
      await sigApi.finalize(docId)
      setFinalizeOpen(true)
      toast.success('Document finalized!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Finalization failed')
    } finally {
      setFinalizing(false)
    }
  }

  const handleDownloadSigned = async () => {
    try {
      const { data } = await docsApi.download(docId, true)
      downloadBlob(data, `signed_${doc?.filename}`)
      setFinalizeOpen(false)
    } catch {
      toast.error('Download failed')
    }
  }

  const handleSendLink = async () => {
    if (!signerEmail) { toast.error('Enter signer email'); return }
    setSendingLink(true)
    try {
      const { data } = await docsApi.sendLink({
        document_id: docId,
        signer_email: signerEmail,
        signer_name: signerName,
      })
      setGeneratedLink(data.signing_url)
      toast.success('Signing link generated!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate link')
    } finally {
      setSendingLink(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard?.writeText(generatedLink)
    toast.success('Link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" className="text-gold" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Sign Document"
        subtitle={doc?.title || 'Document'}
        actions={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setSendLinkOpen(true)}>
              📤 Send Link
            </button>
            <button
              className="btn btn-gold btn-sm"
              onClick={handleFinalize}
              disabled={finalizing}
            >
              {finalizing ? <><Spinner /> Finalizing...</> : '✓ Finalize & Download'}
            </button>
          </>
        }
      />

      {/* Steps */}
      <div className="flex px-8 gap-0 border-b border-border">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 transition-all ${
              i < currentStep
                ? 'text-green-400 border-green-400'
                : i === currentStep
                ? 'text-gold border-gold'
                : 'text-muted border-transparent'
            }`}
          >
            {i < currentStep ? '✓ ' : `${i + 1}. `}{step}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 grid grid-cols-[1fr_300px] gap-4 p-6 overflow-hidden">
        {/* PDF */}
        <PDFViewer
          docName={doc?.filename}
          signatures={placedSigs}
          onPlaceSignature={handlePlaceSignature}
          onRemoveSignature={handleRemoveSig}
        />

        {/* Sidebar */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Signature creator */}
          <div className="card p-4">
            <div className="text-sm font-semibold text-cream mb-3">✍️ Create Signature</div>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              {signatureData
                ? '✓ Signature ready — click the document to place it'
                : 'Create a signature below, then click the PDF to place it'}
            </p>
            {signatureData && (
              <div className="mb-3 bg-white rounded p-2">
                <img src={signatureData} alt="preview" className="w-full h-12 object-contain" />
              </div>
            )}
            <SignatureCanvas onCapture={handleCapture} />
          </div>

          {/* Placed signatures list */}
          <div className="card p-4">
            <div className="text-sm font-semibold text-cream mb-3">
              📌 Placed ({placedSigs.length})
            </div>
            {placedSigs.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">
                No signatures placed yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {placedSigs.map((sig, i) => (
                  <div
                    key={sig.id}
                    className="flex items-center gap-2 p-2 bg-surface2 rounded-lg border border-border"
                  >
                    <img
                      src={sig.data}
                      alt="sig"
                      className="w-16 h-8 object-contain bg-white rounded"
                    />
                    <span className="text-xs text-muted flex-1">Page {sig.page}</span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveSig(sig.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Link Modal */}
      <Modal
        open={sendLinkOpen}
        onClose={() => { setSendLinkOpen(false); setGeneratedLink(''); }}
        title="📤 Send Signing Link"
        subtitle="Generate a secure one-time link. The signer doesn't need an account."
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setSendLinkOpen(false)}>Cancel</button>
            <button className="btn btn-gold" onClick={handleSendLink} disabled={sendingLink}>
              {sendingLink ? <Spinner /> : 'Generate Link'}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="label">Signer's Email</label>
          <input
            type="email" value={signerEmail}
            onChange={(e) => setSignerEmail(e.target.value)}
            placeholder="signer@example.com" className="input"
          />
        </div>
        <div className="mb-2">
          <label className="label">Signer's Name (optional)</label>
          <input
            type="text" value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="John Smith" className="input"
          />
        </div>
        {generatedLink && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Signing Link</div>
            <div className="bg-surface2 border border-border2 rounded-lg p-3 text-xs text-gold break-all font-mono">
              {generatedLink}
            </div>
            <button className="btn btn-ghost btn-sm w-full mt-2" onClick={copyLink}>
              📋 Copy Link
            </button>
          </div>
        )}
      </Modal>

      {/* Finalize Modal */}
      <Modal
        open={finalizeOpen}
        onClose={() => { setFinalizeOpen(false); navigate('/dashboard') }}
        title="✅ Document Finalized"
        subtitle="Your signed PDF has been generated with all signatures embedded."
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => { setFinalizeOpen(false); navigate('/dashboard') }}>
              Go to Dashboard
            </button>
            <button className="btn btn-gold" onClick={handleDownloadSigned}>
              ⬇ Download Signed PDF
            </button>
          </>
        }
      >
        <div className="flex items-center gap-4 p-4 bg-surface2 border border-border2 rounded-lg">
          <div className="text-3xl">📄</div>
          <div>
            <div className="text-sm font-semibold text-cream">signed_{doc?.filename}</div>
            <div className="text-xs text-green-400 mt-0.5">✓ Signatures embedded · ✓ Audit trail logged</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
