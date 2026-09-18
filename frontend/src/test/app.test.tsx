import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../App'

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body }) as Response

function mockApi(overrides: Record<string, () => Promise<Response>> = {}) {
  const routes: Record<string, () => Promise<Response>> = {
    '/health': async () => ok({ status: 'healthy', version: '0.1.0' }),
    '/api/version': async () => ok({ name: 'AquaRisk AI', version: '0.1.0', api_version: 'v1', environment: 'test', phase: '1' }),
    '/api/system/status': async () => ok({
      status: 'ok', version: '0.1.0', timestamp: new Date().toISOString(),
      components: [{ name: 'dataset', status: 'ok', detail: '5000 rows', info: {} }, { name: 'model', status: 'ok', detail: 'rf', info: {} }],
    }),
    '/api/data/health': async () => ok({ status: 'ok', dataset_path: 'x.csv', rows: 5000, columns: 13, missing_values: 0, duplicate_rows: 0, positive_rate: 0.0646, schema_valid: true }),
    '/api/models': async () => ok({ default: 'B/rf', models: [] }),
    ...overrides,
  }
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    const path = url.split('?')[0]
    const handler = routes[path]
    return handler ? handler() : Promise.resolve({ ok: false, status: 404, json: async () => ({}) } as Response)
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('AquaRisk frontend', () => {
  it('loads the application shell and Command Center', async () => {
    mockApi()
    render(<MemoryRouter><AppRoutes /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Command Center' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/System ok/i)).toBeInTheDocument())
  })

  it('navigates between pages', async () => {
    mockApi()
    render(<MemoryRouter><AppRoutes /></MemoryRouter>)
    await userEvent.click(screen.getByRole('link', { name: /Data Health/ }))
    expect(await screen.findByRole('heading', { name: 'Data Health' })).toBeInTheDocument()
    expect(await screen.findByText('5000')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: /API Health/ }))
    expect(await screen.findByRole('heading', { name: 'API Health' })).toBeInTheDocument()
  })

  it('shows a human-readable error state when the API is unreachable', async () => {
    mockApi({
      '/api/system/status': () => Promise.reject(new TypeError('Failed to fetch')),
      '/api/models': () => Promise.reject(new TypeError('Failed to fetch')),
    })
    render(<MemoryRouter><AppRoutes /></MemoryRouter>)
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Cannot reach the AquaRisk API/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/API offline/i)).toBeInTheDocument()
  })

  it('surfaces backend error messages without stack traces', async () => {
    mockApi({
      '/api/data/health': async () => ({ ok: false, status: 503, json: async () => ({ error: { code: 'model_unavailable', message: 'Dataset missing on server' } }) }) as Response,
    })
    render(<MemoryRouter initialEntries={['/data']}><AppRoutes /></MemoryRouter>)
    expect(await screen.findByText('Dataset missing on server')).toBeInTheDocument()
  })
})
