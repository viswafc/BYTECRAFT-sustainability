import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type Tone = 'normal' | 'warning' | 'critical' | 'info' | 'neutral'

const tones: Record<Tone, string> = {
  normal: 'bg-success/15 text-success border-success/40',
  warning: 'bg-warning/15 text-warning border-warning/40',
  critical: 'bg-danger/15 text-danger border-danger/40',
  info: 'bg-primary/15 text-primary-soft border-primary/40',
  neutral: 'bg-surface-hover text-muted border-border-strong',
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider', tones[tone], className)}>
      {children}
    </span>
  )
}
