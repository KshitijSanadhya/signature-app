import { STATUS_CONFIG } from '../utils/helpers'

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'text-muted bg-white/5' }
  return (
    <span className={`status-badge ${cfg.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {cfg.label}
    </span>
  )
}
