import { test, expect } from '@playwright/test'
import { parseColor } from '../theme/color.js'
import { themes } from '../demo/themes.js'

// Light is a radiogroup of native <input type="radio" name="light"> swatches, not a <select>.
const setLight = (page, id) => page.locator(`input[name="light"][value="${id}"]`).check()

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#live-panel .s-panel')).toBeVisible()
})

test('all thumbnails share the five-part specimen and have one accessible selection button', async ({ page }) => {
  const cards = page.locator('.theme-card')
  await expect(cards).toHaveCount(themes.length)
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
  await expect(page.locator('.theme-card:visible')).toHaveCount(themes.filter(t => t.classic).length)
  await page.getByRole('searchbox', { name: 'Search themes' }).fill('  FIGMA ')
  await expect(page.locator('.theme-card:visible')).toHaveCount(1)
  await page.getByRole('button', { name: 'Originals', exact: true }).click()
  await expect(page.locator('#empty-state')).toBeVisible()
  await expect(page.locator('#preview-title')).toHaveText('Glass')
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page.locator('.theme-card:visible')).toHaveCount(themes.length)
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

test('theme, colormap, accent and density preserve edited values; reset restores all values', async ({ page }) => {
  const live = page.locator('#live-panel')
  await live.locator('[data-key=name] input').fill('Moonrise')
  await live.locator('[data-key=blend] select').selectOption('Multiply')
  await live.locator('[data-key=opacity] input[type=range]').press('ArrowRight')
  await live.locator('[data-key=enabled] .s-track').click()
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await setLight(page, 'chalk')
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

test('Dark matches Lab01’s demo; secondary reset retains focus and toggle help', async ({ page }) => {
  await page.goto('/#theme=lab01&colormap=dark')
  const live = page.locator('#live-panel')
  await expect(live.locator('.s-panel')).toHaveCSS('--bg', '#111111')
  await expect(live.locator('[data-key=enabled] .s-hint')).toHaveText('Show this layer')
  await live.locator('[data-key=name] input').fill('Changed')
  await live.locator('[data-key=enabled] .s-track').click()
  await setLight(page, 'graphite')
  await expect(live.locator('.s-panel')).toHaveCSS('--bg', '#1e1e1e')
  const panel = await live.locator('.s-panel').elementHandle()
  const reset = live.getByRole('button', { name: 'Reset', exact: true })
  await expect(reset).toHaveClass('s-secondary')
  for (let i = 0; i < 2; i++) {
    await reset.click()
    await expect(reset).toBeFocused()
    expect(await panel.evaluate(el => el.isConnected)).toBe(true)
    await expect(live.locator('[data-key=name] input')).toHaveValue('Aurora')
    await expect(live.locator('[data-key=enabled] input')).toBeChecked()
  }
  await expect(page.locator('input[name="light"][value="graphite"]')).toBeChecked()
  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 900 })
    for (const button of await live.locator('.s-button button').all()) {
      expect(await button.evaluate(el => {
        const range = document.createRange(); range.selectNodeContents(el)
        const text = range.getBoundingClientRect(), box = el.getBoundingClientRect()
        return range.getClientRects().length === 1 && text.left >= box.left && text.right <= box.right
      })).toBe(true)
    }
  }
})

