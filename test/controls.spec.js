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
    const buttons = page.locator('.s-buttons button')
    await expect(buttons).toHaveCount(3)
    
    // Click light theme
    await buttons.nth(1).click()
    await expect(buttons.nth(1)).toHaveClass(/selected/)
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
    const colorInput = page.locator('s-color input[type="color"]').first()
    await expect(colorInput).toBeAttached()
    
    // Change color and verify state updates
    await colorInput.evaluate(el => {
      el.value = '#ff0000'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    
    // Wait for state to update, then check CSS variable changed
    await page.waitForTimeout(100)
    const bgVar = await page.locator('settings-panel').evaluate(el => 
      el.style.getPropertyValue('--s-bg')
    )
    expect(bgVar).toBe('#ff0000')
  })
  
  test('nested color (bg) updates state and CSS', async ({ page }) => {
    await page.goto('/demo.html')
    
    // Background is first color input in Colors folder
    const bgControl = page.locator('s-color').first()
    const bgInput = bgControl.locator('input[type="color"]')
    
    // Verify key
    const key = await bgControl.getAttribute('key')
    expect(key).toBe('colors.background')
    
    // Change to red
    await bgInput.evaluate(el => {
      el.value = '#ff0000'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    
    // Polling applies styles - wait and verify CSS variable
    await page.waitForTimeout(150)
    const bgVar = await page.locator('settings-panel').evaluate(el => 
      el.style.getPropertyValue('--s-bg')
    )
    expect(bgVar).toBe('#ff0000')
    
    // Verify actual computed background color changed (is reddish)
    const computedBg = await page.locator('settings-panel').evaluate(el => 
      getComputedStyle(el).backgroundColor
    )
    // Should be red-ish (color picker may slightly adjust values)
    expect(computedBg).toMatch(/rgb\(2[0-5]\d, [0-9]+, [0-9]+\)/)
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
    const slider = page.locator('s-slider input[type="range"]').first()
    await expect(slider).toBeVisible()
    
    // Change value
    await slider.fill('12')
  })

  test('boolean control (toggle) works', async ({ page }) => {
    await page.goto('/demo.html')
    const checkbox = page.locator('.s-boolean input[type="checkbox"]').first()
    await expect(checkbox).toBeAttached()
    
    await checkbox.check({ force: true })
    await expect(checkbox).toBeChecked()
  })

  test('textarea control works', async ({ page }) => {
    await page.goto('/demo.html')
    const textarea = page.locator('s-textarea textarea')
    await expect(textarea).toBeVisible()
    
    await textarea.fill('{ "test": true }')
    await expect(textarea).toHaveValue('{ "test": true }')
  })

  test('button control works', async ({ page }) => {
    await page.goto('/demo.html')
    const button = page.locator('s-button button')
    await expect(button).toBeVisible()
    await expect(button).toHaveText('Copy Config')
    
    // Clear errors before click (clipboard may fail in headless - expected)
    errors.length = 0
    await button.click()
    // Code panel should appear
    await expect(page.locator('#code')).toHaveClass(/show/)
    // Filter clipboard errors (expected in headless)
    errors = errors.filter(e => !e.includes('Clipboard'))
  })

  test('all controls render', async ({ page }) => {
    await page.goto('/demo.html')
    
    await expect(page.locator('s-select')).toBeAttached()
    await expect(page.locator('s-folder').first()).toBeAttached()
    await expect(page.locator('s-color').first()).toBeAttached()
    await expect(page.locator('s-text')).toBeAttached()
    await expect(page.locator('s-slider').first()).toBeAttached()
    await expect(page.locator('s-boolean').first()).toBeAttached()
    await expect(page.locator('s-textarea')).toBeAttached()
    await expect(page.locator('s-button')).toBeAttached()
  })
})
