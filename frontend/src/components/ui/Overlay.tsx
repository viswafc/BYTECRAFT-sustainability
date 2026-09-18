import { useEffect, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

interface BaseProps { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
}

export function Modal({ open, onClose, title, children }: BaseProps) {
  useEscape(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-xl border border-navy-600 bg-navy-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-navy-700 px-5 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">✕</Button>
        </header>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children, side = 'right' }: BaseProps & { side?: 'right' | 'left' }) {
  useEscape(open, onClose)
  return (
    <>
      <div className={cn('fixed inset-0 z-40 bg-black/50 transition-opacity', open ? 'opacity-100' : 'pointer-events-none opacity-0')} onClick={onClose} />
      <aside
        className={cn(
          'fixed top-0 z-50 h-full w-full max-w-md border-navy-600 bg-navy-900 shadow-2xl transition-transform duration-200',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full',
        )}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-navy-700 px-5 py-3">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">✕</Button>
        </header>
        <div className="h-[calc(100%-49px)] overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </>
  )
}