test('all twelve colormaps change the panel and scene; a chosen accent survives map changes', async ({ page }) => {
  const maps = ['dark', 'graphite', 'slate', 'copper', 'gold', 'bronze', 'gray', 'sage', 'silver', 'ivory', 'chalk', 'light']
  expect(await page.locator('input[name="light"]').evaluateAll(els => els.map(el => el.value))).toEqual(['native', ...maps])
  const fills = new Set(), scenes = new Set()
  for (const map of maps) {
    await setLight(page, map)
    fills.add(await page.locator('#live-panel .s-panel').evaluate(el => getComputedStyle(el).getPropertyValue('--bg')))
    scenes.add(await page.locator('#preview-scene').evaluate(el => getComputedStyle(el).getPropertyValue('--scene-sky')))
    await expect(page.locator('#live-panel .s-panel')).toHaveCSS('color-scheme', ['dark', 'graphite', 'slate'].includes(map) ? 'dark' : 'light')
  }
  expect(fills.size).toBe(maps.length)
  const lightness = [...fills].map(fill => parseColor(fill).L)
  for (let i = 1; i < lightness.length; i++) expect(lightness[i], maps[i]).toBeGreaterThan(lightness[i - 1])
  expect(scenes.size).toBe(maps.length)
  await page.getByRole('button', { name: 'Rose', exact: true }).click()
  for (const map of ['gold', 'chalk', 'gold']) {
    await setLight(page, map)
    await expect(page.locator('#custom-accent')).toHaveValue('#d94c91')
  }
  await page.getByRole('button', { name: 'Auto', exact: true }).click()
  await expect(page.locator('#custom-accent')).toHaveValue('#60421f')
  await setLight(page, 'sage')
  await expect(page.locator('#custom-accent')).toHaveValue('#395845')
  // Accent and Density are global now – always visible, regardless of the selected theme's
  // supported axes. Tweakpane doesn't read `accent`, so axesFor omits it: proving the isolation
  // means showing that clicking a different global accent leaves Tweakpane's own --accent alone.
  await page.getByRole('button', { name: 'Preview Tweakpane', exact: true }).click()
  await expect(page.locator('#density-row')).toBeVisible()
  await expect(page.locator('#accent-row')).toBeVisible()
  const accentBefore = await page.locator('#live-panel .s-panel').evaluate(el => getComputedStyle(el).getPropertyValue('--accent'))
  await page.getByRole('button', { name: 'Blue', exact: true }).click()
  const accentAfter = await page.locator('#live-panel .s-panel').evaluate(el => getComputedStyle(el).getPropertyValue('--accent'))
  expect(accentAfter, 'Tweakpane has no accent axis; its --accent must not react to the global Accent').toBe(accentBefore)
  await expect(page.locator('#live-panel .s-panel')).toHaveCSS('color-scheme', 'light')
})

// Native light passes no shade or accent: each panel paints exactly its theme's defaults.
const defaultBg = (page, file) => page.evaluate(async file => (await import(`/theme/${file}.js`)).default().match(/--bg:\s*([^;]+);/g).at(-1).replace(/--bg:\s*|;/g, ''), file)

test('native Light resolves per theme; reset look restores it', async ({ page }) => {
  await expect(page.locator('input[name="light"][value="native"]')).toBeChecked()
  for (const [id, file] of [['glass', 'glass'], ['lab01', 'lab01'], ['tweakpane', 'tweakpane'], ['soft', 'default'], ['studio', 'studio']])
    await expect(page.locator(`[data-theme=${id}] .s-panel`)).toHaveCSS('--bg', await defaultBg(page, file))
  await page.getByRole('button', { name: 'Preview Lab01', exact: true }).click()
  await expect(page.locator('#live-panel .s-panel')).toHaveCSS('color-scheme', 'dark') // lab01's default is near-black
  await page.getByRole('button', { name: 'Preview DevTools', exact: true }).click()
  await expect(page.locator('#live-panel .s-panel')).toHaveCSS('color-scheme', 'light') // devtools defaults to white

  await setLight(page, 'graphite')
  await expect(page.locator('input[name="light"][value="native"]')).not.toBeChecked()
  await page.getByRole('button', { name: 'Reset look', exact: true }).click()
  await expect(page.locator('input[name="light"][value="native"]')).toBeChecked()
})

test('colormap=native in the URL resolves per theme on load', async ({ page }) => {
  await page.goto('/#theme=neu&colormap=native')
  await expect(page.locator('input[name="light"][value="native"]')).toBeChecked()
  await expect(page.locator('#live-panel .s-panel')).toHaveCSS('--bg', await defaultBg(page, 'neu'))
})

