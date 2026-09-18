import { useAppStore } from '../../stores/appStore'
import { StatusIndicator } from '../status/StatusIndicator'
import { fmtTime } from '../../utils/format'
import { cn } from '../../utils/cn'

export function TopBar() {
  const { plants, selectedPlantId, selectPlant, systemState, lastSync, wsState } = useAppStore()
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-bg-elevated/60 px-5 backdrop-blur">
      <div className="text-sm font-semibold tracking-wide">AquaRisk AI</div>

      <label className="ml-2 flex items-center gap-2 text-xs text-muted">
        Plant
        <select
          aria-label="Plant selector"
          value={selectedPlantId ?? ''}
          onChange={(e) => selectPlant(e.target.value ? Number(e.target.value) : null)}
          className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text focus:border-primary focus:outline-none"
          disabled={plants.length === 0}
        >
          {plants.length === 0 && <option value="">No plants available</option>}
          {plants.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
        </select>
      </label>

      <div className="ml-auto flex items-center gap-5 text-xs">
        <StatusIndicator state={systemState} text={`SYSTEM ${systemState}`} className="font-semibold tracking-wider" />
        <span className="text-muted" title="WebSocket">
          <span className={cn('mr-1 inline-block h-1.5 w-1.5 rounded-full', wsState === 'open' ? 'bg-success' : wsState === 'connecting' ? 'bg-warning' : 'bg-danger')} />
          live {wsState}
        </span>
        <span className="telemetry text-muted">Last sync {fmtTime(lastSync)}</span>
        <button className="relative text-muted hover:text-text" aria-label="Notifications" title="No notifications">
          ◔
        </button>
        <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-surface text-[11px]" title="Operator">OP</span>
      </div>
    </header>
  )
}
