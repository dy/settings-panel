import { test, expect } from '@playwright/test'

test.describe('settings-panel controls', () => {
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

  test('page loads without errors', async ({ page }) => {
    await page.goto('/demo/demo.html')
    await expect(page.locator('.s-panel')).toBeVisible()
  })

  test('select control (buttons variant) works', async ({ page }) => {
    await page.goto('/demo/demo.html')
    const modeGroup = page.locator('.s-select.buttons button')
    await expect(modeGroup.first()).toBeAttached()

    await modeGroup.nth(1).click()
    await expect(modeGroup.nth(1)).toHaveClass(/selected/)
  })

  test('folder control expands/collapses', async ({ page }) => {
    await page.goto('/demo/demo.html')
    const folder = page.locator('.s-folder').first()
    const summary = folder.locator('summary').first()

    await expect(folder).toHaveAttribute('open', '')

    await summary.click()
    await page.waitForTimeout(200)
    await expect(folder).not.toHaveAttribute('open')
  })

  test('color control works', async ({ page }) => {
    await page.goto('/demo/demo.html')
    const colorInput = page.locator('.s-color input[type="color"]').first()
    await expect(colorInput).toBeAttached()

    await colorInput.evaluate(el => {
      el.value = '#ff0000'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await page.waitForTimeout(100)
    const val = await colorInput.inputValue()
    expect(val).toBe('#ff0000')
  })

  test('text control works', async ({ page }) => {
    await page.goto('/demo/demo.html')
    const textInput = page.locator('.s-text input[type="text"]')
    await expect(textInput).toBeVisible()

    await textInput.fill('monospace')
    await expect(textInput).toHaveValue('monospace')
  })

  test('slider control works', async ({ page }) => {
    await page.goto('/demo/demo.html')
    const slider = page.locator('.s-slider input[type="range"]').first()
    await expect(slider).toBeAttached()

    await slider.fill('0.75')
    await expect(slider).toHaveValue('0.75')
  })

  test('boolean control (toggle) works', async ({ page }) => {
    await page.goto('/demo/demo.html')
    const checkbox = page.locator('.s-boolean input[type="checkbox"]').first()
    await expect(checkbox).toBeAttached()

    await checkbox.check({ force: true })
    await expect(checkbox).toBeChecked()
  })

  test('all controls render', async ({ page }) => {
    await page.goto('/demo/demo.html')

    await expect(page.locator('.s-select').first()).toBeAttached()
    await expect(page.locator('.s-folder').first()).toBeAttached()
    await expect(page.locator('.s-color').first()).toBeAttached()
    await expect(page.locator('.s-text')).toBeAttached()
    await expect(page.locator('.s-slider').first()).toBeAttached()
    await expect(page.locator('.s-boolean').first()).toBeAttached()
  })

  test('theme picker changes theme', async ({ page }) => {
    await page.goto('/demo/demo.html')

    const select = page.locator('.s-select.dropdown select').first()
    await expect(select).toBeVisible()

    const initial = await select.inputValue()
    await select.selectOption({ index: 1 })
    await page.waitForTimeout(150)
    const after = await select.inputValue()
    expect(after).not.toBe(initial)
  })

  test('onchange callback fires on interaction', async ({ page }) => {
    await page.goto('/demo/demo.html')

    const changes = []
    await page.exposeFunction('captureChange', (state) => {
      changes.push(state)
    })

    await page.addScriptTag({
      type: 'module',
      content: `
        import settings from '../index.js'

        const container = document.createElement('div')
        container.id = 'test-container'
        document.body.appendChild(container)

        window.testState = settings(
          { testValue: 0.5 },
          {
            container,
            onchange: (state) => window.captureChange({ ...state })
          }
        )
      `
    })

    await page.waitForSelector('#test-container .s-slider input[type="range"]')

    const slider = page.locator('#test-container .s-slider input[type="range"]')
    await slider.fill('0.8')
    await page.waitForTimeout(100)

    expect(changes.length).toBeGreaterThan(0)
    expect(changes[0].testValue).toBeCloseTo(0.8, 1)
  })
})
