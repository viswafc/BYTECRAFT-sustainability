import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useAppStore } from '../../stores/appStore'

export const NAV = [
  { to: '/', label: 'Command Center', icon: '◈' },
  { to: '/twin', label: 'Digital Twin', icon: '⬡' },
  { to: '/sensors', label: 'Live Sensors', icon: '◉' },
  { to: '/incidents', label: 'Incidents', icon: '⚠' },
  { to: '/risk', label: 'Predictive Risk', icon: '↗' },
  { to: '/analytics', label: 'Analytics', icon: '▤' },
  { to: '/whatif', label: 'What-if Lab', icon: '⚗' },
  { to: '/copilot', label: 'AI Copilot', icon: '✦' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggle = useAppStore((s) => s.toggleSidebar)
  return (
    <aside className={cn('flex shrink-0 flex-col border-r border-border bg-bg-elevated/70 transition-[width]', collapsed ? 'w-16' : 'w-60')}>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/15 text-primary-strong shadow-glow">≋</span>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">AquaRisk <span className="text-primary-strong">AI</span></div>
            <div className="text-[10px] uppercase tracking-widest text-muted">Phase 2 · Platform</div>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-2 py-3" aria-label="Main">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} title={n.label}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
              isActive ? 'border-primary/30 bg-primary/10 text-primary-soft' : 'border-transparent text-muted hover:bg-surface hover:text-text',
            )}>
            <span className="w-4 text-center">{n.icon}</span>
            {!collapsed && n.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={toggle} className="border-t border-border px-4 py-2 text-left text-xs text-muted hover:text-text" aria-label="Toggle sidebar">
        {collapsed ? '»' : '« Collapse'}
      </button>
    </aside>
  )
}
