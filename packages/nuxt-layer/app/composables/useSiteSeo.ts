import { useHead, useRuntimeConfig, useSeoMeta } from '#imports'
import {
  buildSiteSeoPayload,
  type SiteSeoDefaults,
  type SiteSeoOptions,
} from '../../shared/utils/seo'

export function useSiteSeo(options: SiteSeoOptions | (() => SiteSeoOptions) = {}) {
  const runtimeConfig = useRuntimeConfig()
  const defaults = (runtimeConfig.public?.site as SiteSeoDefaults | undefined) ?? {}

  const resolve = () =>
    buildSiteSeoPayload(typeof options === 'function' ? options() : options, defaults)

  const initial = resolve()
  useSeoMeta(
    typeof options === 'function'
      ? {
          title: () => resolve().seoMeta.title,
          ogTitle: () => resolve().seoMeta.ogTitle,
          twitterTitle: () => resolve().seoMeta.twitterTitle,
          description: () => resolve().seoMeta.description,
          ogDescription: () => resolve().seoMeta.ogDescription,
          twitterDescription: () => resolve().seoMeta.twitterDescription,
          ogSiteName: () => resolve().seoMeta.ogSiteName,
          ogType: () => resolve().seoMeta.ogType,
          ogLocale: () => resolve().seoMeta.ogLocale,
          ogUrl: () => resolve().seoMeta.ogUrl,
          ogImage: () => resolve().seoMeta.ogImage,
          ogImageAlt: () => resolve().seoMeta.ogImageAlt,
          twitterImage: () => resolve().seoMeta.twitterImage,
          twitterImageAlt: () => resolve().seoMeta.twitterImageAlt,
          twitterCard: () => resolve().seoMeta.twitterCard,
          robots: () => resolve().seoMeta.robots,
        }
      : initial.seoMeta,
  )

  useHead(() => {
    const { canonicalUrl } = resolve()
    return canonicalUrl
      ? { link: [{ key: 'canonical', rel: 'canonical', href: canonicalUrl }] }
      : {}
  })
}
