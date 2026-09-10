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

test('Lab01 inputs share the inactive toggle track; fonts, color editing and slider endpoints survive palette changes', async ({ page }) => {
  await page.goto('/#theme=lab01&colormap=graphite')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => ['Geist', 'Geist Mono'].every(font => document.fonts.check(`13px "${font}"`)))).toBe(true)
  const live = page.locator('#live-panel')
  await expect(live.locator('.s-panel')).toHaveCSS('font-family', /Geist Mono/)
  await expect(live.locator('.s-panel > summary')).toHaveCSS('font-family', /Geist/)
  const range = live.locator('[data-key=opacity] input[type=range]')
  await range.press('Home')
  await expect(range).toHaveValue('0')
  await range.press('End')
  await expect(range).toHaveValue('100')
  const text = live.locator('[data-key=tint] input[type=text]')
  await text.fill('#ff6688')
  await text.press('Tab')
  const toggle = live.locator('[data-key=enabled] input')
  await live.locator('[data-key=enabled] .s-track').click()
  for (const map of ['graphite', 'graphite', 'dark', 'gray', 'gold', 'silver', 'chalk', 'graphite']) {
    await page.locator('#colormap-select').selectOption(map)
    await expect(range).toHaveValue('100')
    const swatch = live.locator('input[type=color]')
    await expect(swatch).toHaveValue('#ff6688')
    await swatch.focus()
    await expect(swatch).toBeFocused()
    expect(await swatch.evaluate(el => {
      const r = el.getBoundingClientRect(), field = el.nextElementSibling.getBoundingClientRect()
      return r.width >= 30 && r.height >= 30 && r.right <= field.left && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el
    })).toBe(true)
    await swatch.blur()
    await expect(toggle).not.toBeChecked()
    const recesses = await page.evaluate(() => {
      const panel = document.querySelector('#live-panel .s-panel')
      const read = el => { const style = getComputedStyle(el); return [style.backgroundColor, style.boxShadow] }
      const expected = read(panel.querySelector('[data-key=enabled] .s-track'))
      const actual = ['[data-key=name] input', '[data-key=blend] select', '[data-key=opacity] input[type=range]', '[data-key=tint] input[type=text]', '[data-key=tint] input[type=color]'].map(selector => read(panel.querySelector(selector)))
      return { expected, actual }
    })
    for (const actual of recesses.actual) expect(actual).toEqual(recesses.expected)
  }
  await page.getByRole('button', { name: 'Reset preview values' }).click()
  await expect(range).toHaveValue('82')
  await expect(toggle).toBeChecked()
  await expect(live.locator('input[type=color]')).toHaveValue('#8b80f9')
})

test('Lab01 gallery materials show matching thumbs and recessed controls', async ({ page }) => {
  for (const map of ['dark', 'graphite', 'gray', 'gold']) {
    await page.goto('/#theme=lab01&colormap=' + map)
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('#live-panel')).toHaveScreenshot(`lab01-${map}.png`, { animations: 'disabled', maxDiffPixelRatio: .01 })
  }
})

test('Lab01 focused fields share the selected image-card ring for dark and light materials', async ({ page }) => {
  for (const map of ['dark', 'gold', 'chalk']) {
    await page.goto('/#theme=lab01&colormap=' + map)
    const expected = await page.evaluate(async () => {
      const { default: settings } = await import('/index.js')
      const { default: lab01 } = await import('/theme/lab01.js')
      const host = document.createElement('div'); document.body.append(host)
      const shade = getComputedStyle(document.querySelector('#live-panel .s-panel')).getPropertyValue('--bg').trim()
      const panel = settings({ plate: { type: 'select', variant: 'segmented', value: 'a', options: [{ value: 'a', label: 'A', style: 'background-image:linear-gradient(black,white)' }] } }, { container: host, theme: lab01({ shade }) })
      const shadow = getComputedStyle(host.querySelector('button.s-selected'), '::before').boxShadow
      panel[Symbol.dispose](); host.remove()
      return shadow
    })
    for (const selector of ['[data-key=name] input', '[data-key=blend] select', '[data-key=opacity] .s-readout', '[data-key=tint] input[type=text]', '[data-key=tint] input[type=color]']) {
      const field = page.locator('#live-panel ' + selector)
      const resting = await field.evaluate(el => getComputedStyle(el).boxShadow)
      await field.focus()
      await expect(field).toHaveCSS('box-shadow', expected)
      await expect(field).toHaveCSS('outline-style', 'none')
      await field.evaluate(el => el.blur())
      await expect(field).toHaveCSS('box-shadow', resting)
    }
  }
})

test('Lab01 RGBA stays readable and switches stay centered at size and density boundaries', async ({ page }) => {
  await page.goto('/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const issues = await page.evaluate(async () => {
    const { default: settings } = await import('/index.js')
    const { default: lab01 } = await import('/theme/lab01.js')
    const host = document.createElement('div'); host.style.width = '288px'; document.body.append(host)
    const issues = []
    for (const axes of [{ size: .8, spacing: .65 }, { size: 1.2, spacing: 1.5 }]) {
      const panel = settings({ tint: { type: 'color', variant: 'rgba', value: '#ff668880' }, enabled: { type: 'boolean', variant: 'switch', value: false } }, { container: host, theme: lab01(axes) })
      const text = host.querySelector('input[type=text]'), swatch = host.querySelector('input[type=color]')
      if (text.getBoundingClientRect().width < parseFloat(getComputedStyle(text).fontSize) * 5) issues.push('RGBA readout squeezed')
      const bounds = host.getBoundingClientRect()
      for (const input of host.querySelectorAll('input')) {
        const r = input.getBoundingClientRect()
        if (r.width && (r.left < bounds.left || r.right > bounds.right + 1)) issues.push(`${input.type} outside host`)
      }
      const alpha = host.querySelector('.s-alpha')
      for (const value of ['0', '1', '0']) {
        alpha.value = value; alpha.dispatchEvent(new Event('input', { bubbles: true }))
        await new Promise(requestAnimationFrame)
        if (panel.tint !== (value === '0' ? '#ff668800' : '#ff6688')) issues.push('alpha edit lost color channels')
        if (swatch.value !== '#ff6688') issues.push('swatch lost RGB')
      }
      for (const checked of [false, true, false]) {
        panel.enabled = checked
        await new Promise(requestAnimationFrame)
        const track = host.querySelector('.s-switch .s-track'), thumb = getComputedStyle(track, '::before')
        const inset = parseFloat(thumb.top), size = parseFloat(thumb.height)
        if (Math.abs(track.getBoundingClientRect().height - size - inset * 2) > .1) issues.push('thumb off center')
        const x = new DOMMatrix(thumb.transform).m41 + parseFloat(thumb.left)
        const expected = checked ? track.getBoundingClientRect().width - size - inset : inset
        if (Math.abs(x - expected) > .1) issues.push('thumb misses endpoint')
      }
      panel[Symbol.dispose]()
    }
    host.remove()
    return issues
  })
  expect(issues).toEqual([])
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
