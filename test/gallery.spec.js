import { test, expect } from '@playwright/test'
import { parseColor } from '../theme/color.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#live-panel .s-panel')).toBeVisible()
})

test('all thumbnails share the five-part specimen and have one accessible selection button', async ({ page }) => {
  const cards = page.locator('.theme-card')
  await expect(cards).toHaveCount(19)
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
  await expect(page.locator('.theme-card:visible')).toHaveCount(10)
  await page.getByRole('searchbox', { name: 'Search themes' }).fill('  FIGMA ')
  await expect(page.locator('.theme-card:visible')).toHaveCount(1)
  await page.getByRole('button', { name: 'Originals', exact: true }).click()
  await expect(page.locator('#empty-state')).toBeVisible()
  await expect(page.locator('#preview-title')).toHaveText('Glass')
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page.locator('.theme-card:visible')).toHaveCount(19)
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
  await page.getByRole('combobox', { name: 'Colormap' }).selectOption('chalk')
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
  await page.locator('#colormap-select').selectOption('graphite')
  await expect(live.locator('.s-panel')).toHaveCSS('--bg', '#292b2e')
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
  await expect(page.locator('#colormap-select')).toHaveValue('graphite')
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

test('all eleven colormaps change the panel and scene; a chosen accent survives map changes', async ({ page }) => {
  const maps = ['dark', 'graphite', 'slate', 'copper', 'gold', 'gray', 'sage', 'silver', 'ivory', 'chalk', 'light']
  expect(await page.locator('#colormap-select option').evaluateAll(options => options.map(option => option.value))).toEqual(maps)
  const fills = new Set(), scenes = new Set()
  for (const map of maps) {
    await page.locator('#colormap-select').selectOption(map)
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
    await page.locator('#colormap-select').selectOption(map)
    await expect(page.locator('#custom-accent')).toHaveValue('#d94c91')
  }
  await page.getByRole('button', { name: 'Auto', exact: true }).click()
  await expect(page.locator('#custom-accent')).toHaveValue('#60421f')
  await page.locator('#colormap-select').selectOption('sage')
  await expect(page.locator('#custom-accent')).toHaveValue('#395845')
  await page.getByRole('button', { name: 'Preview Tweakpane', exact: true }).click()
  await expect(page.locator('#density-row')).toBeVisible()
  await expect(page.locator('#accent-row')).toBeHidden()
  await expect(page.locator('#more-axes')).toBeVisible()
  await expect(page.locator('#live-panel .s-panel')).toHaveCSS('color-scheme', 'light')
})

test('range and custom color write-back exports typed axes; skip link preserves selection', async ({ page }) => {
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.locator('#more-axes summary').click()
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
  await expect(page.locator('#colormap-select')).toHaveValue('chalk')
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
  await expect(page.locator('#custom-accent')).toHaveValue('#cbd4e1')
  await expect(page.locator('#roundness')).toHaveValue('1.4')
  await expect(page.locator('#size')).toHaveValue('0.8')
})

test('colormap URLs restore exports and reject missing, empty, unknown and inherited keys', async ({ page }) => {
  for (const query of ['', 'colormap=', 'colormap=unknown', 'colormap=constructor', 'colormap=__proto__&time=day']) {
    await page.goto('/#theme=glass&' + query)
    await expect(page.locator('#colormap-select')).toHaveValue('graphite')
    await expect(page.locator('#custom-accent')).toHaveValue('#cbd4e1')
  }
  await page.goto('/#theme=lab01&colormap=gold')
  await expect(page.locator('#colormap-select')).toHaveValue('gold')
  await page.getByRole('button', { name: 'Use theme', exact: false }).click()
  await expect(page.locator('#theme-code')).toContainText('"shade": "#ba965a"')
  await expect(page.locator('#theme-code')).toContainText('"accent": "#60421f"')
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Preview Neu', exact: true }).click()
  await page.goBack()
  await expect(page.locator('#preview-title')).toHaveText('Lab01')
  await expect(page.locator('#colormap-select')).toHaveValue('gold')
})

test('saved colormaps retain Auto or custom accents across reload and migrate all daytime links', async ({ page }) => {
  await page.goto('/#colormap=gold')
  await expect(page.getByRole('button', { name: 'Auto', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('accent')).toBe(false)
  await page.reload()
  await expect(page.locator('#custom-accent')).toHaveValue('#60421f')
  await page.locator('#colormap-select').selectOption('sage')
  await expect(page.locator('#custom-accent')).toHaveValue('#395845')

  await page.getByRole('button', { name: 'Rose', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Auto', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await page.locator('#colormap-select').selectOption('gold')
  await expect(page.locator('#custom-accent')).toHaveValue('#d94c91')
  await page.getByRole('button', { name: 'Auto', exact: true }).click()
  await page.reload()
  await expect(page.locator('#custom-accent')).toHaveValue('#60421f')
  expect(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('accent')).toBe(false)

  for (const [time, map] of [['predawn', 'slate'], ['sunrise', 'ivory'], ['day', 'chalk'], ['dusk', 'slate'], ['sunset', 'copper'], ['night', 'graphite']]) {
    await page.goto('/#time=' + time)
    await expect(page.locator('#colormap-select')).toHaveValue(map)
    const params = new URLSearchParams(new URL(page.url()).hash.slice(1))
    expect(params.get('colormap')).toBe(map)
    expect(params.has('time')).toBe(false)
  }
})

test('every theme accepts every colormap and classic labels retain readable contrast', async ({ page }) => {
  const issues = await page.evaluate(async () => {
    const maps = [...document.querySelectorAll('#colormap-select option')].map(el => el.value)
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
      const select = document.querySelector('#colormap-select')
      select.value = map; select.dispatchEvent(new Event('change', { bubbles: true }))
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
    await page.locator('#colormap-select').selectOption(map)
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
  await expect(page.locator('#colormap-select')).toHaveValue('light')
  await expect(panel).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await page.getByRole('button', { name: 'Use theme', exact: false }).click()
  await expect(page.locator('#theme-code')).toContainText('"shade": "#ffffff"')
  await expect(page.locator('#theme-code')).toContainText('"accent": "#0b57d0"')
})

test('gallery screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1040 })
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot('gallery.png', { maxDiffPixelRatio: .01 })
})
