import type { HealthState } from '../../types/api'
import { cn } from '../../utils/cn'
import { Badge, type Tone } from '../ui/Badge'

export const stateTone: Record<HealthState, Tone> = { ONLINE: 'normal', DEGRADED: 'warning', OFFLINE: 'critical', UNKNOWN: 'neutral' }
const dot: Record<HealthState, string> = {
  ONLINE: 'bg-success shadow-[0_0_8px_var(--color-success)]',
  DEGRADED: 'bg-warning shadow-[0_0_8px_var(--color-warning)]',
  OFFLINE: 'bg-danger shadow-[0_0_8px_var(--color-danger)]',
  UNKNOWN: 'bg-neutral',
}

export function StatusIndicator({ state, text, badge = false, pulse = true, className }: {
  state: HealthState; text?: string; badge?: boolean; pulse?: boolean; className?: string
}) {
  if (badge) return <Badge tone={stateTone[state]}>{text ?? state}</Badge>
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm', className)} role="status" aria-label={state}>
      <span className={cn('h-2.5 w-2.5 rounded-full', dot[state], pulse && state === 'ONLINE' && 'animate-pulse')} />
      <span>{text ?? state}</span>
    </span>
  )
}

/** Map arbitrary entity status strings (sensor/asset/incident) to a badge tone. */
export function toneForStatus(status: string): Tone {
  const s = status.toLowerCase()
  if (['online', 'active', 'ok', 'resolved', 'closed', 'good'].includes(s)) return 'normal'
  if (['degraded', 'maintenance', 'acknowledged', 'investigating', 'suspect', 'medium'].includes(s)) return 'warning'
  if (['offline', 'critical', 'high', 'open', 'failed', 'bad', 'decommissioned'].includes(s)) return 'critical'
  if (['registered', 'low', 'info'].includes(s)) return 'info'
  return 'neutral'
}
