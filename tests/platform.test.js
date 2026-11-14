import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { defineSharedPlaywrightConfig } from '@nlabrazi/config-playwright'
import { defineSharedVitestConfig } from '@nlabrazi/config-vitest'

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
})

test('@nlabrazi/config-playwright configures desktop and optional mobile projects', () => {
  const desktopOnly = defineSharedPlaywrightConfig({ port: 3100 })
  assert.equal(desktopOnly.projects?.length, 1)
  assert.equal(desktopOnly.projects?.[0]?.name, 'chromium')

  const withMobile = defineSharedPlaywrightConfig({ port: 3100, mobile: true })
  assert.equal(withMobile.projects?.length, 3)
})

test('Renovate base preset defines @nlabrazi grouping and staging base branch', () => {
  const presetPath = path.join(rootDir, 'configs/renovate/base.json')
  const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'))

  assert.deepEqual(preset.baseBranchPatterns, ['staging'])
  assert.equal(preset.automerge, false)
  assert.ok(Array.isArray(preset.packageRules))
  assert.ok(preset.packageRules.some((rule) => rule.matchPackageNames?.includes('@nlabrazi/**')))
})
