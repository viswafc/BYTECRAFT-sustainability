import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'

const CommandCenter = lazy(() => import('../pages/CommandCenter'))
const DigitalTwin = lazy(() => import('../pages/DigitalTwin'))
const LiveSensors = lazy(() => import('../pages/LiveSensors'))
const Incidents = lazy(() => import('../pages/Incidents'))
const PredictiveRisk = lazy(() => import('../pages/PredictiveRisk'))
const Analytics = lazy(() => import('../pages/Analytics'))
const WhatIfLab = lazy(() => import('../pages/WhatIfLab'))
const Copilot = lazy(() => import('../pages/Copilot'))
const Settings = lazy(() => import('../pages/Settings'))
const NotFound = lazy(() => import('../pages/NotFound'))

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CommandCenter />} />
        <Route path="twin" element={<DigitalTwin />} />
        <Route path="sensors" element={<LiveSensors />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="risk" element={<PredictiveRisk />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="whatif" element={<WhatIfLab />} />
        <Route path="copilot" element={<Copilot />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
