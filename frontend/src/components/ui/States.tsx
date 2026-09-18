import type { ReactNode } from 'react'
import { Button } from './Button'

export function LoadingState({ label = 'Loading…', lines = 3 }: { label?: string; lines?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2 py-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 animate-pulse rounded bg-navy-700" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry, title = 'Unable to load' }: { message: string; onRetry?: () => void; title?: string }) {
  return (
    <div role="alert" className="rounded-lg border border-status-critical/40 bg-status-critical/10 px-4 py-3">
      <div className="text-sm font-semibold text-status-critical">{title}</div>
      <p className="mt-1 text-sm text-text-muted">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>Retry</Button>}
    </div>
  )
}

export function ChartContainer({ title, subtitle, height = 240, children, actions }: {
  title: string; subtitle?: string; height?: number; children?: ReactNode; actions?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-navy-700 bg-navy-800/40">
      <div className="flex items-center justify-between border-b border-navy-700 px-4 py-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</div>
          {subtitle && <div className="text-[11px] text-text-muted/70">{subtitle}</div>}
        </div>
        {actions}
      </div>
      <div style={{ height }} className="flex items-center justify-center p-3">
        {children ?? <span className="text-xs text-text-muted">Chart integration arrives in a later phase.</span>}
      </div>
    </div>
  )
}
