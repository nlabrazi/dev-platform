import { computed } from 'vue'
import { defineNuxtPlugin, useHead, useRequestURL, useRoute, useRuntimeConfig } from '#imports'
import {
  buildUmamiScriptTag,
  shouldLoadUmami,
  type UmamiLayerConfig,
} from '../../shared/utils/umami'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const requestUrl = useRequestURL({ xForwardedHost: true })
  const route = useRoute()

  const umamiConfig = computed<UmamiLayerConfig>(
    () => (runtimeConfig.public?.umami as UmamiLayerConfig | undefined) ?? {},
  )

  const currentPathname = computed(() => {
    if (import.meta.server) {
      return requestUrl.pathname || '/'
    }
    const routePath = typeof route?.path === 'string' ? route.path : ''
    if (routePath && routePath !== '/') {
      return routePath
    }
    if (typeof window !== 'undefined' && window.location?.pathname) {
      return window.location.pathname
    }
    return routePath || requestUrl.pathname || '/'
  })

  const currentHostname = computed(() => {
    if (import.meta.client && typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname
    }
    return requestUrl.hostname || ''
  })

  useHead(() => {
    const cfg = umamiConfig.value
    const active = shouldLoadUmami(cfg, {
      isDev: import.meta.dev,
      hostname: currentHostname.value,
      pathname: currentPathname.value,
    })

    if (!active) {
      return { script: [] }
    }

    const scriptTag = buildUmamiScriptTag(cfg)
    return { script: scriptTag ? [{ ...scriptTag }] : [] }
  })
})
