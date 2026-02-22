import { useEffect } from 'react'

export default function Modal({ open, onClose, title, subtitle, children, actions }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="bg-surface border border-border2 rounded-xl p-7 w-full max-w-md mx-4 animate-[modalIn_0.2s_ease]">
        <div className="font-display text-xl font-semibold text-cream mb-1">{title}</div>
        {subtitle && <p className="text-sm text-muted mb-5">{subtitle}</p>}
        {children}
        {actions && (
          <div className="flex items-center justify-end gap-2 mt-5">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
