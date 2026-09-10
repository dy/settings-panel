import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#live-panel .s-panel')).toBeVisible()
})

test('all thumbnails share the five-part specimen and have one accessible selection button', async ({ page }) => {
  const cards = page.locator('.theme-card')
  await expect(cards).toHaveCount(18)
  for (const card of await cards.all()) {
    await expect(card.locator('.s-panel > summary')).toContainText('Layer')
    await expect(card.locator('.s-control')).toHaveCount(4)
    await expect(card.locator('select')).toHaveValue('Screen')
    await expect(card.locator('input[type=range]')).toHaveValue('82')
    await expect(card.locator('input[type=checkbox]')).toBeChecked()
    await expect(card.locator('.s-button button')).toHaveText('Apply effect')
    await expect(card.locator('.thumbnail')).toHaveAttribute('inert', '')
    await expect(card.getByRole('button')).toHaveCount(1)
  }
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(page.locator('#preview-title')).toHaveText('Neu')
  await expect(page.getByRole('button', { name: 'Preview Neu', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Preview Glass', exact: true })).toHaveAttribute('aria-pressed', 'false')
})

test('search and category filters compose; empty and cleared results preserve the live preview', async ({ page }) => {
  await page.getByRole('button', { name: 'Classics', exact: true }).click()
  await expect(page.locator('.theme-card:visible')).toHaveCount(9)
  await page.getByRole('searchbox', { name: 'Search themes' }).fill('  FIGMA ')
  await expect(page.locator('.theme-card:visible')).toHaveCount(1)
  await page.getByRole('button', { name: 'Originals', exact: true }).click()
  await expect(page.locator('#empty-state')).toBeVisible()
  await expect(page.locator('#preview-title')).toHaveText('Glass')
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page.locator('.theme-card:visible')).toHaveCount(18)
  await expect(page.getByRole('searchbox')).toBeFocused()
})

test('reactive shell updates retain mounted specimens and dispose replaced preview styles', async ({ page }) => {
  const panel = await page.locator('#live-panel .s-panel').elementHandle()
  const thumb = await page.locator('[data-theme=glass] .s-panel').elementHandle()
  const styles = await page.locator('head style').count()
  const name = page.locator('#live-panel [data-key=name] input')
  await name.fill('')
  await name.pressSequentially('Moonrise')
  await expect(name).toBeFocused()
  await page.getByRole('searchbox').fill('nothing matches')
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await page.getByRole('button', { name: 'Preview Glass', exact: true }).click()
  expect(await panel.evaluate(el => el.isConnected)).toBe(true)
  expect(await thumb.evaluate(el => el.isConnected)).toBe(true)
  for (const theme of ['Neu', 'Glass', 'Neu', 'Glass']) {
    await page.getByRole('button', { name: `Preview ${theme}`, exact: true }).click()
    await expect(page.locator('#live-panel .s-panel')).toHaveCount(1)
    await expect(name).toHaveValue('Moonrise')
    await expect(page.locator('head style')).toHaveCount(styles)
  }
  expect(await panel.evaluate(el => el.isConnected)).toBe(false)
  expect(await thumb.evaluate(el => el.isConnected)).toBe(true)
})

test('theme, time, accent and density preserve edited values; reset restores all values', async ({ page }) => {
  const live = page.locator('#live-panel')
  await live.locator('[data-key=name] input').fill('Moonrise')
  await live.locator('[data-key=blend] select').selectOption('Multiply')
  await live.locator('[data-key=opacity] input[type=range]').press('ArrowRight')
  await live.locator('[data-key=enabled] .s-track').click()
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.getByRole('combobox', { name: 'Time of day' }).selectOption('day')
  await expect(live.locator('.s-panel')).toHaveCSS('color-scheme', 'light')
  await page.getByRole('button', { name: 'Rose', exact: true }).click()
  await page.getByRole('button', { name: 'Roomy', exact: true }).click()
  await expect(live.locator('[data-key=name] input')).toHaveValue('Moonrise')
  await expect(live.locator('[data-key=blend] select')).toHaveValue('Multiply')
  await expect(live.locator('[data-key=opacity] input[type=range]')).toHaveValue('83')
  await expect(live.locator('[data-key=enabled] input')).not.toBeChecked()
  await live.getByRole('button', { name: 'Apply effect' }).click()
  await expect(page.locator('#preview-feedback')).toContainText('Applied · Multiply at 83%')
  await page.getByRole('button', { name: 'Reset preview values' }).click()
  await expect(live.locator('[data-key=name] input')).toHaveValue('Aurora')
  await expect(live.locator('[data-key=blend] select')).toHaveValue('Screen')
  await expect(live.locator('[data-key=opacity] input[type=range]')).toHaveValue('82')
  await expect(live.locator('[data-key=enabled] input')).toBeChecked()
  await expect(page.getByRole('button', { name: 'Roomy', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('all six times change the scene, and unsupported axes are absent for fixed palettes', async ({ page }) => {
  const fills = new Set()
  for (const time of ['predawn', 'sunrise', 'day', 'dusk', 'sunset', 'night']) {
    await page.locator('#time-select').selectOption(time)
    fills.add(await page.locator('#preview-scene').evaluate(el => getComputedStyle(el).getPropertyValue('--scene-sky')))
    await expect(page.locator('#live-panel .s-panel')).toHaveCSS('color-scheme', ['day', 'sunrise'].includes(time) ? 'light' : 'dark')
  }
  expect(fills.size).toBe(6)
  await page.getByRole('button', { name: 'Preview Tweakpane', exact: true }).click()
  await expect(page.locator('#density-row')).toBeHidden()
  await expect(page.locator('#accent-row')).toBeHidden()
  await expect(page.locator('#more-axes')).toBeHidden()
  await page.locator('#time-select').selectOption('day')
  await expect(page.locator('#palette-note')).toHaveText('Dark palette')
})

test('range and custom color write-back exports typed axes; skip link preserves selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.locator('#more-axes summary').click()
  await page.locator('#roundness').press('End')
  await page.locator('#size').press('End')
  await page.locator('#custom-accent').evaluate(el => {
    el.value = '#39af87'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await expect(page.locator('#roundness-value')).toHaveText('2')
  await expect(page.locator('#size-value')).toHaveText('1.2×')
  const url = page.url()
  await page.getByRole('link', { name: 'Skip to live preview' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#preview')).toBeFocused()
  await expect(page.locator('#preview-title')).toHaveText('Neu')
  expect(page.url()).toBe(url)
  await page.getByRole('button', { name: 'Use theme', exact: false }).click()
  for (const text of ['"roundness": 2', '"size": 1.2', '"accent": "#39af87"']) {
    await expect(page.locator('#theme-code')).toContainText(text)
  }
})

for (const width of [320, 375, 414, 768, 1440]) {
  test(`gallery and live controls fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    for (const name of ['glass', 'neu', 'porcelain', 'brutal', 'swiss', 'lab01', 'dat', 'figma']) {
      await page.locator(`[data-theme="${name}"] .theme-choice`).click()
      const result = await page.locator('#live-panel').evaluate(host => {
        const p = host.getBoundingClientRect()
        const bad = [...host.querySelectorAll('input, button, select')].filter(el => el.checkVisibility()).filter(el => {
          const r = el.getBoundingClientRect()
          return r.width && (r.left < p.left - 1 || r.right > p.right + 1)
        }).map(el => el.type)
        return { page: document.documentElement.scrollWidth, right: p.right, left: p.left, bad }
      })
      expect(result.page, name).toBeLessThanOrEqual(width)
      expect(result.left, name).toBeGreaterThanOrEqual(0)
      expect(result.right, name).toBeLessThanOrEqual(width)
      expect(result.bad, name).toEqual([])
    }
  })
}

test('Swiss switch is visible, toggles by pointer and keyboard, and its color picker has its own space', async ({ page }) => {
  await page.getByRole('button', { name: 'Preview Swiss', exact: true }).click()
  const live = page.locator('#live-panel')
  const track = live.locator('.s-switch .s-track')
  expect((await track.boundingBox()).width).toBeGreaterThan(20)
  expect((await track.boundingBox()).height).toBeGreaterThan(10)
  await track.click()
  await expect(live.locator('.s-switch input')).not.toBeChecked()
  await live.locator('.s-switch input').focus()
  await page.keyboard.press('Space')
  await expect(live.locator('.s-switch input')).toBeChecked()
  const color = await live.locator('input[type=color]').boundingBox()
  const text = await live.locator('.s-color input[type=text]').boundingBox()
  expect(color.x + color.width).toBeLessThanOrEqual(text.x)
})

test('exports contain the selected axes; clipboard success and refusal have feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Rose', exact: true }).click()
  await page.getByRole('button', { name: 'Compact', exact: true }).click()
  await page.getByRole('button', { name: 'Use theme', exact: false }).click()
  await expect(page.locator('#code-dialog')).toBeVisible()
  await expect(page.locator('#theme-code')).toContainText("settings-panel/theme/glass.js")
  await expect(page.locator('#theme-code')).toContainText('"accent": "#d94c91"')
  await expect(page.locator('#theme-code')).toContainText('"spacing": 0.65')
  await page.getByRole('button', { name: 'Copy code', exact: true }).click()
  await expect(page.locator('#code-status')).toHaveText('Copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('theme: glass(')
  await page.getByRole('button', { name: 'CSS', exact: true }).click()
  await expect(page.locator('#theme-code')).toContainText('.s-panel {')
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('denied') } })
  await page.getByRole('button', { name: 'Copy code', exact: true }).click()
  await expect(page.locator('#code-status')).toContainText('Select the code above')
  await page.keyboard.press('Escape')
  await expect(page.locator('#code-dialog')).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Use theme', exact: false })).toBeFocused()
  await page.getByRole('button', { name: 'Copy preview link', exact: true }).click()
  await expect(page.locator('#code-title')).toHaveText('Preview link')
  await expect(page.locator('#theme-code')).toContainText('#theme=glass')
  await expect(page.getByRole('group', { name: 'Code format' })).toBeHidden()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Use theme', exact: false }).click()
  await expect(page.locator('#code-title')).toHaveText('Use Glass')
  await expect(page.getByRole('group', { name: 'Code format' })).toBeVisible()
  await expect(page.locator('#theme-code')).toContainText("settings-panel/theme/glass.js")
})

test('executed JavaScript export preserves control types, empty text, zero and false', async ({ page }) => {
  const live = page.locator('#live-panel')
  await live.locator('[data-key=opacity] input[type=range]').press('Home')
  await live.locator('[data-key=enabled] .s-track').click()
  for (const name of ['#fff', '', '#fff']) {
    await live.locator('[data-key=name] input').fill(name)
    await page.getByRole('button', { name: 'Use theme', exact: false }).click()
    const code = await page.locator('#theme-code').textContent()
    await page.keyboard.press('Escape')
    const result = await page.evaluate(async code => {
      const host = document.createElement('div')
      host.id = 'export-review'
      document.body.appendChild(host)
      const source = code
        .replace("'settings-panel'", JSON.stringify(location.origin + '/index.js'))
        .replace("'settings-panel/theme/", "'" + location.origin + '/theme/')
        .replace('settings({', 'export default settings({')
        .replace("title: 'Layer',", "title: 'Layer', container: document.querySelector('#export-review'),")
      const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
      let panel
      try {
        panel = (await import(url)).default
        return {
          name: panel.name, opacity: panel.opacity, enabled: panel.enabled,
          nameType: host.querySelector('[data-key=name] input').type,
          switch: !!host.querySelector('[data-key=enabled].s-switch'),
          readout: host.querySelector('[data-key=opacity] .s-readout').value,
          button: host.querySelector('[data-key=apply] button')?.textContent,
        }
      } finally {
        panel?.[Symbol.dispose]()
        URL.revokeObjectURL(url)
        host.remove()
      }
    }, code)
    expect(result).toEqual({ name, opacity: 0, enabled: false, nameType: 'text', switch: true, readout: '0%', button: 'Apply effect' })
  }
})

test('share URLs restore axes, validate boundary inputs, and support browser back', async ({ page }) => {
  await page.goto('/#theme=neu&time=day&accent=%23112233&density=1.5&corners=0&scale=1.2')
  await expect(page.locator('#preview-title')).toHaveText('Neu')
  await expect(page.locator('#custom-accent')).toHaveValue('#112233')
  await expect(page.locator('#roundness')).toHaveValue('0')
  await expect(page.locator('#size')).toHaveValue('1.2')
  await page.getByRole('button', { name: 'Preview Glass', exact: true }).click()
  await page.goBack()
  await expect(page.locator('#preview-title')).toHaveText('Neu')
  await page.goto('about:blank')
  await page.goto('/#theme=constructor&time=unknown&accent=oops&density=0&corners=Infinity&scale=-20')
  await expect(page.locator('#preview-title')).toHaveText('Glass')
  await expect(page.locator('#custom-accent')).toHaveValue('#6d5ce8')
  await expect(page.locator('#roundness')).toHaveValue('1.4')
  await expect(page.locator('#size')).toHaveValue('0.8')
})

test('gallery screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1040 })
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot('gallery.png', { maxDiffPixelRatio: .01 })
})
