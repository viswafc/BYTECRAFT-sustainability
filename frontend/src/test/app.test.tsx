import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../app/router'
import { useAppStore } from '../stores/appStore'
import { fail, mockApi, netFail, ok } from './mocks'

const renderAt = (path = '/') => render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)

afterEach(() => {
  vi.unstubAllGlobals()
  useAppStore.setState({ plants: [], selectedPlantId: null, systemStatus: null, systemState: 'UNKNOWN', lastSync: null })
})

describe('application boot', () => {
  it('boots the shell, loads plants and shows SYSTEM ONLINE', async () => {
    mockApi()
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Command Center' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/SYSTEM ONLINE/)).toBeInTheDocument())
    expect(await screen.findByRole('option', { name: /Test Plant/ })).toBeInTheDocument()
  })

  it('shows loading state before data arrives', async () => {
    let resolve!: (v: Response) => void
    mockApi({ '/api/incidents': () => new Promise<Response>((r) => { resolve = r }) })
    renderAt('/')
    await screen.findByRole('heading', { name: 'Command Center' })
    await waitFor(() => expect(screen.getAllByRole('status').length).toBeGreaterThan(0))
    resolve(ok([]))
    expect(await screen.findByText(/No active incidents/)).toBeInTheDocument()
  })

  it('renders the honest empty state on the Command Center', async () => {
    mockApi()
    renderAt('/')
    expect(await screen.findByText(/No active incidents/i)).toBeInTheDocument()
    expect(screen.getByText(/Awaiting live intelligence data/i)).toBeInTheDocument()
    expect(await screen.findByText('20')).toBeInTheDocument() // connected sensors from summary
  })
})

describe('navigation', () => {
  it('opens every page from the sidebar', async () => {
    mockApi()
    renderAt('/')
    const pages = ['Digital Twin', 'Live Sensors', 'Incidents', 'Predictive Risk', 'Analytics', 'What-if Lab', 'AI Copilot', 'Settings']
    for (const p of pages) {
      await userEvent.click(screen.getByRole('link', { name: new RegExp(p) }))
      expect(await screen.findByRole('heading', { level: 1, name: p })).toBeInTheDocument()
    }
  })

  it('renders not-found for unknown routes', async () => {
    mockApi()
    renderAt('/nope')
    expect(await screen.findByText(/Page not found/)).toBeInTheDocument()
  })
})

describe('error states', () => {
  it('shows a data-stream-interrupted state when the API is unreachable', async () => {
    mockApi({ '/api/incidents': netFail, '/api/system/status': netFail, '/api/plants': () => ok([{ id: 1, code: 'P', name: 'P', location: null, timezone: 'UTC', latitude: null, longitude: null, status: 'active', created_at: '', updated_at: '' }]) })
    renderAt('/')
    expect(await screen.findByText(/Data stream interrupted/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Cannot reach the AquaRisk API/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('surfaces DATABASE_UNAVAILABLE as a readable message without stack traces', async () => {
    mockApi({ '/api/sensors': () => fail(503, 'DATABASE_UNAVAILABLE', 'Database is unreachable.') })
    renderAt('/sensors')
    expect(await screen.findByText('Database unavailable')).toBeInTheDocument()
    expect(screen.getByText('Database is unreachable.')).toBeInTheDocument()
    expect(screen.queryByText(/Traceback/)).not.toBeInTheDocument()
  })

  it('shows MODEL_NOT_READY from the prediction endpoint in the What-if Lab', async () => {
    mockApi({ '/api/ml/predict': () => fail(503, 'MODEL_NOT_READY', 'No trained model is registered.') })
    renderAt('/whatif')
    await userEvent.click(await screen.findByRole('button', { name: /Run prediction/ }))
    expect(await screen.findByText('Model not ready')).toBeInTheDocument()
  })
})

describe('empty states', () => {
  it('Live Sensors shows an empty state when no sensors exist', async () => {
    mockApi({ '/api/sensors': () => ok([], { count: 0 }) })
    renderAt('/sensors')
    expect(await screen.findByText(/No sensors registered/)).toBeInTheDocument()
  })
})