test('range and custom color write-back exports typed axes; skip link preserves selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.locator('#roundness').press('End')
  await page.locator('#size').press('End')
  await page.locator('#font-select').selectOption('mono')
  await expect(page.locator('#live-panel .s-panel')).toHaveCSS('font-family', /monospace/)
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
  for (const text of ['"roundness": 2', '"size": 1.2', '"accent": "#39af87"', '"font": "ui-monospace']) {
    await expect(page.locator('#theme-code')).toContainText(text)
  }
})

test("Corners shows each theme's own native default, not one shared anchor", async ({ page }) => {
  await expect(page.locator('#roundness')).toHaveValue('1.4') // glass, the initial theme
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await expect(page.locator('#roundness')).toHaveValue('1.6')
  await expect(page.locator('#roundness-value')).toHaveText('1.6')
  await page.getByRole('button', { name: 'Preview Porcelain', exact: true }).click()
  await expect(page.locator('#roundness')).toHaveValue('1')
  await page.getByRole('button', { name: 'Preview Swiss', exact: true }).click()
  await expect(page.locator('#roundness')).toHaveValue('0') // swiss keeps its own corners sharp regardless of the axis
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.locator('#roundness').press('ArrowRight') // continuous from Neu's real 1.6, no snap to a shared anchor
  await expect(page.locator('#roundness-value')).toHaveText('1.7')
})

