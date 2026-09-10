import { test, expect } from '@playwright/test'

const variants = ['porcelain', 'chalk', 'amber', 'graphite', 'frost', 'soft', 'silver', 'ink']
const demos = ['glass', 'neu', 'brutal', 'lab01', 'apple', 'figma', 'uil', 'leva']

for (const name of [...demos, ...variants]) {
  const path = variants.includes(name) ? `/demo/cases/variants#${name}` : `/demo/cases/${name}`
  test(`${name}: fits narrow hosts and preserves control geometry`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('.s-panel')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    for (const width of [320, 375, 414, 768]) {
      await page.setViewportSize({ width, height: 900 })
      const geometry = await page.evaluate(() => {
        const panel = document.querySelector('.s-panel').getBoundingClientRect()
        const bad = [...document.querySelectorAll('.s-panel input, .s-panel select, .s-panel button')]
          .filter(el => el.checkVisibility())
          .filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.left < panel.left - 1 || b.right > panel.right + 1) })
          .map(el => el.className || el.type)
        return { width: document.documentElement.scrollWidth, left: panel.left, right: panel.right, bad }
      })
      expect(geometry.width, `${name} at ${width}`).toBeLessThanOrEqual(width)
      expect(geometry.left).toBeGreaterThanOrEqual(0)
      expect(geometry.right).toBeLessThanOrEqual(width)
      expect(geometry.bad).toEqual([])
    }
  })
}

test('Leva title remains clickable around its search control', async ({ page }) => {
  await page.goto('/demo/cases/leva')
  const panel = page.locator('.s-panel')
  await panel.locator(':scope > summary').click({ position: { x: 16, y: 20 } })
  await expect(panel).not.toHaveAttribute('open')
  await panel.locator(':scope > summary').click({ position: { x: 16, y: 20 } })
  await expect(panel).toHaveAttribute('open')
  await page.getByRole('button', { name: 'Filter controls' }).click()
  await page.locator('.s-search-input').fill('text')
  await expect(page.locator('[data-key="number"]')).toBeHidden()
  await page.locator('.s-search-input').press('Escape')
  await expect(page.locator('[data-key="number"]')).toBeVisible()
})

test('UIL color picker has an unobstructed pointer target', async ({ page }) => {
  await page.goto('/demo/cases/uil')
  const color = page.locator('input[type=color]').first()
  await expect(color).toBeVisible()
  expect(await color.evaluate(el => {
    const r = el.getBoundingClientRect()
    return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el
  })).toBe(true)
})

test('Lab image options expose names and selected state; collapse preserves the setting', async ({ page }) => {
  await page.goto('/demo/cases/lab01')
  await page.getByRole('button', { name: 'Gold', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Gold', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.s-panel > summary').click()
  await expect(page.locator('.s-panel')).not.toHaveAttribute('open')
  await page.locator('.s-panel > summary').click()
  await expect(page.getByRole('button', { name: 'Gold', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

for (const name of variants) {
  test(`${name}: keyboard edits, folder, save and reset`, async ({ page }) => {
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(`/demo/cases/variants#${name}`)
    const warmth = page.locator('[data-key=warmth] input[type=range]')
    await warmth.focus()
    await warmth.press('ArrowRight')
    await expect(warmth).toHaveValue('57')
    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(warmth).toHaveValue('56')
    await warmth.focus()
    await warmth.press('ArrowRight')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.locator('[data-key=status]')).toContainText('Saved for this session')
    await warmth.focus()
    await warmth.press('ArrowRight')
    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(warmth).toHaveValue('57')
    await page.locator('.s-folder > summary').click()
    await expect(page.locator('.s-folder input[type=color]')).toBeVisible()
    const grain = page.locator('[data-key=grain] input[type=range]')
    await grain.focus()
    await grain.press('ArrowRight')
    await expect(grain).toHaveValue('13')
    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(grain).toHaveValue('12')
    await page.locator('.s-folder > summary').click()
    await expect(page.locator('.s-folder')).not.toHaveAttribute('open')
    expect(errors).toEqual([])
  })
}

test('glass works without a document SVG and keeps accent text legible', async ({ page }) => {
  await page.goto('/demo/cases/variants#frost')
  const surface = await page.locator('.s-panel').evaluate(el => {
    const pseudo = getComputedStyle(el, '::after')
    return { backdrop: pseudo.backdropFilter, filter: pseudo.filter }
  })
  expect(surface.backdrop).toContain('blur(28px)')
  expect(surface.filter).toBe('none')
  await page.goto('/demo/cases/glass')
  await expect(page.locator('.s-button button')).toHaveCSS('color', 'rgb(0, 0, 0)')
})

test('Apple appearance and accent controls update its theme', async ({ page }) => {
  await page.goto('/demo/cases/apple')
  await page.getByRole('button', { name: 'Dark', exact: true }).click()
  await expect(page.locator('.s-panel')).toHaveCSS('color-scheme', 'dark')
  await page.getByRole('button', { name: 'Light', exact: true }).click()
  await expect(page.locator('.s-panel')).toHaveCSS('color-scheme', 'light')
})

for (const name of ['glass', 'neu', 'brutal']) {
  test(`${name}: open content keeps focus rings and shadows; narrow search fits`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.goto(`/demo/cases/${name}`)
    expect(await page.locator('.s-panel').evaluate(el => getComputedStyle(el, '::details-content').overflow)).toBe('visible')
    await page.getByRole('button', { name: 'Filter controls' }).click()
    await expect(page.locator('.s-search-input')).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
    await page.locator('.s-search-input').press('Escape')
  })
}

test('reduced motion disables panel and control transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/demo/cases/neu')
  await expect(page.locator('.s-button button')).toHaveCSS('transition-duration', '0s')
  expect(await page.locator('.s-panel').evaluate(el => getComputedStyle(el, '::details-content').transitionDuration)).toBe('0s')
})

test('collapsed content is skipped by keyboard navigation', async ({ page }) => {
  await page.goto('/demo/cases/neu')
  await page.locator('.s-panel > summary').click()
  await expect(page.locator('[data-key=name] input')).toBeHidden()
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement.closest('.s-panel-content'))).toBe(false)
  }
})

