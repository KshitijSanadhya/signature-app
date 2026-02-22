import { AUDIT_CONFIG, formatDateTime } from '../utils/helpers'

export default function AuditTimeline({ logs = [] }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-muted text-sm">
        No audit events yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {logs.map((log, i) => {
        const cfg = AUDIT_CONFIG[log.event_type] || {
          label: log.event_type,
          icon: '•',
          dot: 'bg-muted',
        }
        return (
          <div key={log.id} className="flex gap-4 py-4 border-b border-border last:border-0">
            {/* Dot + line */}
            <div className="flex flex-col items-center gap-0 pt-0.5">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot} ring-2 ring-bg`} />
              {i < logs.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
            </div>

            {/* Body */}
            <div className="flex-1 pb-1">
              <div className="text-sm font-semibold text-cream mb-0.5">
                {cfg.icon} {cfg.label}
              </div>
              {log.event_detail && (
                <div className="text-xs text-muted mb-1">{log.event_detail}</div>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-muted/70 mt-1">
                <span>👤 {log.actor_email || 'Anonymous'}</span>
                {log.ip_address && <span>🌐 {log.ip_address}</span>}
                <span>🕐 {formatDateTime(log.created_at)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
