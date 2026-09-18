import { useState, useEffect } from 'react'
import { CommandCenter } from './pages/CommandCenter'
import { IncidentCenter } from './pages/IncidentCenter'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { WhatIfLab } from './pages/WhatIfLab'
import { DigitalTwinPage } from './pages/DigitalTwinPage'
import { SettingsPage } from './pages/SettingsPage'

type PageId = 'command' | 'incidents' | 'twin' | 'whatif' | 'analytics' | 'settings'

function App() {
  const [activePage, setActivePage] = useState<PageId>('command')
  const [clock, setClock] = useState('')
  const [systemOnline, setSystemOnline] = useState(true)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = String(now.getUTCHours()).padStart(2, '0')
      const m = String(now.getUTCMinutes()).padStart(2, '0')
      const s = String(now.getUTCSeconds()).padStart(2, '0')
      setClock(`${h}:${m}:${s} UTC`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('http://localhost:8000/api/system/status')
      .then(r => r.json())
      .then(d => setSystemOnline(d.status === 'online'))
      .catch(() => setSystemOnline(false))
  }, [activePage])

  const navItems: { id: PageId; label: string; icon: string; badge?: string }[] = [
    { id: 'command', label: 'Command Center', icon: 'dashboard' },
    { id: 'incidents', label: 'Incidents', icon: 'warning', badge: '1' },
    { id: 'twin', label: 'Digital Twin', icon: 'layers' },
    { id: 'whatif', label: 'What-if Lab', icon: 'science' },
    { id: 'analytics', label: 'Analytics', icon: 'query_stats' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]

  const pageTitle: Record<PageId, string> = {
    command: 'Command Center',
    incidents: 'Incidents',
    twin: 'Digital Twin',
    whatif: 'What-if Lab',
    analytics: 'Analytics',
    settings: 'Settings',
  }

  return (
    <div className="flex min-h-screen bg-background text-text-main font-sans antialiased select-none">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="fixed top-0 left-0 h-screen w-60 z-40 glass-panel border-r border-surface-border flex flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-surface-card border border-surface-border flex items-center justify-center text-primary shadow-[0_0_12px_rgba(40,215,255,0.2)]">
              <span className="material-symbols-outlined text-[20px]">water_drop</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-text-main tracking-tight">AquaRisk AI</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${systemOnline ? 'bg-status-operational animate-pulse' : 'bg-status-critical'}`}></span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${systemOnline ? 'text-status-operational' : 'text-status-critical'}`}>
                  {systemOnline ? 'SYSTEM ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 text-xs font-medium">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left transition-colors duration-150 active:scale-[0.98] ${
                  activePage === item.id
                    ? 'text-primary bg-surface-container border-l-2 border-primary font-semibold shadow-[0_0_12px_rgba(40,215,255,0.15)]'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-primary border-l-2 border-transparent'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${item.id === 'incidents' ? 'text-status-critical' : ''}`}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-status-critical/20 text-status-critical border border-status-critical/40">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActivePage('settings')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-text-muted hover:bg-surface-elevated hover:text-primary transition-colors text-xs text-left"
          >
            <span className="material-symbols-outlined text-[18px]">dns</span>
            System Diagnostics
          </button>
          <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-status-critical/10 border border-status-critical/50 text-status-critical text-xs font-bold hover:bg-status-critical/20 transition-colors active:scale-[0.98]">
            <span className="material-symbols-outlined text-[16px]">error</span>
            Emergency Override
          </button>
        </div>
      </aside>

      {/* ═══ MAIN WRAPPER ═══ */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* ═══ TOP HEADER ═══ */}
        <header className="sticky top-0 right-0 h-14 z-30 glass-panel border-b border-surface-border flex items-center justify-between px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-card border border-surface-border">
              <span className="material-symbols-outlined text-primary text-[18px]">factory</span>
              <span className="text-sm font-semibold text-text-main">VSB Plant 01</span>
            </div>
            <span className="text-surface-border">/</span>
            <span className="text-primary text-sm font-semibold">{pageTitle[activePage]}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-surface-card border border-surface-border text-text-secondary text-xs font-mono">
              <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
              <span>{clock}</span>
            </div>
            <div className={`hidden lg:flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-semibold uppercase ${
              systemOnline
                ? 'bg-status-operational/10 border-status-operational/30 text-status-operational'
                : 'bg-status-critical/10 border-status-critical/30 text-status-critical'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${systemOnline ? 'bg-status-operational' : 'bg-status-critical'}`}></span>
              {systemOnline ? 'System Online' : 'Offline'}
            </div>
            <button className="relative p-1.5 rounded hover:bg-surface-elevated text-text-secondary hover:text-text-main transition-colors hover-lift">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-critical"></span>
            </button>
            <div className="h-6 w-px bg-surface-border"></div>
            <button className="px-3 py-1.5 rounded border border-surface-border text-text-main hover:border-primary hover:text-primary text-xs font-semibold transition-colors active:scale-[0.98] hover-lift">
              Branch Scenario
            </button>
            <button className="px-3 py-1.5 rounded bg-gradient-to-r from-primary to-[#007EA7] text-background text-xs font-bold hover:shadow-[0_0_15px_rgba(40,215,255,0.4)] transition-all active:scale-[0.98] hover-lift">
              Execute Action
            </button>
          </div>
        </header>

        {/* ═══ PAGE CONTENT ═══ */}
        <main className="flex-1 overflow-auto animate-fade-in-up">
          {activePage === 'command' && <CommandCenter />}
          {activePage === 'incidents' && <IncidentCenter />}
          {activePage === 'twin' && <DigitalTwinPage />}
          {activePage === 'whatif' && <WhatIfLab />}
          {activePage === 'analytics' && <AnalyticsPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}

export default App
