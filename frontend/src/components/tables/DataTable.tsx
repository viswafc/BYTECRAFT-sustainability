import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface Column<T> { key: string; header: ReactNode; render: (row: T) => ReactNode; className?: string }

export function DataTable<T>({ columns, rows, rowKey, empty = 'No data', className }: {
  columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; empty?: ReactNode; className?: string
}) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-[11px] uppercase tracking-wider text-muted">
          <tr>{columns.map((c) => <th key={c.key} className={cn('px-3 py-2 font-medium', c.className)}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-muted">{empty}</td></tr>
          )}
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-t border-border/70 hover:bg-surface-hover/50">
              {columns.map((c) => <td key={c.key} className={cn('px-3 py-2', c.className)}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
