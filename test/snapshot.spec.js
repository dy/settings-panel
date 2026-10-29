import { test, expect } from '@playwright/test'

// Always fetch fresh — the browser otherwise keeps a heuristically-cached copy of the
// ES modules across runs, which masks edits when regenerating snapshots locally.
test.beforeEach(async ({ page }) => {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.setCacheDisabled', { cacheDisabled: true })
})

const cases = [
  { name: 'devtools', path: '/test/cases/devtools.html' },
  { name: 'devtools-dark', path: '/test/cases/devtools.html#dark' },
  { name: 'swiss', path: '/demo/cases/swiss.html', width: 1280 },
  { name: 'control-panel', path: '/demo/cases/control-panel.html' },
  { name: 'control-panel-light', path: '/demo/cases/control-panel.html#shade=ebebeb' },
  { name: 'skeu', path: '/test/cases/skeu.html' },
  { name: 'lab01', path: '/demo/cases/lab01.html' },
  { name: 'brutal', path: '/test/cases/brutal.html' },
  { name: 'neu', path: '/test/cases/neu.html' },
  { name: 'glass', path: '/test/cases/glass.html' },
  { name: 'terminal', path: '/test/cases/terminal.html' },
  { name: 'dat', path: '/demo/cases/dat.html' },
  { name: 'tweakpane', path: '/demo/cases/tweakpane.html' },
  { name: 'dialkit', path: '/demo/cases/dialkit.html' },
  { name: 'dialkit-light', path: '/demo/cases/dialkit.html#light' },
  { name: 'leva', path: '/demo/cases/leva.html' },
  { name: 'controlkit', path: '/demo/cases/controlkit.html' },
  { name: 'uil', path: '/demo/cases/uil.html' },
  { name: 'oui', path: '/demo/cases/oui.html' },
  { name: 'figma', path: '/test/cases/figma.html' },
  { name: 'apple', path: '/test/cases/apple.html' },
  { name: 'studio', path: '/demo/cases/studio.html' },
  { name: 'editorial', path: '/demo/cases/editorial.html' },
  { name: 'ableton', path: '/test/cases/ableton.html', width: 1280, fullPage: true },
  { name: 'ableton-dark', path: '/test/cases/ableton.html#dark', width: 1280, fullPage: true },
  { name: 'imgui', path: '/demo/cases/imgui.html' },
  { name: 'imgui-light', path: '/demo/cases/imgui.html#light' },
  { name: 'win98', path: '/demo/cases/win98.html' },
  { name: 'macintosh', path: '/demo/cases/macintosh.html' },
  { name: 'industrial', path: '/test/cases/industrial.html', width: 1000 },
  { name: 'industrial-dark', path: '/test/cases/industrial.html#dark', width: 1000 },
  { name: 'materials', path: '/demo/cases/materials.html', width: 1200, fullPage: true },
  { name: 'porcelain', path: '/demo/cases/variants#porcelain' },
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

  // Thumbs overlap full-width; hit-testing precedes dispatch, so the nearer thumb
  // must be promoted (.s-top) on track hover or close handles become ungrabbable.
  test('hover promotes nearer interval thumb', async ({ page }) => {
    const track = page.locator('.s-interval-track').first()
    const box = await track.boundingBox()
    const y = box.y + box.height / 2
    // values 25/50 on 0..100
    await page.mouse.move(box.x + box.width * 0.25, y)
    await expect(page.locator('.s-interval-lo')).toHaveClass(/s-top/)
    await page.mouse.move(box.x + box.width * 0.5, y)
    await expect(page.locator('.s-interval-hi')).toHaveClass(/s-top/)
  })

  // A readout drags its thumb: 10px of drag moves the value as 10px of the track does (0..100, step 1);
  // a clean click still enters editing.
  test('readout scrubs on horizontal drag', async ({ page }) => {
    const lo = page.locator('input.s-readout-lo')
    const box = await lo.boundingBox()
    const track = (await page.locator('.s-interval-track').first().boundingBox()).width
    const y = box.y + box.height / 2
    await page.mouse.move(box.x + 10, y)
    await page.mouse.down()
    await page.mouse.move(box.x + 10 + 10, y, { steps: 4 })
    await page.mouse.up()
    await expect(lo).toHaveValue(String(25 + Math.round(10 * 100 / track)))
    // input not focused after a scrub
    expect(await lo.evaluate(el => document.activeElement === el)).toBe(false)
  })

  test('clean click on readout enters editing', async ({ page }) => {
    const lo = page.locator('input.s-readout-lo')
    await lo.click()
    expect(await lo.evaluate(el => document.activeElement === el)).toBe(true)
  })

  test('low thumb drags when handles are adjacent', async ({ page }) => {
    const track = page.locator('.s-interval-track').first()
    const box = await track.boundingBox()
    const y = box.y + box.height / 2
    await page.mouse.move(box.x + box.width * 0.25, y)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.45, y, { steps: 5 })
    await page.mouse.up()
    // lo moved toward hi (exact landing value depends on thumb-width geometry), hi untouched
    const lo = +await page.locator('input.s-readout-lo').inputValue()
    expect(lo).toBeGreaterThan(40)
    expect(lo).toBeLessThanOrEqual(50)
    await expect(page.locator('input.s-readout-hi')).toHaveValue('50')
  })
})

