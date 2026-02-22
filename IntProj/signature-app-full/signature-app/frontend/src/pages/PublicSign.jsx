import { useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { sigApi } from '../utils/api'
import SignatureCanvas from '../components/SignatureCanvas'
import Spinner from '../components/Spinner'

export default function PublicSign() {
  const { token } = useParams()
  const [signatureData, setSignatureData] = useState(null)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleCapture = (data) => {
    setSignatureData(data)
    toast.success('Signature ready!')
  }

  const handleSubmit = async () => {
    if (!signatureData) { toast.error('Please create your signature first'); return }
    if (!signerEmail) { toast.error('Please enter your email'); return }
    setSubmitting(true)
    try {
      await sigApi.signWithToken(token, {
        document_id: '',      // filled by backend using token
        signer_name: signerName,
        signer_email: signerEmail,
        signature_type: 'drawn',
        signature_data: signatureData,
        page_number: 1,
        x_position: 10,
        y_position: 70,
        width: 25,
        height: 10,
      })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signing failed. The link may have expired.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="font-display text-2xl font-semibold text-cream mb-2">Document Signed!</h1>
          <p className="text-sm text-muted">
            Your signature has been securely recorded. The sender will receive a notification and a
            signed copy of the document.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-base">✍️</div>
          <span className="font-display font-bold text-cream text-xl tracking-tight">SignFlow</span>
        </div>

        <div className="card p-6">
          <h1 className="font-display text-xl font-semibold text-cream mb-1">Sign Document</h1>
          <p className="text-sm text-muted mb-6">
            You've been invited to sign a document. Create your signature and submit.
          </p>

          {/* Signer info */}
          <div className="mb-4">
            <label className="label">Your Full Name</label>
            <input
              type="text" value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Jane Smith" className="input"
            />
          </div>
          <div className="mb-5">
            <label className="label">Your Email</label>
            <input
              type="email" value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="jane@company.com" className="input"
            />
          </div>

          <div className="border-t border-border pt-4 mb-4">
            <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              Create Your Signature
            </div>
            <SignatureCanvas onCapture={handleCapture} />
          </div>

          {signatureData && (
            <div className="mb-4 bg-surface2 border border-border2 rounded-lg p-3">
              <div className="text-xs text-muted mb-1">Signature preview:</div>
              <div className="bg-white rounded p-2">
                <img src={signatureData} alt="sig preview" className="h-12 object-contain" />
              </div>
            </div>
          )}

          <button
            className="btn btn-gold w-full"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <><Spinner /> Submitting...</> : '✓ Submit Signature'}
          </button>

          <p className="text-xs text-muted text-center mt-4">
            By submitting, you agree this constitutes your legally binding digital signature.
            All events are logged with your IP address and timestamp.
          </p>
        </div>
      </div>
    </div>
  )
}
