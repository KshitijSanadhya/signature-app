import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(iso) {
  if (!iso) return '—'
  return format(new Date(iso), 'MMM d, yyyy')
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return format(new Date(iso), 'MMM d, yyyy · h:mm a')
}

export function timeAgo(iso) {
  if (!iso) return '—'
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export const STATUS_CONFIG = {
  draft:   { label: 'Draft',   color: 'text-muted bg-white/5' },
  sent:    { label: 'Sent',    color: 'text-blue-400 bg-blue-400/10' },
  signed:  { label: 'Signed',  color: 'text-green-400 bg-green-400/10' },
  expired: { label: 'Expired', color: 'text-red-400 bg-red-400/10' },
}

export const AUDIT_CONFIG = {
  uploaded:         { label: 'Document Uploaded',    icon: '📤', dot: 'bg-blue-400' },
  viewed:           { label: 'Document Viewed',      icon: '👁',  dot: 'bg-muted' },
  link_sent:        { label: 'Signing Link Sent',    icon: '🔗', dot: 'bg-blue-400' },
  signature_placed: { label: 'Signature Placed',     icon: '✍️', dot: 'bg-gold' },
  signed_via_link:  { label: 'Signed via Link',      icon: '✅', dot: 'bg-green-400' },
  finalized:        { label: 'Document Finalized',   icon: '🔒', dot: 'bg-green-400' },
  expired:          { label: 'Link Expired',         icon: '⚠️', dot: 'bg-red-400' },
}
