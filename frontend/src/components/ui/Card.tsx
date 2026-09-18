import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export function Card({ title, subtitle, actions, className, children, ...rest }: CardProps) {
  return (
    <section
      className={cn('rounded-xl border border-navy-700 bg-navy-900/80 backdrop-blur-sm shadow-lg shadow-black/20', className)}
      {...rest}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-navy-700 px-5 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-wide text-text-primary">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}
