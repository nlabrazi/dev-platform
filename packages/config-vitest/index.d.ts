import type { UserConfig } from 'vitest/config'

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
}

export declare function defineSharedVitestConfig(
  optionsOrRoot?: SharedVitestOptions | string | URL,
): UserConfig

export default defineSharedVitestConfig
