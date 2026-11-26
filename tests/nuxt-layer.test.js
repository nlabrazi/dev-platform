import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { buildHealthPayload } from '@nlabrazi/nuxt-layer/health'
import { buildSiteSeoPayload, resolveCanonicalUrl } from '@nlabrazi/nuxt-layer/seo'
import {
  buildUmamiScriptTag,
  DEFAULT_UMAMI_SCRIPT_URL,
  isLocalHostname,
  matchesExcludedPath,
  normalizeUmamiDomains,
  shouldLoadUmami,
} from '@nlabrazi/nuxt-layer/umami'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const layerDir = path.join(rootDir, 'packages/nuxt-layer')

test('@nlabrazi/nuxt-layer exposes a headless zero-dependency Nuxt 4 layer package', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(layerDir, 'package.json'), 'utf8'))

  assert.equal(pkg.name, '@nlabrazi/nuxt-layer')
  assert.equal(pkg.main, './nuxt.config.ts')
  assert.equal(pkg.exports?.['.'], './nuxt.config.ts')
  assert.equal(pkg.publishConfig?.registry, 'https://npm.pkg.github.com')
  assert.equal(pkg.dependencies, undefined)
  assert.equal(pkg.peerDependencies?.nuxt, '>=4.0.0')
  assert.deepEqual(pkg.files, ['app', 'server', 'shared', 'nuxt.config.ts'])

  for (const relPath of [
    'nuxt.config.ts',
    'app/plugins/umami.ts',
    'app/composables/useUmami.ts',
    'app/composables/useSiteSeo.ts',
    'server/api/health.get.ts',
    'shared/utils/umami.ts',
    'shared/utils/health.ts',
    'shared/utils/seo.ts',
  ]) {
    assert.ok(fs.existsSync(path.join(layerDir, relPath)), `Missing layer file: ${relPath}`)
  }
})

test('Umami guards block dev, localhost, missing websiteId, disabled flag, and excluded paths', () => {
  const prodConfig = { websiteId: 'abc-123', excludePaths: ['/internal/**', '/admin', '/debug/*'] }

  assert.equal(shouldLoadUmami({}, { isDev: false, hostname: 'app.nabster.dev' }), false)
  assert.equal(
    shouldLoadUmami({ websiteId: '   ' }, { isDev: false, hostname: 'app.nabster.dev' }),
    false,
  )
  assert.equal(
    shouldLoadUmami(prodConfig, { isDev: true, hostname: 'app.nabster.dev', pathname: '/' }),
    false,
  )
  assert.equal(
    shouldLoadUmami(prodConfig, { isDev: false, hostname: 'localhost', pathname: '/' }),
    false,
  )
  assert.equal(
    shouldLoadUmami(prodConfig, { isDev: false, hostname: '127.0.0.1', pathname: '/' }),
    false,
  )
  assert.equal(
    shouldLoadUmami(prodConfig, { isDev: false, hostname: 'app.localhost', pathname: '/' }),
    false,
  )
  assert.equal(
    shouldLoadUmami(
      { ...prodConfig, enabled: false },
      { isDev: false, hostname: 'app.nabster.dev', pathname: '/' },
    ),
    false,
  )
  assert.equal(
    shouldLoadUmami(
      { ...prodConfig, enabled: 'false' },
      { isDev: false, hostname: 'app.nabster.dev', pathname: '/' },
    ),
    false,
  )

  // Production on non-excluded path
  assert.equal(
    shouldLoadUmami(prodConfig, {
      isDev: false,
      hostname: 'app.nabster.dev',
      pathname: '/pricing',
    }),
    true,
  )

  // Explicit override allows dev/localhost testing, but excluded paths STILL win
  assert.equal(
    shouldLoadUmami(
      { ...prodConfig, enabled: true },
      { isDev: true, hostname: 'localhost', pathname: '/' },
    ),
    true,
  )
  assert.equal(
    shouldLoadUmami(
      { ...prodConfig, enabled: 'true' },
      { isDev: false, hostname: 'app.nabster.dev', pathname: '/internal/tafsir' },
    ),
    false,
  )

  // Path matching rules
  assert.equal(matchesExcludedPath('/internal', ['/internal/**']), true)
  assert.equal(matchesExcludedPath('/internal/tafsir/', ['/internal/**']), true)
  assert.equal(matchesExcludedPath('/internal/a/b?foo=1', ['/internal/**']), true)
  assert.equal(matchesExcludedPath('/internal-public', ['/internal/**']), false)
  assert.equal(matchesExcludedPath('/admin/', ['/admin']), true)
  assert.equal(matchesExcludedPath('/admin/users', ['/admin']), false)
  assert.equal(matchesExcludedPath('/debug/logs', ['/debug/*']), true)
  assert.equal(matchesExcludedPath('/debug/logs/deep', ['/debug/*']), false)

  assert.equal(isLocalHostname('::1'), true)
  assert.equal(isLocalHostname('riftvision.nabster.dev'), false)
})

