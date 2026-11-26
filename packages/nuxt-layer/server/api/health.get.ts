import { buildHealthPayload } from '../../shared/utils/health'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const config = useRuntimeConfig(event)
  const configuredService = (config.health as { service?: string } | undefined)?.service
  const service =
    configuredService ||
    process.env.NUXT_HEALTH_SERVICE ||
    process.env.npm_package_name ||
    'nuxt-app'

  return buildHealthPayload({
    service,
    uptimeSeconds: process.uptime(),
  })
})
