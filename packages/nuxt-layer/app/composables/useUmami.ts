import { useRequestURL, useRoute, useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import { useRequestURL, useRoute, useRuntimeConfig } from '#imports'
import { shouldLoadUmami, type UmamiLayerConfig } from '../../shared/utils/umami'

export type UmamiEventData = Record<string, string | number | boolean | null | undefined>

interface UmamiGlobal {
  track: (eventName: string, data?: UmamiEventData) => void | Promise<void>
  identify?: (data: UmamiEventData) => void | Promise<void>
}

export function useUmami() {
  const runtimeConfig = useRuntimeConfig()
  const requestUrl = useRequestURL({ xForwardedHost: true })
  const route = useRoute()

  const isEnabled = computed(() => {
    const cfg = (runtimeConfig.public?.umami as UmamiLayerConfig | undefined) ?? {}
    const hostname =
      import.meta.client && typeof window !== 'undefined' && window.location?.hostname
        ? window.location.hostname
        : requestUrl.hostname || ''
    const pathname =
      import.meta.client && typeof window !== 'undefined' && window.location?.pathname
        ? route?.path && route.path !== '/'
          ? route.path
          : window.location.pathname
        : requestUrl.pathname || '/'

    return shouldLoadUmami(cfg, {
      isDev: import.meta.dev,
      hostname,
      pathname,
    })
  })

  const getClientUmami = (): UmamiGlobal | null => {
    if (!import.meta.client || typeof window === 'undefined') {
      return null
    }
    const candidate = (window as unknown as { umami?: UmamiGlobal }).umami
    return candidate && typeof candidate.track === 'function' ? candidate : null
  }

  const track = (eventName: string, data?: UmamiEventData): void => {
    if (!isEnabled.value || !eventName.trim()) {
      return
    }
    try {
      const client = getClientUmami()
      if (!client) {
        return
      }
      if (data) {
        client.track(eventName, data)
      } else {
        client.track(eventName)
      }
    } catch {
      // Analytics must never interrupt application execution.
    }
  }

  const identify = (data: UmamiEventData): void => {
    if (!isEnabled.value) {
      return
    }
    try {
      const client = getClientUmami()
      client?.identify?.(data)
    } catch {
      // Analytics must never interrupt application execution.
    }
  }

  return {
    isEnabled,
    track,
    identify,
  }
}
