import type { ReactNode } from 'react'
import { Button } from '../ui/Button'
import { fmtTime } from '../../utils/format'
import type { ApiError } from '../../services/apiClient'

export function LoadingState({ label = 'Loading…', lines = 3 }: { label?: string; lines?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-2 py-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 animate-pulse rounded bg-surface-hover" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry, title = 'Unable to load', lastSuccess }: {
  message: string; onRetry?: () => void; title?: string; lastSuccess?: string | null
}) {
  return (
    <div role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-danger">{title}</div>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {lastSuccess && <p className="telemetry mt-1 text-xs text-muted-soft">Last successful update: {fmtTime(lastSuccess)}</p>}
      {onRetry && <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>Retry</Button>}
    </div>
  )
}

/** Picks a title based on the ApiError kind (network / timeout / db / model / http). */
export function ApiErrorState({ error, onRetry, lastSuccess }: { error: ApiError; onRetry?: () => void; lastSuccess?: string | null }) {
  const title =
    error.isNetwork ? 'Data stream interrupted' :
    error.isTimeout ? 'Request timed out' :
    error.code === 'DATABASE_UNAVAILABLE' ? 'Database unavailable' :
    error.code === 'MODEL_NOT_READY' ? 'Model not ready' :
    error.status === 404 ? 'Not found' :
    error.code === 'VALIDATION_ERROR' || error.code === 'INVALID_INPUT' ? 'Invalid input' : 'Request failed'
  return <ErrorState title={title} message={error.message} onRetry={onRetry} lastSuccess={lastSuccess} />
}

export function EmptyState({ title, message, icon = '◌', action }: { title: string; message?: ReactNode; icon?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <div className="text-2xl text-muted-soft">{icon}</div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-text">{title}</div>
      {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Used by intelligence pages whose engines are not wired yet. */
export function ModuleNotInitialized({ module, phase, description }: { module: string; phase: string; description: string }) {
  return (
    <EmptyState
      icon="◈"
      title="Intelligence module not initialized"
      message={<><span className="text-text">{module}</span> arrives in <span className="text-primary-soft">{phase}</span>. {description}</>}
    />
  )
}
