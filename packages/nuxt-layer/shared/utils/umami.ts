export const DEFAULT_UMAMI_SCRIPT_URL = 'https://umami.nabster.dev/script.js'

export interface UmamiLayerConfig {
  websiteId?: string
  scriptUrl?: string
  domains?: string | readonly string[]
  excludePaths?: readonly string[]
  doNotTrack?: boolean | string
  autoTrack?: boolean | string
  enabled?: boolean | string
}

export interface UmamiEvalContext {
  isDev?: boolean
  hostname?: string
  pathname?: string
}

export type UmamiScriptTag = {
  key: string
  src: string
  defer: true
  'data-website-id': string
  'data-domains'?: string
  'data-do-not-track'?: 'true'
  'data-auto-track'?: 'false'
}

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'])

export function parseOptionalBoolean(value: boolean | string | undefined): boolean | undefined {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value !== 'string') {
    return undefined
  }
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') {
    return true
  }
  if (normalized === 'false' || normalized === '0') {
    return false
  }
  return undefined
}

export function isLocalHostname(hostname: string | undefined): boolean {
  if (!hostname) {
    return false
  }
  const clean = hostname.trim().toLowerCase()
  return LOCAL_HOSTNAMES.has(clean) || clean.endsWith('.localhost')
}

export function normalizePathname(pathname: string | undefined): string {
  if (!pathname) {
    return '/'
  }
  const withoutQuery = pathname.split(/[?#]/, 1)[0] ?? '/'
  const prefixed = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  const trimmed = prefixed.replace(/\/+$/, '')
  return trimmed || '/'
}

export function matchesExcludedPath(
  pathname: string | undefined,
  excludePaths: readonly string[] | undefined,
): boolean {
  if (!excludePaths || excludePaths.length === 0) {
    return false
  }
  const current = normalizePathname(pathname)
  for (const rawPattern of excludePaths) {
    if (typeof rawPattern !== 'string' || !rawPattern.trim()) {
      continue
    }
    const pattern = rawPattern.trim()
    if (pattern.endsWith('/**')) {
      const prefix = normalizePathname(pattern.slice(0, -3))
      if (prefix === '/' || current === prefix || current.startsWith(`${prefix}/`)) {
        return true
      }
      continue
    }
    if (pattern.endsWith('/*')) {
      const prefix = normalizePathname(pattern.slice(0, -2))
      if (current === prefix) {
        return true
      }
      if (current.startsWith(`${prefix}/`)) {
        const rest = current.slice(prefix.length + 1)
        if (rest && !rest.includes('/')) {
          return true
        }
      }
      continue
    }
    if (current === normalizePathname(pattern)) {
      return true
    }
  }
  return false
}

export function normalizeUmamiDomains(
  domains: string | readonly string[] | undefined,
): string | undefined {
  if (Array.isArray(domains)) {
    const joined = domains
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .join(',')
    return joined || undefined
  }
  if (typeof domains === 'string') {
    const cleaned = domains
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .join(',')
    return cleaned || undefined
  }
  return undefined
}

export function shouldLoadUmami(
  config: UmamiLayerConfig | undefined,
  context: UmamiEvalContext = {},
): boolean {
  const websiteId = typeof config?.websiteId === 'string' ? config.websiteId.trim() : ''
  if (!websiteId) {
    return false
  }

  const explicit = parseOptionalBoolean(config?.enabled)
  if (explicit === false) {
    return false
  }

  if (matchesExcludedPath(context.pathname, config?.excludePaths)) {
    return false
  }

  if (explicit === true) {
    return true
  }

  if (context.isDev) {
    return false
  }

  if (isLocalHostname(context.hostname)) {
    return false
  }

  return true
}

export function buildUmamiScriptTag(config: UmamiLayerConfig): UmamiScriptTag | null {
  const websiteId = typeof config.websiteId === 'string' ? config.websiteId.trim() : ''
  if (!websiteId) {
    return null
  }

  const scriptUrl =
    typeof config.scriptUrl === 'string' && config.scriptUrl.trim()
      ? config.scriptUrl.trim()
      : DEFAULT_UMAMI_SCRIPT_URL

  const tag: UmamiScriptTag = {
    key: 'nlabrazi-umami',
    src: scriptUrl,
    defer: true,
    'data-website-id': websiteId,
  }

  const domains = normalizeUmamiDomains(config.domains)
  if (domains) {
    tag['data-domains'] = domains
  }

  if (parseOptionalBoolean(config.doNotTrack) === true) {
    tag['data-do-not-track'] = 'true'
  }

  if (parseOptionalBoolean(config.autoTrack) === false) {
    tag['data-auto-track'] = 'false'
  }

  return tag
}
