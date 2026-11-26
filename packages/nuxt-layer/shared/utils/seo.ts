export interface SiteSeoDefaults {
  name?: string
  url?: string
  description?: string
  ogImage?: string
  locale?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
}

export interface SiteSeoOptions {
  title?: string
  description?: string
  path?: string
  url?: string
  image?: string
  imageAlt?: string
  type?: 'website' | 'article'
  locale?: string
  noindex?: boolean
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
}

export interface SiteSeoPayload {
  seoMeta: {
    title?: string
    ogTitle?: string
    twitterTitle?: string
    description?: string
    ogDescription?: string
    twitterDescription?: string
    ogSiteName?: string
    ogType: 'website' | 'article'
    ogLocale?: string
    ogUrl?: string
    ogImage?: string
    ogImageAlt?: string
    twitterImage?: string
    twitterImageAlt?: string
    twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player'
    robots?: string
  }
  canonicalUrl?: string
}

export function resolveCanonicalUrl(
  siteUrl: string | undefined,
  pathOrUrl: string | undefined,
): string | undefined {
  const candidate = pathOrUrl?.trim()
  if (candidate && /^https?:\/\//i.test(candidate)) {
    return candidate
  }
  const base = siteUrl?.trim()
  if (!base) {
    return undefined
  }
  try {
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    const relative = candidate ? candidate.replace(/^\/+/, '') : ''
    const resolved = new URL(relative, normalizedBase)
    const serialized = resolved.toString()
    return resolved.pathname === '/' ? serialized : serialized.replace(/\/+$/, '')
  } catch {
    return undefined
  }
}

export function buildSiteSeoPayload(
  options: SiteSeoOptions = {},
  defaults: SiteSeoDefaults = {},
): SiteSeoPayload {
  const siteName = defaults.name?.trim() || undefined
  const title = options.title?.trim() || siteName
  const description = options.description?.trim() || defaults.description?.trim() || undefined
  const image = options.image?.trim() || defaults.ogImage?.trim() || undefined
  const imageAlt = options.imageAlt?.trim() || title
  const locale = options.locale?.trim() || defaults.locale?.trim() || undefined
  const ogType = options.type ?? 'website'
  const twitterCard = options.twitterCard ?? defaults.twitterCard ?? 'summary_large_image'
  const canonicalUrl = resolveCanonicalUrl(defaults.url, options.url ?? options.path)

  const seoMeta: SiteSeoPayload['seoMeta'] = {
    ogType,
    twitterCard,
  }

  if (title) {
    seoMeta.title = title
    seoMeta.ogTitle = title
    seoMeta.twitterTitle = title
  }
  if (description) {
    seoMeta.description = description
    seoMeta.ogDescription = description
    seoMeta.twitterDescription = description
  }
  if (siteName) {
    seoMeta.ogSiteName = siteName
  }
  if (locale) {
    seoMeta.ogLocale = locale
  }
  if (canonicalUrl) {
    seoMeta.ogUrl = canonicalUrl
  }
  if (image) {
    seoMeta.ogImage = image
    seoMeta.twitterImage = image
    if (imageAlt) {
      seoMeta.ogImageAlt = imageAlt
      seoMeta.twitterImageAlt = imageAlt
    }
  }
  if (options.noindex) {
    seoMeta.robots = 'noindex, nofollow'
  }

  return {
    seoMeta,
    canonicalUrl,
  }
}
