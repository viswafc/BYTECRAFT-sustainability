import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { CommandCenter } from './pages/CommandCenter'
import { SystemStatus } from './pages/SystemStatus'
import { DataHealth } from './pages/DataHealth'
import { ApiHealth } from './pages/ApiHealth'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<CommandCenter />} />
        <Route path="system" element={<SystemStatus />} />
        <Route path="data" element={<DataHealth />} />
        <Route path="api" element={<ApiHealth />} />
        <Route path="*" element={<div className="text-text-muted">Page not found.</div>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