test('buildUmamiScriptTag generates clean script attributes with defaults and overrides', () => {
  assert.equal(buildUmamiScriptTag({}), null)

  const minimal = buildUmamiScriptTag({ websiteId: 'site-1' })
  assert.deepEqual(minimal, {
    key: 'nlabrazi-umami',
    src: DEFAULT_UMAMI_SCRIPT_URL,
    defer: true,
    'data-website-id': 'site-1',
  })

  const full = buildUmamiScriptTag({
    websiteId: 'site-2',
    scriptUrl: '/stats/script.js',
    domains: ['riftvision.nabster.dev', 'www.riftvision.nabster.dev'],
    doNotTrack: true,
    autoTrack: false,
  })
  assert.deepEqual(full, {
    key: 'nlabrazi-umami',
    src: '/stats/script.js',
    defer: true,
    'data-website-id': 'site-2',
    'data-domains': 'riftvision.nabster.dev,www.riftvision.nabster.dev',
    'data-do-not-track': 'true',
    'data-auto-track': 'false',
  })

  assert.equal(normalizeUmamiDomains(' a.dev , , b.dev '), 'a.dev,b.dev')
})

test('buildHealthPayload formats service name, integer uptime, and ISO timestamp', () => {
  const fixedNow = new Date('2026-11-26T12:00:00.000Z')
  assert.deepEqual(
    buildHealthPayload({ service: 'riftvision', uptimeSeconds: 123.9, now: fixedNow }),
    {
      status: 'ok',
      service: 'riftvision',
      uptimeSeconds: 123,
      timestamp: '2026-11-26T12:00:00.000Z',
    },
  )

  const fallback = buildHealthPayload({ service: '  ', uptimeSeconds: -5, now: fixedNow })
  assert.equal(fallback.service, 'nuxt-app')
  assert.equal(fallback.uptimeSeconds, 0)
})

test('buildSiteSeoPayload merges site defaults, canonical URL, and noindex flags', () => {
  assert.equal(
    resolveCanonicalUrl('https://riftvision.nabster.dev', '/lol/champions'),
    'https://riftvision.nabster.dev/lol/champions',
  )
  assert.equal(
    resolveCanonicalUrl('https://riftvision.nabster.dev/', '/'),
    'https://riftvision.nabster.dev/',
  )
  assert.equal(resolveCanonicalUrl('', '/relative'), undefined)

  const payload = buildSiteSeoPayload(
    {
      title: 'Champions LoL',
      description: 'Guide complet',
      path: '/lol/champions',
      noindex: true,
    },
    {
      name: 'RiftVision',
      url: 'https://riftvision.nabster.dev',
      ogImage: 'https://riftvision.nabster.dev/og.png',
      locale: 'fr_FR',
    },
  )

  assert.equal(payload.canonicalUrl, 'https://riftvision.nabster.dev/lol/champions')
  assert.equal(payload.seoMeta.title, 'Champions LoL')
  assert.equal(payload.seoMeta.ogTitle, 'Champions LoL')
  assert.equal(payload.seoMeta.ogSiteName, 'RiftVision')
  assert.equal(payload.seoMeta.ogImage, 'https://riftvision.nabster.dev/og.png')
  assert.equal(payload.seoMeta.ogImageAlt, 'Champions LoL')
  assert.equal(payload.seoMeta.ogLocale, 'fr_FR')
  assert.equal(payload.seoMeta.robots, 'noindex, nofollow')
  assert.equal(payload.seoMeta.twitterCard, 'summary_large_image')
})
