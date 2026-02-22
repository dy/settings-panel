import { test, expect } from '@playwright/test'

const cases = [
  { name: 'swiss-coworking', path: '/demo/cases/swiss-coworking.html' },
  { name: 'control-panel', path: '/demo/cases/control-panel.html' },
  { name: 'control-panel-light', path: '/demo/cases/control-panel.html#shade=ebebeb' },
]

test.describe('interval slider readout keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/cases/control-panel.html')
    await page.waitForLoadState('networkidle')
  })

  test('lo ArrowUp increments low value', async ({ page }) => {
    const lo = page.locator('input.s-readout-lo')
    await lo.focus()
    await lo.press('ArrowUp')
    await expect(lo).toHaveValue('26')
  })

  test('lo ArrowDown decrements low value', async ({ page }) => {
    const lo = page.locator('input.s-readout-lo')
    await lo.focus()
    await lo.press('ArrowDown')
    await expect(lo).toHaveValue('24')
  })

  test('hi ArrowUp increments high value', async ({ page }) => {
    const hi = page.locator('input.s-readout-hi')
    await hi.focus()
    await hi.press('ArrowUp')
    await expect(hi).toHaveValue('51')
  })

  test('hi ArrowDown decrements high value', async ({ page }) => {
    const hi = page.locator('input.s-readout-hi')
    await hi.focus()
    await hi.press('ArrowDown')
    await expect(hi).toHaveValue('49')
  })

  test('lo clamped to high value on ArrowUp', async ({ page }) => {
    const lo = page.locator('input.s-readout-lo')
    await lo.focus()
    // Shift+ArrowUp steps by 10x: 25 + 10*2 = 45, but high=50 so 45 is fine — use enough presses
    for (let i = 0; i < 30; i++) await lo.press('ArrowUp')
    await expect(lo).toHaveValue('50')
  })

  test('hi clamped to low value on ArrowDown', async ({ page }) => {
    const hi = page.locator('input.s-readout-hi')
    await hi.focus()
    for (let i = 0; i < 30; i++) await hi.press('ArrowDown')
    await expect(hi).toHaveValue('25')
  })

  test('Shift+ArrowUp steps lo by 10x', async ({ page }) => {
    const lo = page.locator('input.s-readout-lo')
    await lo.focus()
    await lo.press('Shift+ArrowUp')
    await expect(lo).toHaveValue('35')
  })

  test('Shift+ArrowUp steps hi by 10x', async ({ page }) => {
    const hi = page.locator('input.s-readout-hi')
    await hi.focus()
    await hi.press('Shift+ArrowUp')
    await expect(hi).toHaveValue('60')
  })
})

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
