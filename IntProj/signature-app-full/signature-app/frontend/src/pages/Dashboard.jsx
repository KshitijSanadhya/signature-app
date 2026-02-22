import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { docsApi } from '../utils/api'
import { formatDate, downloadBlob, STATUS_CONFIG } from '../utils/helpers'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'

export default function Dashboard() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDocs = async () => {
    try {
      const { data } = await docsApi.list()
      setDocs(data.documents || [])
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    try {
      await docsApi.delete(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const handleDownload = async (doc) => {
    try {
      const { data } = await docsApi.download(doc.id, doc.status === 'signed')
      downloadBlob(data, doc.status === 'signed' ? `signed_${doc.filename}` : doc.filename)
    } catch {
      toast.error('Download failed')
    }
  }

  const stats = [
    { label: 'Total Docs', value: docs.length, color: 'text-cream' },
    { label: 'Awaiting Signature', value: docs.filter(d => d.status === 'sent').length, color: 'text-blue-400' },
    { label: 'Signed', value: docs.filter(d => d.status === 'signed').length, color: 'text-green-400' },
    { label: 'Drafts', value: docs.filter(d => d.status === 'draft').length, color: 'text-muted' },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your document activity"
        actions={
          <button className="btn btn-gold btn-sm" onClick={() => navigate('/upload')}>
            + Upload PDF
          </button>
        }
      />

      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="card p-5">
              <div className="text-xs font-semibold text-muted tracking-widest uppercase mb-2">{label}</div>
              <div className={`font-display text-3xl font-semibold leading-none ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Documents table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <span className="text-sm font-semibold text-cream">Recent Documents</span>
            <span className="text-xs text-muted">{docs.length} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="md" className="text-gold" />
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📄</div>
              <div className="text-sm font-semibold text-cream mb-1">No documents yet</div>
              <p className="text-xs text-muted max-w-xs mx-auto mb-4">
                Upload your first PDF to get started with digital signing.
              </p>
              <button className="btn btn-gold btn-sm" onClick={() => navigate('/upload')}>
                Upload PDF
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['Document', 'Status', 'Signer', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-muted tracking-widest uppercase px-5 py-3 border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-semibold text-cream text-sm">
                        <span>📄</span> {doc.title}
                      </div>
                      <div className="text-xs text-muted mt-0.5">{doc.filename}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted">{doc.signer_email || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-muted">{formatDate(doc.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/sign/${doc.id}`)}
                        >
                          Open
                        </button>
                        {doc.status === 'signed' && (
                          <button
                            className="btn btn-gold btn-sm"
                            onClick={() => handleDownload(doc)}
                          >
                            ⬇ Download
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/audit/${doc.id}`)}
                        >
                          📜 Audit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
