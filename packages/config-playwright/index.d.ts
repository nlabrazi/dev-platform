import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

export interface SharedPlaywrightOptions {
  port?: number | string
  baseURL?: string
  testDir?: string
  timeout?: number
  expectTimeout?: number
  fullyParallel?: boolean
  retries?: number
  workers?: number
  reporter?: PlaywrightTestConfig['reporter']
  trace?: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry'
  mobile?: boolean
  useBuiltServerInCI?: boolean
  skipWebServerOnExternalUrl?: boolean
  command?: string
  webServerTimeout?: number
  env?: Record<string, string>
  use?: PlaywrightTestConfig['use']
  projects?: PlaywrightTestConfig['projects']
  webServer?: PlaywrightTestConfig['webServer'] | false
  overrides?: Partial<PlaywrightTestConfig>
}

export declare function defineSharedPlaywrightConfig(
  options?: SharedPlaywrightOptions,
): PlaywrightTestConfig

export { devices }
export default defineSharedPlaywrightConfig
