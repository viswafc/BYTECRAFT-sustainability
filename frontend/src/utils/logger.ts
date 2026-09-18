/** Dev-only frontend logger. Silent in production builds. */
const enabled = import.meta.env.DEV

export const logger = {
  debug: (...a: unknown[]) => { if (enabled) console.debug('[aquarisk]', ...a) },
  info: (...a: unknown[]) => { if (enabled) console.info('[aquarisk]', ...a) },
  warn: (...a: unknown[]) => { if (enabled) console.warn('[aquarisk]', ...a) },
  error: (...a: unknown[]) => { if (enabled) console.error('[aquarisk]', ...a) },
}
