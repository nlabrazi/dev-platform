export interface HealthPayloadOptions {
  service?: string
  uptimeSeconds?: number
  now?: Date
}

export interface HealthPayload {
  status: 'ok'
  service: string
  uptimeSeconds: number
  timestamp: string
}

export function buildHealthPayload(options: HealthPayloadOptions = {}): HealthPayload {
  const service = options.service?.trim() || 'nuxt-app'
  const rawUptime = typeof options.uptimeSeconds === 'number' ? options.uptimeSeconds : 0
  const uptimeSeconds = Number.isFinite(rawUptime) ? Math.max(0, Math.floor(rawUptime)) : 0
  const timestamp = (options.now ?? new Date()).toISOString()

  return {
    status: 'ok',
    service,
    uptimeSeconds,
    timestamp,
  }
}