// Vector inputs commit on change, not input — oninput writeback re-rendered
// :value into the focused field, mangling typed digits (e.g. "12.5" → "512").
test('vector input typing is not mangled', async ({ page }) => {
  await page.goto('/test/cases/figma.html')
  await page.waitForLoadState('networkidle')
  const inp = page.locator('.s-vec-axis input').first()
  await inp.click({ clickCount: 3 })
  await inp.pressSequentially('12.5', { delay: 30 })
  await expect(inp).toHaveValue('12.5')
  await inp.press('Tab')
  await expect(inp).toHaveValue('12.5')
})

// Theme sheets are scoped per instance (`.s-panel:where(.<id>)`) — without it,
// two differently-themed panels on one page cascade-collide (last sheet wins both).
test('two themed panels on one page keep their own styles', async ({ page }) => {
  await page.goto('/demo/cases/dat.html')
  await page.waitForLoadState('networkidle')
  const bgs = await page.evaluate(async () => {
    const { default: settings } = await import('/index.js')
    const { default: theme } = await import('/theme/default.js')
    const holder = document.createElement('div')
    document.body.appendChild(holder)
    settings({ a: 1 }, { container: holder, theme: theme({ shade: '#331111' }) })
    settings({ b: 2 }, { container: holder, theme: theme({ shade: '#113311' }) })
    const [p1, p2] = holder.querySelectorAll('.s-panel')
    return [getComputedStyle(p1).getPropertyValue('--bg'), getComputedStyle(p2).getPropertyValue('--bg')]
  })
  expect(bgs[0]).toBeTruthy()
  expect(bgs[1]).toBeTruthy()
  expect(bgs[0]).not.toBe(bgs[1])
})

test.describe('search filter', () => {
  test('icon toggles input, typing filters rows, Escape restores', async ({ page }) => {
    await page.goto('/demo/cases/leva.html')
    await page.waitForLoadState('networkidle')
    await page.click('.s-search-btn')
    await expect(page.locator('.s-panel')).toHaveClass(/s-searching/)
    await page.fill('.s-search-input', 'text')
    await expect(page.locator('.s-control[data-key=text]')).toBeVisible()
    await expect(page.locator('.s-control[data-key=number]')).toBeHidden()
    await page.press('.s-search-input', 'Escape')
    await expect(page.locator('.s-panel')).not.toHaveClass(/s-searching/)
    await expect(page.locator('.s-control[data-key=number]')).toBeVisible()
  })
})

