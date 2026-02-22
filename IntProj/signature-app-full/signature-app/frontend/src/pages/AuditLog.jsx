import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { auditApi, docsApi } from '../utils/api'
import PageHeader from '../components/PageHeader'
import AuditTimeline from '../components/AuditTimeline'
import Spinner from '../components/Spinner'

export default function AuditLog() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [auditRes, docRes] = await Promise.all([
          auditApi.get(docId),
          docsApi.get(docId),
        ])
        setLogs(auditRes.data)
        setDoc(docRes.data)
      } catch {
        toast.error('Failed to load audit log')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [docId])

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle={doc ? `Complete event history for "${doc.title}"` : 'Loading...'}
        actions={
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        }
      />

      <div className="px-8 py-6 max-w-2xl">
        <div className="card p-6">
          <div className="text-sm font-semibold text-cream mb-1">Event Timeline</div>
          <div className="text-xs text-muted mb-5">All events are timestamped and immutable</div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="md" className="text-gold" />
            </div>
          ) : (
            <AuditTimeline logs={logs} />
          )}
        </div>
      </div>
    </div>
  )
}
