import '@testing-library/jest-dom/vitest'

// jsdom has no WebSocket that reaches a server; stub a silent one so the shell can mount.
class FakeWS {
  static instances: FakeWS[] = []
  onopen: (() => void) | null = null
  onmessage: ((ev: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null
  readyState = 0
  url: string
  constructor(url: string) { this.url = url; FakeWS.instances.push(this); setTimeout(() => { this.readyState = 1; this.onopen?.() }, 0) }
  send() {}
  close() { this.readyState = 3; this.onclose?.() }
}
;(globalThis as unknown as { WebSocket: unknown }).WebSocket = FakeWS
;(globalThis as unknown as { __FakeWS: typeof FakeWS }).__FakeWS = FakeWS
