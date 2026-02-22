import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { docsApi } from '../utils/api'
import { formatBytes } from '../utils/helpers'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'

export default function Upload() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const selectFile = (f) => {
    if (!f) return
    if (!f.type.includes('pdf')) { toast.error('Only PDF files are accepted'); return }
    if (f.size > 10 * 1024 * 1024) { toast.error('File exceeds 10MB limit'); return }
    setFile(f)
    setTitle(f.name.replace('.pdf', '').replace(/[_-]/g, ' '))
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    selectFile(e.dataTransfer.files[0])
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (title) formData.append('title', title)
      const { data } = await docsApi.upload(formData)
      toast.success('Document uploaded successfully!')
      navigate(`/sign/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Upload Document" subtitle="Upload a PDF to start the signing process" />

      <div className="px-8 py-6 max-w-xl">
        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-gold bg-gold/5'
              : 'border-border2 bg-surface hover:border-gold/50 hover:bg-gold/[0.02]'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => selectFile(e.target.files[0])}
          />
          <div className="text-4xl mb-3">📄</div>
          <div className="font-semibold text-cream mb-1">Drop your PDF here</div>
          <div className="text-sm text-muted">or click to browse files</div>
          <div className="text-xs text-muted/50 mt-2">Maximum 10MB · PDF only</div>
        </div>

        {/* File preview + upload */}
        {file && (
          <div className="mt-5">
            <div className="card flex items-center gap-4 p-4 mb-4">
              <div className="text-3xl">📄</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-cream truncate">{file.name}</div>
                <div className="text-xs text-muted mt-0.5">{formatBytes(file.size)}</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setFile(null); setTitle('') }}
              >
                ✕ Remove
              </button>
            </div>

            <div className="mb-4">
              <label className="label">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Employment Contract Q1 2025"
                className="input"
              />
            </div>

            <button
              className="btn btn-gold w-full"
              onClick={upload}
              disabled={uploading}
            >
              {uploading ? (
                <><Spinner /> Uploading...</>
              ) : (
                'Upload & Continue to Sign →'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
