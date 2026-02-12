import { test, expect } from '@playwright/test'

test.describe('settings-panel controls', () => {
  let errors = []

  test.beforeEach(async ({ page }) => {
    errors = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignore non-critical errors
        if (text.includes('Clipboard') || text.includes('404') || text.includes('favicon')) return
        errors.push(text)
      }
    })
  })

  test.afterEach(async () => {
    expect(errors, 'No console errors').toEqual([])
  })

  test('page loads without errors', async ({ page }) => {
    await page.goto('/demo.html')
    await expect(page.locator('settings-panel')).toBeVisible()
  })

  test('select control (buttons variant) works', async ({ page }) => {
    await page.goto('/demo.html')
    // The 'mode' select has buttons A, B, C
    const modeGroup = page.locator('s-select[label="mode"] .s-buttons button')
    await expect(modeGroup).toHaveCount(3)

    // Click B
    await modeGroup.nth(1).click()
    await expect(modeGroup.nth(1)).toHaveClass(/selected/)
  })

  test('folder control expands/collapses', async ({ page }) => {
    await page.goto('/demo.html')
    const folder = page.locator('s-folder').first()
    const details = folder.locator('details')
    const summary = folder.locator('summary')

    // Should be open by default
    await expect(details).toHaveAttribute('open', '')

    // Click to collapse
    await summary.click()
    await page.waitForTimeout(200)
    await expect(details).not.toHaveAttribute('open')
  })

  test('color control works', async ({ page }) => {
    await page.goto('/demo.html')
    // Color control is inside Controls Demo folder
    const colorInput = page.locator('s-color input[type="color"]').first()
    await expect(colorInput).toBeAttached()

    // Change color and verify input updates
    await colorInput.evaluate(el => {
      el.value = '#ff0000'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    // Verify color changed
    await page.waitForTimeout(100)
    const val = await colorInput.inputValue()
    expect(val).toBe('#ff0000')
  })

  test('text control works', async ({ page }) => {
    await page.goto('/demo.html')
    const textInput = page.locator('s-text input[type="text"]')
    await expect(textInput).toBeVisible()

    await textInput.fill('monospace')
    await expect(textInput).toHaveValue('monospace')
  })

  test('slider control works', async ({ page }) => {
    await page.goto('/demo.html')
    // The 'amount' slider in Controls Demo folder
    const slider = page.locator('s-slider[label="amount"] input[type="range"]')
    await expect(slider).toBeVisible()

    // Change value
    await slider.fill('75')
    await expect(slider).toHaveValue('75')
  })

  test('boolean control (toggle) works', async ({ page }) => {
    await page.goto('/demo.html')
    const checkbox = page.locator('.s-boolean input[type="checkbox"]').first()
    await expect(checkbox).toBeAttached()

    await checkbox.check({ force: true })
    await expect(checkbox).toBeChecked()
  })

  test('all controls render', async ({ page }) => {
    await page.goto('/demo.html')

    await expect(page.locator('s-select').first()).toBeAttached()
    await expect(page.locator('s-folder').first()).toBeAttached()
    await expect(page.locator('s-color').first()).toBeAttached()
    await expect(page.locator('s-text')).toBeAttached()
    await expect(page.locator('s-slider').first()).toBeAttached()
    await expect(page.locator('s-boolean').first()).toBeAttached()
  })

  test('theme picker changes theme', async ({ page }) => {
    await page.goto('/demo.html')

    // Theme picker is a dropdown select for presets
    const select = page.locator('s-select[label="preset"] select')
    await expect(select).toBeVisible()
    await expect(select).toHaveValue('flat')

    // Get initial accent
    const initialAccent = await page.locator('settings-panel').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--s-accent').trim()
    )

    // Change to brutalist
    await select.selectOption('brutalist')
    await expect(select).toHaveValue('brutalist')
    await page.waitForTimeout(150)

    // Accent should change (brutalist has cooler, higher contrast)
    const brutalistAccent = await page.locator('settings-panel').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--s-accent').trim()
    )
    expect(brutalistAccent).not.toBe(initialAccent)

    // Change to soft
    await select.selectOption('soft')
    await page.waitForTimeout(150)
    const softAccent = await page.locator('settings-panel').evaluate(el =>
      getComputedStyle(el).getPropertyValue('--s-accent').trim()
    )
    // Soft should be different from brutalist (warmer temperature)
    expect(softAccent).not.toBe(brutalistAccent)
  })
})
