import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  // Strict pixel comparison: the default perceptual threshold (0.2) lets
  // low-contrast design drift pass (an entire backdrop swap between two
  // charcoals went unnoticed). 0.06 still tolerates antialiasing noise.
  expect: { toHaveScreenshot: { threshold: 0.06 } },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3456',
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'npx serve . -p 3456',
    url: 'http://localhost:3456',
    reuseExistingServer: !process.env.CI,
  },
})
