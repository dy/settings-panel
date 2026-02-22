import { test, expect } from '@playwright/test'

const cases = [
  { name: 'swiss-coworking', path: '/demo/cases/swiss-coworking.html' },
  { name: 'control-panel', path: '/demo/cases/control-panel.html' },
]

for (const { name, path } of cases) {
  test(`snapshot: ${name}`, async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 })
    await page.goto(path)

    // Wait for fonts + rendering
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot(`${name}.png`, {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    })
  })
}
