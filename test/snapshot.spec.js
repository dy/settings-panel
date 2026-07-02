import { test, expect } from '@playwright/test'

// Always fetch fresh — the browser otherwise keeps a heuristically-cached copy of the
// ES modules across runs, which masks edits when regenerating snapshots locally.
test.beforeEach(async ({ page }) => {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.setCacheDisabled', { cacheDisabled: true })
})

const cases = [
  { name: 'swiss', path: '/demo/cases/swiss.html' },
  { name: 'control-panel', path: '/demo/cases/control-panel.html' },
  { name: 'control-panel-light', path: '/demo/cases/control-panel.html#shade=ebebeb' },
  { name: 'skeu', path: '/demo/cases/skeu.html' },
  { name: 'lab01', path: '/demo/cases/lab01.html' },
  { name: 'brutal', path: '/demo/cases/brutal.html' },
  { name: 'neu', path: '/demo/cases/neu.html' },
  { name: 'glass', path: '/demo/cases/glass.html' },
  { name: 'dat', path: '/demo/cases/dat.html' },
  { name: 'tweakpane', path: '/demo/cases/tweakpane.html' },
  { name: 'leva', path: '/demo/cases/leva.html' },
  { name: 'controlkit', path: '/demo/cases/controlkit.html' },
  { name: 'uil', path: '/demo/cases/uil.html' },
  { name: 'oui', path: '/demo/cases/oui.html' },
  { name: 'figma', path: '/demo/cases/figma.html' },
  { name: 'apple', path: '/demo/cases/apple.html' },
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

  // Numeric inputs drag-scrub (1px = 1 step); a clean click still enters editing.
  test('readout scrubs on horizontal drag', async ({ page }) => {
    const lo = page.locator('input.s-readout-lo')
    const box = await lo.boundingBox()
    const y = box.y + box.height / 2
    await page.mouse.move(box.x + 10, y)
    await page.mouse.down()
    await page.mouse.move(box.x + 10 + 10, y, { steps: 4 })
    await page.mouse.up()
    await expect(lo).toHaveValue('35')
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
  await page.goto('/demo/cases/figma.html')
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
