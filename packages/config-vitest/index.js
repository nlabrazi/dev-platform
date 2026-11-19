import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export const DEFAULT_EXCLUDES = [
  '**/node_modules/**',
  '**/.nuxt/**',
  '**/.output/**',
  '**/dist/**',
  '**/coverage/**',
  'tests/e2e/**',
  'e2e/**',
]

export const DEFAULT_COVERAGE_EXCLUDES = [
  ...DEFAULT_EXCLUDES,
  '**/*.css',
  '**/*.scss',
  '**/*.d.ts',
  '**/*.config.*',
  '**/tests/**',
  '**/__tests__/**',
  '**/*.{test,spec}.*',
]

export function createSharedCoverageConfig(options = {}) {
  const { exclude = [], ...rest } = options

  return {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    reportsDirectory: 'coverage',
    ...rest,
    exclude: [...new Set([...DEFAULT_COVERAGE_EXCLUDES, ...exclude])],
  }
}

function resolveRootDir(input) {
  if (!input) {
    return process.cwd()
  }
  if (typeof input === 'string' && input.startsWith('file://')) {
    const resolved = fileURLToPath(input)
    return path.extname(resolved) ? path.dirname(resolved) : resolved
  }
  if (input instanceof URL) {
    const resolved = fileURLToPath(input)
    return path.extname(resolved) ? path.dirname(resolved) : resolved
  }
  return String(input)
}

export function defineSharedVitestConfig(optionsOrRoot = {}) {
  const options =
    typeof optionsOrRoot === 'string' || optionsOrRoot instanceof URL
      ? { rootDir: optionsOrRoot }
      : optionsOrRoot

  const rootDir = resolveRootDir(options.rootDir)
  const appDir = path.resolve(rootDir, options.appDir ?? 'app')
  const serverDir = path.resolve(rootDir, 'server')
  const sharedDir = path.resolve(rootDir, 'shared')

  const enableVuePlugin = options.vue ?? options.environment === 'happy-dom'
  const plugins = [...(enableVuePlugin ? [vue()] : []), ...(options.plugins ?? [])]

  const { coverage: testCoverage, ...otherTestOptions } = options.test ?? {}
  const coverage = createSharedCoverageConfig({
    ...(options.coverage ?? {}),
    ...(testCoverage ?? {}),
    exclude: [...(options.coverage?.exclude ?? []), ...(testCoverage?.exclude ?? [])],
  })

  return defineConfig({
    plugins,
    resolve: {
      alias: {
        '#server': serverDir,
        '#shared': sharedDir,
        '~~': rootDir,
        '@@': rootDir,
        '~': appDir,
        '@': appDir,
        ...(options.alias ?? {}),
      },
    },
    test: {
      globals: options.globals ?? true,
      clearMocks: true,
      restoreMocks: true,
      environment: options.environment ?? 'node',
      ...(options.include ? { include: options.include } : {}),
      exclude: [...DEFAULT_EXCLUDES, ...(options.exclude ?? [])],
      ...(options.setupFiles ? { setupFiles: options.setupFiles } : {}),
      coverage,
      ...otherTestOptions,
    },
  })
}

export default defineSharedVitestConfig