for (const reducedMotion of ['no-preference', 'reduce']) {
  test(`nested folder retains values through repeated collapse (${reducedMotion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/demo/cases/neu')
    const folder = page.locator('.s-folder').filter({ has: page.getByText('Lore', { exact: true }) })
    const age = folder.locator('input[type=number]')
    await expect(age).toBeHidden()
    await folder.locator('summary').click()
    await age.fill('7')
    await age.press('Tab')
    for (let i = 0; i < 2; i++) {
      await folder.locator('summary').click()
      await expect(age).toBeHidden()
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement.closest('.s-folder .s-content'))).toBe(false)
      await folder.locator('summary').click()
      await expect(age).toHaveValue('7')
      await expect(age).toBeVisible()
    }
    await folder.locator('summary').evaluate(el => { el.click(); el.click(); el.click() })
    await expect(age).toBeHidden()
    await folder.locator('summary').click()
    await expect(age).toHaveValue('7')
    await expect(age).toBeVisible()
  })
}

test('Tweakpane folder preserves the visibility transition and values across collapse', async ({ page }) => {
  await page.goto('/demo/cases/tweakpane')
  await page.evaluate(async () => {
    const { default: settings } = await import('/index.js')
    const { default: theme } = await import('/theme/tweakpane.js')
    const host = document.createElement('div')
    host.id = 'foldable'
    document.body.appendChild(host)
    settings({ group: { type: 'folder', collapsed: false }, 'group.value': 1, 'group.divider': { type: 'separator', label: 'Divider' } }, { container: host, theme })
  })
  const folder = page.locator('#foldable .s-folder')
  const separator = folder.locator('.s-separator-labeled')
  await expect(separator).toBeVisible()
  expect(await separator.evaluate(el => el.getBoundingClientRect().height >= el.querySelector('.s-separator-label').getBoundingClientRect().height)).toBe(true)
  const input = folder.locator('input[type=number]')
  await input.fill('7')
  await input.press('Tab')
  for (let i = 0; i < 2; i++) {
    await folder.locator(':scope > summary').click()
    expect(await folder.evaluate(el => getComputedStyle(el, '::details-content').transitionProperty)).toContain('content-visibility')
    await expect(input).toBeHidden()
    await folder.locator(':scope > summary').click()
    await expect(input).toBeVisible()
    await expect(input).toHaveValue('7')
  }
})

test('Neu material axes keep solid faces, independent depth, and a reversible light direction', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/demo/cases/neu')
  await page.locator('.s-folder > summary').filter({ hasText: 'Material' }).click()
  const axis = key => page.locator(`[data-key="${key}"] input[type=range]`)
  const panel = page.locator('.s-panel')
  const button = page.getByRole('button', { name: 'Summon', exact: true })
  const shadow = () => button.evaluate(el => getComputedStyle(el).boxShadow)
  const initial = await shadow()
  await axis('depth').press('Home')
  expect([...((await shadow()).matchAll(/(-?[\d.]+)px/g))].every(m => +m[1] === 0)).toBe(true)
  await axis('depth').press('End')
  expect(await shadow()).not.toBe(initial)
  await axis('contrast').press('Home')
  const flat = await button.evaluate(el => ({ fill: getComputedStyle(el).backgroundImage, shadow: getComputedStyle(el).boxShadow }))
  // Contrast affects the lighting, never the material's opacity. The old
  // coupled alpha let the filled slider track show through the thumb.
  expect(flat.fill.split('linear-gradient')[1]).not.toMatch(/\/\s*0(?:\D|$)/)
  expect(flat.shadow).toContain('/ 0)')
  await axis('contrast').press('End')
  await axis('grain').press('Home')
  expect(await panel.evaluate(el => getComputedStyle(el).getPropertyValue('--neu-grain').trim())).toBe('none')
  await axis('light').press('Home')
  const top = await shadow()
  await axis('light').press('End')
  expect(await shadow()).toBe(top)
  await axis('light').press('Home')
  for (let i = 0; i < 6; i++) await axis('light').press('ArrowRight')
  expect(await axis('light').inputValue()).toBe('90')
  expect(await shadow()).not.toBe(top)
  const finish = page.locator('[data-key=finish] select')
  for (const name of ['Graphite', 'Graphite', 'Amber', 'Mist']) {
    await finish.selectOption(name)
    await expect(panel).toHaveCSS('color-scheme', name === 'Graphite' ? 'dark' : 'light')
    expect(await panel.evaluate(el => getComputedStyle(el).backgroundColor === getComputedStyle(document.body).backgroundColor)).toBe(true)
  }
  await expect(page.locator('[data-key=name] input')).toHaveValue('Bloop')
})

test('Porcelain frame leaves controls clickable and keyboard focus visible', async ({ page }) => {
  await page.goto('/demo/cases/variants#porcelain')
  expect(await page.locator('.s-panel').evaluate(el => getComputedStyle(el, '::before').pointerEvents)).toBe('none')
  const preview = page.locator('[data-key=enabled] input')
  await page.locator('[data-key=enabled] .s-track').click()
  await expect(preview).not.toBeChecked()
  await preview.focus()
  await preview.press('Space')
  await expect(preview).toBeChecked()
  await expect(page.locator('[data-key=enabled] .s-track')).toHaveCSS('outline-style', 'solid')
  const fine = page.getByRole('button', { name: 'Fine', exact: true })
  await page.getByRole('button', { name: 'Draft', exact: true }).click()
  await expect(fine).toHaveAttribute('aria-pressed', 'false')
  await fine.focus()
  await fine.press('Space')
  await expect(fine).toHaveAttribute('aria-pressed', 'true')
  await expect(fine).toHaveCSS('outline-style', 'solid')
  await page.locator('.s-panel > summary').click()
  await expect(fine).toBeHidden()
  await page.locator('.s-panel > summary').click()
  await expect(fine).toHaveAttribute('aria-pressed', 'true')
})

test('Porcelain labeled scales have room and custom checkboxes retain keyboard operation', async ({ page }) => {
  await page.goto('/demo/controls')
  await page.locator('#theme-picker').selectOption('porcelain')
  await page.locator('.s-folder > summary').filter({ hasText: /^Slider$/ }).click()
  const scales = page.locator('.s-slider:has(.s-mark-labels:not(:empty))')
  await expect(scales).toHaveCount(1)
  await expect(scales.locator('.s-mark-label')).toHaveText(['Cold', 'Cool', 'Warm', 'Hot', 'Boil'])
  for (const scale of await scales.all()) {
    const labels = await scale.locator('.s-mark-label').evaluateAll(els => els.map(el => {
      const { left, right } = el.getBoundingClientRect()
      return { left, right }
    }).sort((a, b) => a.left - b.left))
    for (let i = 1; i < labels.length; i++) expect(labels[i].left).toBeGreaterThan(labels[i - 1].right)
  }
  await page.locator('.s-folder > summary').filter({ hasText: /^Boolean$/ }).click()
  const checkbox = page.locator('.s-boolean.s-checkbox input').first()
  await checkbox.focus()
  await checkbox.press('Space')
  await expect(checkbox).toBeChecked()
  await expect(page.locator('.s-boolean.s-checkbox .s-track').first()).toHaveCSS('outline-style', 'solid')
  await checkbox.press('Space')
  await expect(checkbox).not.toBeChecked()
})


test('material case defaults safely for empty, unknown, and inherited property names', async ({ page }) => {
  for (const hash of ['', 'missing', 'constructor']) {
    await page.goto('about:blank')
    await page.goto(`/demo/cases/variants#${hash}`)
    await expect(page.locator('#finish')).toHaveText('Porcelain')
    await expect(page.locator('.s-panel')).toBeVisible()
  }
})
