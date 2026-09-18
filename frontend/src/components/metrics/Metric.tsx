import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function Metric({ label, value, unit, hint, tone = 'default', className }: {
  label: string; value: ReactNode; unit?: string; hint?: ReactNode
  tone?: 'default' | 'aqua' | 'normal' | 'warning' | 'critical'; className?: string
}) {
  const color = {
    default: 'text-text', aqua: 'text-primary-strong', normal: 'text-success',
    warning: 'text-warning', critical: 'text-danger',
  }[tone]
  return (
    <div className={cn('rounded-lg border border-border bg-surface/60 px-4 py-3', className)}>
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 font-mono text-2xl font-semibold', color)}>
        {value}{unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  )
}