for (const width of [320, 375, 414, 768, 1440]) {
  test(`gallery and live controls fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    const bar = await page.locator('.look-bar').evaluate(el => el.getBoundingClientRect())
    expect(bar.left, 'look-bar').toBeGreaterThanOrEqual(0)
    expect(bar.right, 'look-bar').toBeLessThanOrEqual(width)
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
        .concat('\nexport default panel')
        .replace("title: 'Layer',", "title: 'Layer', container: document.querySelector('#export-review'),")
      const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
      let panel
      try {
        panel = (await import(url)).default
        const initial = {
          name: panel.name, opacity: panel.opacity, enabled: panel.enabled,
          nameType: host.querySelector('[data-key=name] input').type,
          switch: !!host.querySelector('[data-key=enabled].s-switch'),
          readout: host.querySelector('[data-key=opacity] .s-readout').value,
          button: host.querySelector('[data-key=apply] button:not(.s-secondary)')?.textContent,
        }
        host.querySelector('[data-key=apply] button.s-secondary').click()
        await Promise.resolve()
        return { ...initial, reset: [panel.name, panel.opacity, panel.enabled], hint: host.querySelector('[data-key=enabled] .s-hint').textContent }
      } finally {
        panel?.[Symbol.dispose]()
        URL.revokeObjectURL(url)
        host.remove()
      }
    }, code)
    expect(result).toEqual({ name, opacity: 0, enabled: false, nameType: 'text', switch: true, readout: '0%', button: 'Apply effect', reset: ['Aurora', 82, true], hint: 'Show this layer' })
  }
})

test('share URLs restore axes, validate boundary inputs, and support browser back', async ({ page }) => {
  await page.goto('/#theme=neu&time=day&accent=%23112233&density=1.5&corners=0&scale=1.2')
  await expect(page.locator('#preview-title')).toHaveText('Neu')
  await expect(page.locator('input[name="light"][value="chalk"]')).toBeChecked()
  expect(page.url()).toContain('colormap=chalk')
  await expect(page.locator('#custom-accent')).toHaveValue('#112233')
  await expect(page.locator('#roundness')).toHaveValue('0')
  await expect(page.locator('#size')).toHaveValue('1.2')
  await page.getByRole('button', { name: 'Preview Glass', exact: true }).click()
  await page.goBack()
  await expect(page.locator('#preview-title')).toHaveText('Neu')
  await page.goto('about:blank')
  await page.goto('/#theme=constructor&time=unknown&accent=oops&density=0&corners=Infinity&scale=-20')
  await expect(page.locator('#preview-title')).toHaveText('Glass')
  await expect(page.locator('#custom-accent')).toHaveValue('#6ea8ff') // native keeps glass's own default accent (theme/glass.js)
  await expect(page.locator('#roundness')).toHaveValue('1.4')
  await expect(page.locator('#size')).toHaveValue('0.8')
})

test('a colormap exports its ink and texture only for themes that declare them, and drops them on the next map', async ({ page }) => {
  const exported = async () => {
    await page.getByRole('button', { name: 'Use theme', exact: false }).click()
    const code = await page.locator('#theme-code').textContent()
    await page.keyboard.press('Escape')
    return code
  }
  await page.goto('/#theme=soft&colormap=bronze')
  for (let i = 0; i < 2; i++) {
    const code = await exported()
    expect(code).toContain('"ink": "#603415"')
    expect(code).toContain('"texture": "wood"')
    await setLight(page, 'bronze')
  }
  for (const map of ['gold', 'native']) {
    await setLight(page, map)
    const code = await exported()
    expect(code, map).not.toContain('"ink"')
    expect(code, map).not.toContain('"texture"')
  }
  await setLight(page, 'chalk')
  expect(await exported()).toContain('"texture": "grain"')
  await page.goto('/#theme=lab01&colormap=bronze')
  const code = await exported()
  expect(code).toContain('"shade": "#ca9d63"')
  expect(code).not.toContain('"ink"')
  expect(code).not.toContain('"texture"')
})

test('colormap URLs restore exports and reject missing, empty, unknown and inherited keys', async ({ page }) => {
  for (const query of ['', 'colormap=', 'colormap=unknown', 'colormap=constructor', 'colormap=__proto__&time=day']) {
    await page.goto('/#theme=glass&' + query)
    await expect(page.locator('input[name="light"][value="native"]')).toBeChecked()
    await expect(page.locator('#custom-accent')).toHaveValue('#6ea8ff')
  }
  await page.goto('/#theme=lab01&colormap=gold')
  await expect(page.locator('input[name="light"][value="gold"]')).toBeChecked()
  await page.getByRole('button', { name: 'Use theme', exact: false }).click()
  await expect(page.locator('#theme-code')).toContainText('"shade": "#ba965a"')
  await expect(page.locator('#theme-code')).toContainText('"accent": "#60421f"')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.goBack()
  await expect(page.locator('#preview-title')).toHaveText('Lab01')
  await expect(page.locator('input[name="light"][value="gold"]')).toBeChecked()
})

test('saved colormaps retain Auto or custom accents across reload and migrate all daytime links', async ({ page }) => {
  await page.goto('/#colormap=gold')
  await expect(page.getByRole('button', { name: 'Auto', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('accent')).toBe(false)
  await page.reload()
  await expect(page.locator('#custom-accent')).toHaveValue('#60421f')
  await setLight(page, 'sage')
  await expect(page.locator('#custom-accent')).toHaveValue('#395845')

  await page.getByRole('button', { name: 'Rose', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Auto', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await setLight(page, 'gold')
  await expect(page.locator('#custom-accent')).toHaveValue('#d94c91')
  await page.getByRole('button', { name: 'Auto', exact: true }).click()
  await page.reload()
  await expect(page.locator('#custom-accent')).toHaveValue('#60421f')
  expect(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('accent')).toBe(false)

  for (const [time, map] of [['predawn', 'slate'], ['sunrise', 'ivory'], ['day', 'chalk'], ['dusk', 'slate'], ['sunset', 'copper'], ['night', 'graphite']]) {
    await page.goto('/#time=' + time)
    await expect(page.locator(`input[name="light"][value="${map}"]`)).toBeChecked()
    const params = new URLSearchParams(new URL(page.url()).hash.slice(1))
    expect(params.get('colormap')).toBe(map)
    expect(params.has('time')).toBe(false)
  }
})

test('every theme accepts every colormap and classic labels retain readable contrast', async ({ page }) => {
  test.slow()  // remounts the live preview once per theme × colormap, so it grows with every theme added
  const issues = await page.evaluate(async () => {
    // 'native' resolves per-theme, not to one fixed color scheme – covered separately.
    const maps = [...document.querySelectorAll('input[name="light"]')].map(el => el.value).filter(m => m !== 'native')
    const themes = [...document.querySelectorAll('.theme-card')].map(el => el.dataset.theme)
    const native = ['dat', 'tweakpane', 'leva', 'controlkit', 'uil']
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    const rgb = color => {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1)
      return [...ctx.getImageData(0, 0, 1, 1).data]
    }
    const lum = values => values.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0)
    const issues = [], tick = () => new Promise(requestAnimationFrame)
    for (const map of maps) {
      const radio = document.querySelector(`input[name="light"][value="${map}"]`)
      radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true }))
      await tick()
      for (const theme of themes) {
        document.querySelector(`[data-theme="${theme}"] .theme-choice`).click()
        await tick()
        const panel = document.querySelector('#live-panel .s-panel')
        const expected = ['dark', 'graphite', 'slate'].includes(map) ? 'dark' : 'light'
        if (getComputedStyle(panel).colorScheme !== expected) issues.push(`${theme}/${map}: wrong color scheme`)
        if (!native.includes(theme)) continue
        const label = panel.querySelector('[data-key=name] .s-label')
        let bg = rgb(getComputedStyle(label).backgroundColor), parent = label.parentElement
        while (bg[3] === 0 && parent) { bg = rgb(getComputedStyle(parent).backgroundColor); parent = parent.parentElement }
        const fg = rgb(getComputedStyle(label).color)
        const ink = fg.slice(0, 3).map((v, i) => v * fg[3] / 255 + bg[i] * (1 - fg[3] / 255))
        const a = lum(ink), b = lum(bg), contrast = (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
        if (contrast < 4.5) issues.push(`${theme}/${map}: label contrast ${contrast.toFixed(2)}`)
      }
    }
    return issues
  })
  expect(issues).toEqual([])
})

test('Light colormap matches native DevTools and stays distinct from Chalk through reload and export', async ({ page }) => {
  await page.goto('/#theme=devtools&colormap=light')
  await expect(page.locator('[data-theme=devtools] .s-panel')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  const panel = page.locator('#live-panel .s-panel')
  const name = panel.locator('[data-key=name] input')
  await name.fill('Inspector')
  for (const map of ['light', 'chalk', 'light']) {
    await setLight(page, map)
    await expect(panel).toHaveCSS('background-color', map === 'light' ? 'rgb(255, 255, 255)' : 'rgb(241, 242, 244)')
    await expect(name).toHaveValue('Inspector')
  }
  await expect(page.locator('#custom-accent')).toHaveValue('#0b57d0')
  const colors = await panel.evaluate(async el => {
    const { default: devtools } = await import('/theme/devtools.js')
    const { default: settings } = await import('/index.js')
    const host = document.createElement('div'); document.body.appendChild(host)
    const reference = settings({}, { container: host, theme: devtools() })
    const read = el => { const s = getComputedStyle(el); return [s.backgroundColor, s.color, s.getPropertyValue('--accent').trim(), s.getPropertyValue('--property').trim()] }
    const actual = read(el), expected = read(host.querySelector('.s-panel'))
    reference[Symbol.dispose](); host.remove()
    return { actual, expected }
  })
  expect(colors.actual).toEqual(colors.expected)
  await page.reload()
  await expect(page.locator('input[name="light"][value="light"]')).toBeChecked()
  await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.getByRole('button', { name: 'Use theme', exact: false }).click()
  await expect(page.locator('#theme-code')).toContainText('"shade": "#ffffff"')
  await expect(page.locator('#theme-code')).toContainText('"accent": "#0b57d0"')
})

test('Look-bar and Theme-controls axis changes never remount the live panel', async ({ page }) => {
  const panel = await page.locator('#live-panel .s-panel').elementHandle()
  const styleCount = await page.locator('head style').count()
  const name = page.locator('#live-panel [data-key=name] input')
  await name.fill('')
  await name.pressSequentially('Drifting')
  await expect(name).toBeFocused()
  await setLight(page, 'dark')
  await page.getByRole('button', { name: 'Roomy', exact: true }).click()
  await page.locator('#roundness').press('End')
  await page.locator('#size').press('End')
  await page.getByRole('button', { name: 'Teal', exact: true }).click()
  await expect(name).toHaveValue('Drifting')
  expect(await panel.evaluate(el => el.isConnected)).toBe(true)
  await expect(page.locator('head style')).toHaveCount(styleCount)
})

test('a non-selected thumbnail restyles from the Look bar without remounting', async ({ page }) => {
  const thumb = page.locator('[data-theme=neu] .s-panel')
  const handle = await thumb.elementHandle()
  const before = await thumb.evaluate(el => getComputedStyle(el).getPropertyValue('--bg'))
  await setLight(page, 'dark')
  await expect(thumb).not.toHaveCSS('--bg', before)
  expect(await handle.evaluate(el => el.isConnected)).toBe(true)
})

test('theme controls: populated vs. empty state, and per-theme isolation', async ({ page }) => {
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await expect(page.locator('.extra-row')).toHaveCount(6)
  await expect(page.locator('.extras-empty')).toBeHidden()
  await expect(page.locator('.extras-reset')).toBeHidden()

  await page.getByRole('button', { name: 'Preview dat.gui', exact: true }).click()
  await expect(page.locator('.extras-empty')).toBeVisible()
  await expect(page.locator('.extras-grid')).toBeHidden()

  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.locator('.extras-grid input[type=range]').last().fill('1') // Grain, max
  await expect(page.locator('.extras-reset')).toBeVisible()
  const neuThumb = await page.locator('[data-theme=neu] .s-panel').evaluate(el => getComputedStyle(el).getPropertyValue('--neu-texture'))
  expect(neuThumb, 'the edited grain paints a texture').toContain('url(')

  await page.getByRole('button', { name: 'Preview Glass', exact: true }).click()
  const glassBefore = await page.locator('[data-theme=glass] .s-panel').evaluate(el => getComputedStyle(el).getPropertyValue('--bg'))
  await expect(page.locator('.extras-reset')).toBeHidden() // glass's own extras are untouched

  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await expect(page.locator('.extras-reset')).toBeVisible() // neu's edit is session-local, not lost
  expect(await page.locator('[data-theme=neu] .s-panel').evaluate(el => getComputedStyle(el).getPropertyValue('--neu-texture'))).toBe(neuThumb)
  const glassAfter = await page.locator('[data-theme=glass] .s-panel').evaluate(el => getComputedStyle(el).getPropertyValue('--bg'))
  expect(glassAfter, "neu's extras must not leak into glass").toBe(glassBefore)

  await page.locator('.extras-reset').click()
  await expect(page.locator('.extras-reset')).toBeHidden()
})

test('a non-native extra round-trips through Copy link, scoped to the selected theme', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.locator('.extras-grid input[type=range]').first().fill('900') // Weight, max
  await page.getByRole('button', { name: 'Preview Skeu', exact: true }).click()
  await page.locator('.extra-select select').selectOption('dots') // a different theme's own extra
  await page.getByRole('button', { name: 'Copy preview link', exact: true }).click()
  const link = await page.evaluate(() => navigator.clipboard.readText())
  expect(link, 'only the selected theme (skeu) scopes into the URL').toContain('x-grid=dots')
  expect(link, "a different theme's (neu) customization stays session-local").not.toContain('x-weight')

  await page.goto(link)
  await expect(page.locator('.extra-select select')).toHaveValue('dots')
})

test('gallery screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1040 })
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot('gallery.png', { maxDiffPixelRatio: .01 })
})