// Theme sheets are unlayered and cascade over the base layer, so a theme's own
// `.s-separator { height }` or `.s-vec-axis { padding }` can silently break the
// labeled-separator and vector layouts base gets right. Every theme in the
// controls gallery must keep a label inside its separator, a plain separator a
// thin rule, and digits visible in every vector axis.
test('controls gallery: separators, vector axes and row widths hold their layout in every theme', async ({ page }) => {
  await page.goto('/demo/controls.html')
  await page.waitForLoadState('networkidle')
  const themes = await page.locator('#theme-picker option').allTextContents()
  expect(themes.length).toBeGreaterThan(5)
  for (const theme of themes) {
    await page.selectOption('#theme-picker', theme)
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.removeAttribute('name'); d.open = true }))
    await page.waitForTimeout(150)
    // JSON prints a separator as a blank line and a vector's parts as numbers sized to their text; DialKit writes a
    // curve's points as one line of text, '0, 0, 0.58, 1', each number as wide as itself
    const id = await page.locator('#theme-picker').inputValue(), json = id === 'json', text = json || id === 'dialkit'
    const bad = await page.evaluate(([json, text]) => {
      const out = []
      for (const sep of document.querySelectorAll('.s-separator-labeled')) {
        const l = sep.querySelector('.s-separator-label')
        if (l && l.getBoundingClientRect().height > sep.getBoundingClientRect().height + 1) out.push('separator label overflows')
      }
      // a plain separator is a rule, not a row: a row's min-height or padding would paint it as a band
      for (const sep of json ? [] : document.querySelectorAll('.s-separator:not(.s-separator-labeled)')) {
        const h = sep.getBoundingClientRect().height
        if (h < 1 || h > 4) out.push(`plain separator ${h}px tall`)
      }
      for (const inp of json ? [] : document.querySelectorAll(text ? '.s-vector:not(.s-curve) .s-vec-axis input' : '.s-vec-axis input')) {
        if (inp.getBoundingClientRect().width < 20) out.push(`vector axis ${inp.value} squeezed to ${inp.getBoundingClientRect().width}px`)
      }
      const panel = document.querySelector('.s-panel').getBoundingClientRect()
      for (const row of document.querySelectorAll('.s-control')) {
        const r = row.getBoundingClientRect()
        if (r.width && r.right > panel.right + 1) out.push(`row ${row.dataset.key} spills ${Math.round(r.right - panel.right)}px past the panel`)
      }
      return out
    }, [json, text])
    expect(bad, theme).toEqual([])
  }
})

for (const { name, path, width = 800, fullPage = false } of cases) {
  test(`snapshot: ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(path)

    // Wait for fonts + rendering
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage,
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    })
  })
}

// demo/_ref (the originals' harness) stays out of the published site: a case page offers its native
// switch only where the reference loads, so the public demo never opens a 404 frame.
test('case pages offer the native switch only when the reference loads', async ({ page }) => {
  await page.route('**/demo/_ref/**', route => route.fulfill({ status: 404, body: '' }))
  await page.goto('/demo/cases/dat.html')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.s-panel')).toBeVisible()
  await expect(page.locator('.case-render-switch')).toHaveCount(0)

  await page.unroute('**/demo/_ref/**')
  await page.route('**/demo/_ref/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p id="ref">original</p>' }))
  await page.reload()
  await page.locator('.case-render-switch button[data-mode=native]').click()
  await expect(page.frameLocator('.case-native-frame').locator('#ref')).toHaveText('original')
})

// A case with both appearances shows one Light | Dark switch: it names the appearance in the hash, and the
// original's frame opens in the same one
test('a case switches its appearance from the bar, the original following', async ({ page }) => {
  await page.route('**/demo/_ref/dialkit-ref.html', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p id="ref"></p><script>ref.textContent = location.hash</script>' }))
  await page.goto('/demo/cases/dialkit.html')
  const panel = page.locator('.s-panel')
  await expect(panel).toHaveCSS('color-scheme', 'dark')
  await page.locator('.case-appearance button[data-mode=light]').click()
  await expect(page).toHaveURL(/#light$/)
  await expect(panel).toHaveCSS('color-scheme', 'light')
  await expect(page.locator('.case-appearance button[data-mode=light]')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.case-render-switch button[data-mode=native]').click()
  await expect(page.frameLocator('.case-native-frame').locator('#ref')).toHaveText('#light')
})
