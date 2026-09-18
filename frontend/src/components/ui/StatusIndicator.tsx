import type { Status } from '../../lib/api'
import { cn } from '../../lib/cn'
import { Badge, type Tone } from './Badge'

export const statusTone: Record<Status, Tone> = { ok: 'normal', degraded: 'warning', error: 'critical', unknown: 'neutral' }
const dot: Record<Status, string> = {
  ok: 'bg-status-normal shadow-[0_0_8px_#22c55e]',
  degraded: 'bg-status-warning shadow-[0_0_8px_#f59e0b]',
  error: 'bg-status-critical shadow-[0_0_8px_#ef4444]',
  unknown: 'bg-status-unknown',
}
const label: Record<Status, string> = { ok: 'Normal', degraded: 'Warning', error: 'Critical', unknown: 'Unknown' }

export function StatusIndicator({ status, text, badge = false, className }: { status: Status; text?: string; badge?: boolean; className?: string }) {
  if (badge) return <Badge tone={statusTone[status]}>{text ?? label[status]}</Badge>
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm', className)} role="status" aria-label={label[status]}>
      <span className={cn('h-2.5 w-2.5 rounded-full', dot[status], status === 'ok' && 'animate-pulse')} />
      <span>{text ?? label[status]}</span>
    </span>
  )
}
