import type { ReactNode } from 'react'

/** Slot for the interactive chart library (added in Phase 3 alongside real time-series). */
export function ChartContainer({ title, subtitle, height = 240, children, actions, empty = 'Historical telemetry will appear once sufficient data is available.' }: {
  title: string; subtitle?: string; height?: number; children?: ReactNode; actions?: ReactNode; empty?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/40">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</div>
          {subtitle && <div className="text-[11px] text-muted-soft">{subtitle}</div>}
        </div>
        {actions}
      </div>
      <div style={{ height }} className="flex items-center justify-center p-3">
        {children ?? <span className="text-xs text-muted">{empty}</span>}
      </div>
    </div>
  )
}
