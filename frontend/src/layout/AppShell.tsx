import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { StatusIndicator } from '../components/ui'
import { cn } from '../lib/cn'

const nav = [
  { to: '/', label: 'Command Center', icon: '◈' },
  { to: '/system', label: 'System Status', icon: '◉' },
  { to: '/data', label: 'Data Health', icon: '▤' },
  { to: '/api', label: 'API Health', icon: '⇄' },
]

export function AppShell() {
  const status = useApi(() => api.systemStatus())
  const overall = status.error ? 'error' : status.data?.status ?? 'unknown'

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-navy-700 bg-navy-900/70">
        <div className="border-b border-navy-700 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-aqua-500/15 text-aqua-400 shadow-[0_0_16px_rgba(20,200,224,0.35)]">≋</span>
            <div>
              <div className="text-sm font-bold tracking-wide">AquaRisk <span className="text-aqua-400">AI</span></div>
              <div className="text-[10px] uppercase tracking-widest text-text-muted">Phase 1 · Foundation</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-aqua-500/10 text-aqua-300 border border-aqua-500/30' : 'text-text-muted hover:bg-navy-800 hover:text-text-primary border border-transparent',
                )
              }
            >
              <span className="w-4 text-center">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-navy-700 px-5 py-3 text-xs">
          <StatusIndicator status={overall} text={status.loading ? 'Checking…' : status.error ? 'API offline' : `System ${overall}`} />
          <div className="mt-1 text-text-muted">v{status.data?.version ?? '—'}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
