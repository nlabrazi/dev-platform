import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { defineSharedPlaywrightConfig } from '@nlabrazi/config-playwright'
import {
  createSharedCoverageConfig,
  DEFAULT_COVERAGE_EXCLUDES,
  DEFAULT_EXCLUDES,
  defineSharedVitestConfig,
} from '@nlabrazi/config-vitest'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('@nlabrazi/config-biome provides complete JS/TS/Vue configuration', () => {
  const configPath = path.join(rootDir, 'packages/config-biome/configs/recommended.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

  assert.equal(config.vcs?.enabled, true)
  assert.equal(config.formatter?.indentStyle, 'space')
  assert.equal(config.formatter?.indentWidth, 2)
  assert.equal(config.formatter?.lineWidth, 100)
  assert.equal(config.javascript?.formatter?.quoteStyle, 'single')
  assert.equal(config.javascript?.formatter?.semicolons, 'asNeeded')
  assert.ok(Array.isArray(config.overrides))
  assert.ok(config.overrides.some((entry) => entry.includes?.includes('**/*.vue')))
})

test('@nlabrazi/tsconfig exposes valid JSON configurations', () => {
  for (const name of ['base.json', 'node.json', 'nuxt.json']) {
    const filePath = path.join(rootDir, 'packages/tsconfig', name)
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    assert.ok(parsed.compilerOptions, `${name} must define compilerOptions`)
  }
})

test('@nlabrazi/config-vitest builds Nuxt/Vue aliases and exclusions', () => {
  const config = defineSharedVitestConfig({
    rootDir: '/tmp/sample-app',
    environment: 'happy-dom',
  })

  assert.equal(config.resolve?.alias?.['~'], '/tmp/sample-app/app')
  assert.equal(config.resolve?.alias?.['#shared'], '/tmp/sample-app/shared')
  assert.equal(config.test?.environment, 'happy-dom')
  assert.ok(config.test?.exclude?.includes('tests/e2e/**'))
  assert.equal(config.test?.coverage?.provider, 'v8')
  assert.deepEqual(config.test?.coverage?.reporter, ['text', 'html', 'lcov'])
  assert.equal(config.test?.coverage?.reportsDirectory, 'coverage')
  assert.ok(config.test?.coverage?.exclude?.includes('**/*.css'))
  assert.ok(config.test?.coverage?.exclude?.includes('**/tests/**'))
  assert.ok(config.test?.coverage?.exclude?.includes('**/*.d.ts'))
  assert.ok(config.test?.coverage?.exclude?.includes('**/*.config.*'))

  const customConfig = defineSharedVitestConfig({
    coverage: {
      reportsDirectory: 'custom-coverage',
      exclude: ['**/generated/**'],
    },
  })
  assert.equal(customConfig.test?.coverage?.provider, 'v8')
  assert.equal(customConfig.test?.coverage?.reportsDirectory, 'custom-coverage')
  assert.ok(customConfig.test?.coverage?.exclude?.includes('**/*.css'))
  assert.ok(customConfig.test?.coverage?.exclude?.includes('**/generated/**'))

  const standaloneCoverage = createSharedCoverageConfig()
  assert.equal(standaloneCoverage.provider, 'v8')
  assert.deepEqual(standaloneCoverage.reporter, ['text', 'html', 'lcov'])
  assert.equal(standaloneCoverage.reportsDirectory, 'coverage')
  assert.deepEqual(standaloneCoverage.exclude, DEFAULT_COVERAGE_EXCLUDES)
  assert.ok(DEFAULT_EXCLUDES.includes('tests/e2e/**'))

  const scopedCoverage = createSharedCoverageConfig({
    include: ['src/**'],
    exclude: ['**/*.css', '**/generated/**'],
    thresholds: { lines: 80 },
  })
  assert.deepEqual(scopedCoverage.include, ['src/**'])
  assert.equal(scopedCoverage.exclude.filter((item) => item === '**/*.css').length, 1)
  assert.ok(scopedCoverage.exclude.includes('**/generated/**'))
  assert.deepEqual(scopedCoverage.thresholds, { lines: 80 })

  const mergedThresholds = defineSharedVitestConfig({
    coverage: { thresholds: { lines: 80, branches: 70 } },
    test: { coverage: { thresholds: { lines: 85 } } },
  })
  assert.deepEqual(mergedThresholds.test?.coverage?.thresholds, { lines: 85, branches: 70 })

  const topThresholdsOnly = defineSharedVitestConfig({
    coverage: { thresholds: { lines: 75 } },
  })
  assert.deepEqual(topThresholdsOnly.test?.coverage?.thresholds, { lines: 75 })

  const testThresholdsOnly = defineSharedVitestConfig({
    test: { coverage: { thresholds: { functions: 70 } } },
  })
  assert.deepEqual(testThresholdsOnly.test?.coverage?.thresholds, { functions: 70 })
})

test('@nlabrazi/config-vitest handles file URLs, directories and custom test options', () => {
  const fromDefaults = defineSharedVitestConfig()
  assert.equal(fromDefaults.resolve?.alias?.['~~'], process.cwd())
  assert.equal(fromDefaults.test?.environment, 'node')

  const fromFileUrlString = defineSharedVitestConfig('file:///tmp/app/vitest.config.ts')
  assert.equal(fromFileUrlString.resolve?.alias?.['~~'], '/tmp/app')

  const fromDirUrlString = defineSharedVitestConfig('file:///tmp/app')
  assert.equal(fromDirUrlString.resolve?.alias?.['~~'], '/tmp/app')

  const fromFileUrl = defineSharedVitestConfig(new URL('file:///tmp/url-app/vitest.config.ts'))
  assert.equal(fromFileUrl.resolve?.alias?.['~~'], '/tmp/url-app')

  const fromDirUrl = defineSharedVitestConfig(new URL('file:///tmp/url-app'))
  assert.equal(fromDirUrl.resolve?.alias?.['~~'], '/tmp/url-app')

  const customPlugin = { name: 'custom-plugin' }
  const custom = defineSharedVitestConfig({
    rootDir: '/tmp/custom-app',
    appDir: 'src',
    environment: 'happy-dom',
    vue: false,
    globals: false,
    plugins: [customPlugin],
    alias: { '#custom': '/tmp/custom' },
    include: ['src/**/*.test.ts'],
    exclude: ['**/legacy/**'],
    setupFiles: ['./tests/setup.ts'],
    test: {
      pool: 'threads',
      coverage: {
        reportsDirectory: 'test-cov',
        exclude: ['**/fixtures/**'],
      },
    },
  })

  assert.equal(custom.resolve?.alias?.['~'], '/tmp/custom-app/src')
  assert.equal(custom.resolve?.alias?.['#custom'], '/tmp/custom')
  assert.deepEqual(custom.plugins, [customPlugin])
  assert.equal(custom.test?.globals, false)
  assert.deepEqual(custom.test?.include, ['src/**/*.test.ts'])
  assert.ok(custom.test?.exclude?.includes('**/legacy/**'))
  assert.deepEqual(custom.test?.setupFiles, ['./tests/setup.ts'])
  assert.equal(custom.test?.pool, 'threads')
  assert.equal(custom.test?.coverage?.reportsDirectory, 'test-cov')
  assert.ok(custom.test?.coverage?.exclude?.includes('**/fixtures/**'))
})

test('@nlabrazi/config-playwright configures desktop and optional mobile projects', () => {
  const desktopOnly = defineSharedPlaywrightConfig({ port: 3100 })
  assert.equal(desktopOnly.projects?.length, 1)
  assert.equal(desktopOnly.projects?.[0]?.name, 'chromium')

  const withMobile = defineSharedPlaywrightConfig({ port: 3100, mobile: true })
  assert.equal(withMobile.projects?.length, 3)
})

test('@nlabrazi/config-playwright handles CI, external URLs, fallbacks and overrides', () => {
  const previousEnv = {
    CI: process.env.CI,
    PORT: process.env.PORT,
    PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
  }

  try {
    delete process.env.CI
    delete process.env.PORT
    delete process.env.PLAYWRIGHT_BASE_URL

    const defaults = defineSharedPlaywrightConfig()
    assert.equal(defaults.use?.baseURL, 'http://localhost:3000')
    assert.equal(defaults.webServer?.command, 'npm run dev -- --port 3000')
    assert.equal(defaults.webServer?.reuseExistingServer, true)
    assert.equal(defaults.retries, 0)

    const invalidUrl = defineSharedPlaywrightConfig({ baseURL: 'not-a-valid-url', port: 4100 })
    assert.equal(invalidUrl.webServer?.env?.PORT, '4100')

    const portlessUrl = defineSharedPlaywrightConfig({
      baseURL: 'https://example.test',
      port: 4200,
    })
    assert.equal(portlessUrl.webServer?.env?.PORT, '4200')

    const disabledWebServer = defineSharedPlaywrightConfig({ webServer: false })
    assert.equal(disabledWebServer.webServer, undefined)

    process.env.CI = 'true'
    process.env.PORT = '4300'
    const ciBuilt = defineSharedPlaywrightConfig({ useBuiltServerInCI: true })
    assert.equal(ciBuilt.forbidOnly, true)
    assert.equal(ciBuilt.retries, 1)
    assert.equal(ciBuilt.workers, 1)
    assert.equal(ciBuilt.webServer?.command, 'node .output/server/index.mjs')
    assert.equal(ciBuilt.webServer?.reuseExistingServer, false)

    process.env.PLAYWRIGHT_BASE_URL = 'https://staging.example.test'
    const skippedExternal = defineSharedPlaywrightConfig({ skipWebServerOnExternalUrl: true })
    assert.equal(skippedExternal.use?.baseURL, 'https://staging.example.test')
    assert.equal(skippedExternal.webServer, undefined)

    const customized = defineSharedPlaywrightConfig({
      testDir: './e2e',
      timeout: 60_000,
      expectTimeout: 10_000,
      fullyParallel: true,
      retries: 2,
      workers: 4,
      reporter: 'html',
      trace: 'retain-on-failure',
      use: { locale: 'fr-FR' },
      projects: [{ name: 'custom' }],
      command: 'npm run preview',
      webServerTimeout: 90_000,
      env: { NODE_ENV: 'test' },
      overrides: { outputDir: 'playwright-out' },
    })
    assert.equal(customized.testDir, './e2e')
    assert.equal(customized.timeout, 60_000)
    assert.equal(customized.expect?.timeout, 10_000)
    assert.equal(customized.fullyParallel, true)
    assert.equal(customized.retries, 2)
    assert.equal(customized.workers, 4)
    assert.equal(customized.reporter, 'html')
    assert.equal(customized.use?.trace, 'retain-on-failure')
    assert.equal(customized.use?.locale, 'fr-FR')
    assert.deepEqual(customized.projects, [{ name: 'custom' }])
    assert.equal(customized.webServer?.command, 'npm run preview')
    assert.equal(customized.webServer?.timeout, 90_000)
    assert.equal(customized.webServer?.env?.NODE_ENV, 'test')
    assert.equal(customized.outputDir, 'playwright-out')
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
})

test('Renovate base preset defines @nlabrazi grouping, central npmrc, and staging base branch', () => {
  const presetPath = path.join(rootDir, 'configs/renovate/base.json')
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'))

  assert.deepEqual(preset.baseBranchPatterns, ['staging'])
  assert.equal(preset.dependencyDashboard, true)
  assert.equal(preset.dependencyDashboardApproval, true)
  assert.equal(preset.automerge, false)
  assert.equal(preset.npmrc, '@nlabrazi:registry=https://npm.pkg.github.com/')
  assert.ok(Array.isArray(preset.packageRules))
  assert.ok(preset.packageRules.some((rule) => rule.matchPackageNames?.includes('@nlabrazi/**')))

  const repoRenovatePath = path.join(rootDir, 'renovate.json')
  const repoRenovate = JSON.parse(fs.readFileSync(repoRenovatePath, 'utf8'))
  assert.equal(repoRenovate.rangeStrategy, 'bump')
})

test('Renovate automerge preset uses branch automerge with cooldown and manual guards', () => {
  const presetPath = path.join(rootDir, 'configs/renovate/automerge.json')
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'))

  assert.equal(preset.dependencyDashboard, true)
  assert.equal(preset.dependencyDashboardApproval, true)
  assert.equal(preset.automerge, false)
  assert.equal(preset.platformAutomerge, false)
  assert.deepEqual(preset.schedule, ['before 6am on monday'])
  assert.deepEqual(preset.automergeSchedule, ['at any time'])
  assert.equal(preset.internalChecksFilter, 'strict')
  assert.equal(preset.prCreation, 'not-pending')
  assert.ok(Array.isArray(preset.packageRules))

  const nlabraziRule = preset.packageRules.find((r) =>
    r.matchPackageNames?.includes('@nlabrazi/**'),
  )
  assert.equal(nlabraziRule?.automerge, true)
  assert.equal(nlabraziRule?.automergeType, 'branch')
  assert.equal(nlabraziRule?.dependencyDashboardApproval, false)
  assert.equal(nlabraziRule?.minimumReleaseAge, '0 days')
  assert.ok(nlabraziRule?.excludePackageNames?.includes('@nlabrazi/config-playwright'))

  const patchRule = preset.packageRules.find(
    (r) => r.matchUpdateTypes?.length === 1 && r.matchUpdateTypes[0] === 'patch',
  )
  assert.equal(patchRule?.automerge, true)
  assert.equal(patchRule?.automergeType, 'branch')
  assert.equal(patchRule?.minimumReleaseAge, '3 days')

  const minorRule = preset.packageRules.find(
    (r) => r.matchUpdateTypes?.includes('minor') && r.automerge === true && !r.matchPackageNames,
  )
  assert.equal(minorRule?.automergeType, 'branch')
  assert.equal(minorRule?.minimumReleaseAge, '3 days')
  assert.ok(minorRule?.matchCurrentVersion?.startsWith('!'))

  const guardRules = preset.packageRules.filter((r) => r.automerge === false)
  assert.ok(guardRules.some((r) => r.matchUpdateTypes?.includes('major')))
  assert.ok(guardRules.some((r) => r.matchManagers?.includes('dockerfile')))
  assert.ok(guardRules.some((r) => r.matchPackageNames?.includes('/playwright/')))
  assert.ok(guardRules.every((r) => r.dependencyDashboardApproval === true && r.groupName === null))
})
