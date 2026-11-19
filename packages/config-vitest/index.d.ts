import type { UserConfig } from 'vitest/config'

export interface SharedCoverageOptions extends Record<string, unknown> {
  provider?: string
  reporter?: string[]
  reportsDirectory?: string
  include?: string[]
  exclude?: string[]
}

export interface SharedVitestOptions {
  rootDir?: string | URL
  appDir?: string
  environment?: 'node' | 'happy-dom' | 'jsdom'
  vue?: boolean
  globals?: boolean
  alias?: Record<string, string>
  include?: string[]
  exclude?: string[]
  setupFiles?: string | string[]
  plugins?: unknown[]
  test?: Record<string, unknown>
  coverage?: SharedCoverageOptions
}

export declare const DEFAULT_EXCLUDES: string[]
export declare const DEFAULT_COVERAGE_EXCLUDES: string[]

export declare function createSharedCoverageConfig(
  options?: SharedCoverageOptions,
): SharedCoverageOptions

export declare function defineSharedVitestConfig(
  optionsOrRoot?: SharedVitestOptions | string | URL,
): UserConfig

export default defineSharedVitestConfig
