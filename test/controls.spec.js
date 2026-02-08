import { test, expect } from '@playwright/test'

test.describe('settings-panel', () => {
  let errors = []

  test.beforeEach(async ({ page }) => {
    errors = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('Clipboard') || text.includes('404') || text.includes('favicon')) return
        errors.push(text)
      }
    })
  })

  test.afterEach(async () => {
    expect(errors, 'No console errors').toEqual([])
  })

  test('panel loads without errors', async ({ page }) => {
    await page.goto('/demo/demo.html')
    await expect(page.locator('.s-panel')).toBeVisible()
  })

  test('controls render', async ({ page }) => {
    await page.goto('/demo/demo.html')
    await expect(page.locator('.s-slider').first()).toBeVisible()
    await expect(page.locator('.s-folder').first()).toBeVisible()
  })
})
