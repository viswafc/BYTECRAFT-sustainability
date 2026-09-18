import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type Tone = 'normal' | 'warning' | 'critical' | 'info' | 'neutral'

const tones: Record<Tone, string> = {
  normal: 'bg-status-normal/15 text-status-normal border-status-normal/40',
  warning: 'bg-status-warning/15 text-status-warning border-status-warning/40',
  critical: 'bg-status-critical/15 text-status-critical border-status-critical/40',
  info: 'bg-aqua-500/15 text-aqua-300 border-aqua-500/40',
  neutral: 'bg-navy-700 text-text-muted border-navy-600',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider', tones[tone], className)}>
      {children}
    </span>
  )
}
