import { defineConfig, devices } from '@playwright/test'

export function defineSharedPlaywrightConfig(options = {}) {
  const isCI = Boolean(process.env.CI)
  const defaultPort = String(options.port ?? process.env.PORT ?? 3000)
  const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL
  const baseURL = externalBaseURL || options.baseURL || `http://localhost:${defaultPort}`
  const resolvedPort = (() => {
    try {
      return new URL(baseURL).port || defaultPort
    } catch {
      return defaultPort
    }
  })()

  const defaultCommand =
    isCI && options.useBuiltServerInCI
      ? 'node .output/server/index.mjs'
      : `npm run dev -- --port ${resolvedPort}`

  const projects = options.projects ?? [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL },
    },
    ...(options.mobile
      ? [
          {
            name: 'pixel-7',
            use: { ...devices['Pixel 7'], baseURL },
          },
          {
            name: 'iphone-14',
            use: {
              ...devices['iPhone 14'],
              defaultBrowserType: 'chromium',
              baseURL,
            },
          },
        ]
      : []),
  ]

  const shouldSkipWebServer =
    options.webServer === false || (externalBaseURL && options.skipWebServerOnExternalUrl)

  return defineConfig({
    testDir: options.testDir ?? './tests/e2e',
    timeout: options.timeout ?? 30_000,
    expect: {
      timeout: options.expectTimeout ?? 5_000,
    },
    fullyParallel: options.fullyParallel ?? false,
    forbidOnly: isCI,
    retries: options.retries ?? (isCI ? 1 : 0),
    workers: options.workers ?? (isCI ? 1 : undefined),
    reporter: options.reporter ?? 'list',
    use: {
      baseURL,
      trace: options.trace ?? 'on-first-retry',
      ...(options.use ?? {}),
    },
    projects,
    webServer: shouldSkipWebServer
      ? undefined
      : (options.webServer ?? {
          command: options.command ?? defaultCommand,
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: options.webServerTimeout ?? 120_000,
          env: {
            PORT: resolvedPort,
            ...(options.env ?? {}),
          },
        }),
    ...(options.overrides ?? {}),
  })
}

export { devices }
export default defineSharedPlaywrightConfig
