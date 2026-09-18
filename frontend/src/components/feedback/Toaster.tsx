import { useToastStore, type ToastTone } from '../../stores/toastStore'
import { cn } from '../../utils/cn'

const tones: Record<ToastTone, string> = {
  info: 'border-info/40 bg-info/10 text-info',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger',
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cn('pointer-events-auto rounded-lg border bg-bg-elevated/95 px-4 py-3 shadow-xl backdrop-blur', tones[t.tone])}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">{t.title}</div>
              {t.message && <div className="mt-0.5 text-xs text-muted">{t.message}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-muted hover:text-text" aria-label="Dismiss">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
