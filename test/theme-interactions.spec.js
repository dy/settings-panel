import { test, expect } from '@playwright/test'
import { contrast } from '../theme/color.js'

const variants = ['porcelain', 'soft']
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

const controlsIn = async (page, theme) => {
  await page.goto('/demo/controls')
  await page.locator('#theme-picker').selectOption(theme)
}

test('Lab01 segmented is one sunken track with the raised selection inside; image cards stay framed', async ({ page }) => {
  await controlsIn(page, 'lab01')
  await page.locator('.s-folder[data-key=sel] > summary').click()
  const quality = page.locator('.s-folder[data-key=sel] [data-key=mode]')
  const layout = () => quality.locator('.s-input').evaluate(el => {
    const track = el.getBoundingClientRect(), buttons = [...el.querySelectorAll('button')].map(b => b.getBoundingClientRect())
    return {
      fill: getComputedStyle(el).backgroundColor,
      joined: buttons.every((b, i) => !i || Math.abs(b.left - buttons[i - 1].right) < .5),
      inside: buttons.every(b => b.top > track.top && b.bottom < track.bottom && b.left > track.left && b.right < track.right),
    }
  })
  for (const choice of ['Dark', 'Dark', 'Light']) {
    await quality.getByRole('button', { name: choice, exact: true }).click()
    const { fill, joined, inside } = await layout()
    expect(fill, 'the track is filled').not.toBe('rgba(0, 0, 0, 0)')
    expect(joined, 'options touch: one track, not separate plates').toBe(true)
    expect(inside, 'the selection sits inside the track').toBe(true)
    await expect(quality.locator('button.s-selected')).toHaveText(choice)
    await expect(quality.locator('button.s-selected')).not.toHaveCSS('box-shadow', 'none')
    for (const idle of await quality.locator('button:not(.s-selected)').all()) await expect(idle).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  }
  // two and five options touch too: borderless options keep no overlap meant for collapsing borders
  for (const key of ['toggle', 'size']) expect(await page.locator(`.s-folder[data-key=sel] [data-key=${key}] .s-input`).evaluate(el =>
    [...el.querySelectorAll('button')].map(b => b.getBoundingClientRect()).every((b, i, bs) => !i || Math.abs(b.left - bs[i - 1].right) < .5)), key).toBe(true)
  await page.goto('/demo/cases/lab01')
  const cards = page.locator('.s-segmented .s-input')
  await expect(cards).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  expect(parseFloat(await cards.evaluate(el => getComputedStyle(el).columnGap)), 'image cards keep their gap').toBeGreaterThan(0)
})

test('Lab01 collapsed folder closes with the overlaid hairline pair, not a solid border', async ({ page }) => {
  await controlsIn(page, 'lab01')
  const folder = page.locator('.s-folder[data-key=sel]'), summary = folder.locator('> summary')
  const rule = () => summary.evaluate(el => {
    const r = getComputedStyle(el, '::before')
    return { border: getComputedStyle(el).borderBottomStyle, content: r.content, blend: r.mixBlendMode, height: r.height }
  })
  expect(await rule()).toEqual({ border: 'none', content: '""', blend: 'overlay', height: '2px' })
  await summary.click()
  await expect(folder).toHaveAttribute('open')
  expect((await rule()).content, 'an open folder has no closing rule').toBe('none')
  await summary.click()
  await expect(folder).not.toHaveAttribute('open')
  expect(await rule()).toEqual({ border: 'none', content: '""', blend: 'overlay', height: '2px' })
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
    await page.locator(`input[name=light][value=${map}]`).check()
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
    // A hash-only goto restyles the mounted preview in place; let its shadow transitions settle.
    await expect(page.locator(`input[name=light][value=${map}]`)).toBeChecked()
    await page.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished)))
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

test('glass works without a document SVG and letters its buttons in a legible ink', async ({ page }) => {
  await controlsIn(page, 'glass')
  const surface = await page.locator('.s-panel').evaluate(el => {
    const pseudo = getComputedStyle(el, '::after')
    return { backdrop: pseudo.backdropFilter, filter: pseudo.filter }
  })
  expect(surface.backdrop).toContain('blur(24px)')
  expect(surface.filter).toBe('none')
  await page.goto('/demo/cases/glass')
  const { ink, bg, button } = await page.locator('.s-panel').evaluate(el => ({
    ink: getComputedStyle(el).color, bg: getComputedStyle(el).getPropertyValue('--bg').trim(),
    button: getComputedStyle(el.querySelector('.s-button button')).color,
  }))
  expect(button, 'buttons are lettered in the panel ink, not on an accent fill').toBe(ink)
  const hex = rgb => '#' + rgb.match(/[\d.]+/g).slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
  expect(contrast(hex(ink), bg), `ink ${ink} on ${bg}`).toBeGreaterThanOrEqual(4.5)
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
  expect(await panel.evaluate(el => getComputedStyle(el).getPropertyValue('--neu-texture').trim())).toBe('none')
  await axis('light').press('Home')
  const top = await shadow()
  await axis('light').press('End')
  expect(await shadow()).toBe(top)
  await axis('light').press('Home')
  for (let i = 0; i < 6; i++) await axis('light').press('ArrowRight')
  expect(await axis('light').inputValue()).toBe('90')
  expect(await shadow()).not.toBe(top)
  const finish = page.locator('[data-key=finish] select')
  for (const name of ['Graphite', 'Graphite', 'Chalk', 'Bronze']) {
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

// Ink in a slider groove, read from pixels (OKLab L down the fill's height). Neu: the groove's
// catch-light lies under the ink and a knob spills no light, so the fill never lightens toward its
// far wall or beside its knob, on the slider and the on switch alike. Glass: the groove is thinner
// than the lens's bands, so no dark band crosses its lower half.
test.describe('ink in a groove', () => {
  test.use({ deviceScaleFactor: 3 })
  const lightness = (page, clip) => page.screenshot({ clip }).then(png => page.evaluate(async png => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob())
    const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const { data } = g.getImageData(0, 0, img.width, img.height), lin = v => (v /= 255) <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4
    const L = i => { const [r, gg, b] = [lin(data[i]), lin(data[i + 1]), lin(data[i + 2])]
      return .2104542553 * Math.cbrt(.4122214708 * r + .5363325363 * gg + .0514459929 * b) + .793617785 * Math.cbrt(.2119034982 * r + .6806995451 * gg + .1073969566 * b) - .0040720468 * Math.cbrt(.0883024619 * r + .2817188376 * gg + .6299787005 * b) }
    return { w: img.width, h: img.height, rows: [...Array(img.height)].map((_, y) => [...Array(img.width)].map((_, x) => +L((y * img.width + x) * 4).toFixed(4))) }
  }, png.toString('base64')))
  const mount = (page, file) => page.evaluate(async file => {
    const { default: settings } = await import('/index.js'), { default: theme } = await import(`/theme/${file}.js`)
    const host = document.createElement('div'); host.style.cssText = 'width: 360px; position: absolute; left: 0; top: 0; z-index: 9'; document.body.prepend(host)
    settings({ level: { type: 'slider', value: 62, min: 0, max: 100 }, on: true }, { container: host, theme: theme() })
  }, file)
  const at = ({ rows, w, h }, fx, fy) => rows[Math.min(h - 1, Math.round(fy * (h - 1)))][Math.min(w - 1, Math.round(fx * (w - 1)))]

  test('neu: the fill and the on switch do not lighten toward their far wall or beside the knob', async ({ page }) => {
    await page.goto('/')
    await mount(page, 'neu')
    const range = await page.locator('[data-key=level] input[type=range]').boundingBox()
    // the thumb's size is the theme's --knob, resolved in place
    const knob = await page.locator('[data-key=level] input[type=range]').evaluate(el => { const d = el.parentElement.appendChild(document.createElement('div')); d.style.width = 'var(--knob)'; const w = d.getBoundingClientRect().width; d.remove(); return w })
    // the fill from its left end to 2px short of the knob's left edge
    const end = range.x + knob / 2 + .62 * (range.width - knob) - knob / 2 - 2
    const fill = await lightness(page, { x: range.x + range.height, y: range.y, width: end - range.x - range.height, height: range.height })
    for (const fy of [.6, .75, .9]) expect(at(fill, .3, fy), `fill at ${fy} of its height`).toBeLessThanOrEqual(at(fill, .3, .5) + .01)
    expect(at(fill, 1, .3), 'beside the knob').toBeLessThanOrEqual(at(fill, .3, .3) + .01)
    const track = await page.locator('[data-key=on] .s-track').boundingBox()
    const on = await lightness(page, { x: track.x + track.height / 2, y: track.y, width: track.width * .3, height: track.height })
    for (const fy of [.6, .75, .9]) expect(at(on, .5, fy), `on switch at ${fy} of its height`).toBeLessThanOrEqual(at(on, .5, .5) + .01)
  })

  test('glass: no dark band crosses the lower half of the fill', async ({ page }) => {
    await page.goto('/')
    await mount(page, 'glass')
    const range = await page.locator('[data-key=level] input[type=range]').boundingBox()
    const fill = await lightness(page, { x: range.x + range.width * .2, y: range.y, width: range.width * .2, height: range.height })
    // between the middle and the caustic above the bottom edge
    for (const fy of [.65, .75, .85]) expect(at(fill, .5, fy), `fill at ${fy} of its height`).toBeGreaterThanOrEqual(at(fill, .5, .5) - .015)
  })
})

// Labels as handles: a number's label and a vector's axis letters drag their value (Figma, Blender);
// a click without a drag focuses the field, as a label's click does
test('figma: dragging a number label or an axis letter scrubs its value, a click focuses the field', async ({ page }) => {
  await page.goto('/demo/cases/figma')
  const rotation = page.locator('[data-key="rotation"]'), field = rotation.locator('input')
  const label = await rotation.locator('.s-label').boundingBox()
  await page.mouse.move(label.x + 4, label.y + label.height / 2)
  await page.mouse.down()
  await page.mouse.move(label.x + 34, label.y + label.height / 2, { steps: 6 })
  await page.mouse.up()
  await expect(field).toHaveValue('30')
  await expect(field).not.toBeFocused()
  await rotation.locator('.s-label').click()
  await expect(field).toBeFocused()
  const xy = page.locator('[data-key="xy"]'), x = xy.locator('input').first()
  const letter = await xy.locator('.s-vec-label').first().boundingBox()
  await page.mouse.move(letter.x + letter.width / 2, letter.y + letter.height / 2)
  await page.mouse.down()
  await page.mouse.move(letter.x + letter.width / 2 - 20, letter.y + letter.height / 2, { steps: 4 })
  await page.mouse.up()
  await expect(x).toHaveValue('100')
})

// The row is the hit target: a dropdown's label opens its menu, in themes that draw the menu and those that don't
for (const name of ['dialkit', 'studio', 'figma']) test(`${name}: a click on a dropdown's label opens its menu`, async ({ page }) => {
  await page.goto(`/demo/cases/${name}`)
  const row = page.locator('.s-select.s-dropdown').first()
  await row.locator('.s-label').click()
  expect(await row.locator('select').evaluate(s => s.matches(':open'))).toBe(true)
})

// DialKit's text wraps a long value and grows its row, up to five lines; Enter starts a new line, as native's does
test('dialkit: text wraps a long value and grows its row; Enter breaks the line', async ({ page }) => {
  await page.goto('/demo/cases/dialkit')
  const row = page.locator('.s-text'), field = row.locator('textarea')
  const rest = (await row.boundingBox()).height
  expect(rest).toBe(36)
  await field.click()
  await field.evaluate(e => e.setSelectionRange(e.value.length, e.value.length))
  await page.keyboard.type(' and a title long enough to wrap')
  const wrapped = (await row.boundingBox()).height
  expect(wrapped).toBeGreaterThan(rest + 17)
  await page.keyboard.press('Enter')
  await page.keyboard.type('second')
  await expect(field).toBeFocused()
  expect(await field.inputValue()).toMatch(/wrap\nsecond$/)
  expect((await row.boundingBox()).height).toBeGreaterThan(wrapped + 17)
  await field.fill('')
  expect((await row.boundingBox()).height).toBe(rest)
})

// A theme that doesn't ask for wrapping keeps the single-line input
test('glass: text stays a single-line input', async ({ page }) => {
  await page.goto('/demo/cases/glass')
  await expect(page.locator('.s-text input[type=text]').first()).toBeVisible()
  await expect(page.locator('.s-text textarea')).toHaveCount(0)
})

// DialKit's Off / On pill slides from one word to the other rather than jumping
test('dialkit: the boolean pill slides to the chosen word', async ({ page }) => {
  await page.goto('/demo/cases/dialkit')
  const input = page.locator('.s-boolean .s-input')
  const pill = () => input.evaluate(el => { const s = getComputedStyle(el, '::before'); return { at: s.translate, width: s.width, moves: s.transitionProperty } })
  const on = await pill()
  expect(on.moves).toContain('translate')
  await input.click()
  await expect(page.locator('.s-boolean input')).not.toBeChecked()
  await page.waitForTimeout(300)
  const off = await pill()
  expect(off.at).toBe('none')
  expect(on.at).toBe(off.width) // on sits one Off-word along
})

// DialKit's number is part of the slider until the pointer rests on it: a click there sets the slider (springing
// to it, as every click does), and only after 0.8s on it does a click edit the number
test('dialkit: a click on the number sets the slider; resting on it first, the click edits', async ({ page }) => {
  await page.goto('/demo/cases/dialkit')
  const row = page.locator('.s-slider').first(), number = row.locator('.s-readout'), range = row.locator('input[type=range]')
  expect(await row.locator('.s-track').evaluate(t => getComputedStyle(t).transitionProperty)).toBe('--p')
  const box = await number.boundingBox(), at = [box.x + box.width / 2, box.y + box.height / 2]
  await page.mouse.click(...at)
  await expect(number).not.toBeFocused()
  expect(+await range.inputValue()).toBeGreaterThan(55)
  await page.mouse.move(at[0] - 20, at[1])
  await page.mouse.move(...at)
  await expect(number).toHaveClass(/s-editable/, { timeout: 2000 })
  await page.mouse.click(...at)
  await expect(number).toBeFocused()
})

// A drag holds its control still: transitions off while it moves, the pointer hidden where the value is not under it
test('a scrub hides the pointer and a slider drag turns its transitions off, both only while they last', async ({ page }) => {
  await page.goto('/demo/cases/dialkit')
  const row = page.locator('.s-slider').first(), track = row.locator('.s-track')
  const box = await row.boundingBox(), y = box.y + box.height / 2
  await page.mouse.move(box.x + 40, y)
  await page.mouse.down()
  await page.mouse.move(box.x + 120, y, { steps: 4 })
  expect(await track.evaluate(t => getComputedStyle(t).transitionDuration)).toBe('0s')
  await page.mouse.up()
  expect(await track.evaluate(t => getComputedStyle(t).transitionDuration)).not.toBe('0s')

  await page.goto('/demo/cases/figma')
  const label = await page.locator('[data-key="rotation"] .s-label').boundingBox()
  await page.mouse.move(label.x + 4, label.y + 4)
  await page.mouse.down()
  await page.mouse.move(label.x + 30, label.y + 4, { steps: 4 })
  await expect(page.locator('html')).toHaveClass(/s-cursorless/)
  expect(await page.locator('[data-key="rotation"] .s-label').evaluate(e => getComputedStyle(e).cursor)).toBe('none')
  await page.mouse.up()
  await expect(page.locator('html')).not.toHaveClass(/s-cursorless/)
})

// An icon alone makes a square key named for assistive tech; with text, the icon leads it
test('a button takes an icon: alone it is a square key with a name, with text it leads', async ({ page }) => {
  await page.goto('/demo/cases/materials#graphite')
  const [icon, pill] = await page.locator('#study [data-key=keys]').first().locator('button').all()
  await expect(icon).toHaveAttribute('aria-label', 'Search')
  await expect(icon).toHaveClass(/s-icon-only/)
  const b = await icon.boundingBox()
  expect(Math.abs(b.width - b.height)).toBeLessThan(.5)
  await expect(pill.locator('.s-icon')).toHaveCount(0)
  await expect(pill).toHaveText('Search')
})

// A drag that loses its release (the window blurs, the pointer is cancelled) still ends: the pointer comes back
test('a slider drag hides the pointer and gives it back when the window loses focus mid-drag', async ({ page }) => {
  await page.goto('/demo/cases/dialkit')
  const box = await page.locator('.s-slider').first().boundingBox(), y = box.y + box.height / 2
  await page.mouse.move(box.x + 40, y)
  await page.mouse.down()
  await page.mouse.move(box.x + 120, y, { steps: 4 })
  await expect(page.locator('html')).toHaveClass(/s-cursorless/)
  await page.evaluate(() => window.dispatchEvent(new Event('blur')))
  await expect(page.locator('html')).not.toHaveClass(/s-cursorless/)
  await expect(page.locator('.s-dragging')).toHaveCount(0)
  await page.mouse.up()
})

// Leva's vector holds string values ('3.0'): a scrub moves the number, it does not append to the string
test('leva: dragging a vector axis letter moves its number', async ({ page }) => {
  await page.goto('/demo/cases/leva')
  const row = page.locator('[data-key="vector2"]'), x = row.locator('input').first()
  const label = await row.locator('.s-vec-label').first().boundingBox()
  await page.mouse.move(label.x + label.width / 2, label.y + label.height / 2)
  await page.mouse.down()
  await page.mouse.move(label.x + label.width / 2 + 20, label.y + label.height / 2, { steps: 4 })
  await page.mouse.up()
  const v = +(await x.inputValue())
  expect(Number.isFinite(v)).toBe(true)
  expect(v).toBeGreaterThan(3)
})

// Tweakpane's numeric fields scrub from the field itself (`scrub: true`)
test('tweakpane: dragging a vector field scrubs its value; a click still edits', async ({ page }) => {
  await page.goto('/demo/cases/tweakpane')
  const x = page.locator('[data-key="position"] input').first(), before = +(await x.inputValue())
  const b = await x.boundingBox()
  await page.mouse.move(b.x + 6, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + 36, b.y + b.height / 2, { steps: 4 })
  await page.mouse.up()
  expect(+(await x.inputValue())).toBeGreaterThan(before)
  await x.click()
  await expect(x).toBeFocused()
})

// Studio: hovering a section heading or folder changes nothing in the layout
test('studio: hover leaves every row where it was', async ({ page }) => {
  await page.goto('/demo/cases/studio')
  const tops = () => page.locator('.s-panel .s-control').evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().top)))
  const before = await tops()
  for (const el of await page.locator('.s-panel :is(.s-separator, .s-folder > summary, .s-button)').all()) {
    await el.hover()
    expect(await tops()).toEqual(before)
  }
})

// slider:range: two thumbs on one track, value [low, high], low never above high; a [low, high] value infers it
test('slider:range keeps [low, high] in order and is inferred from a [low, high] value with bounds', async ({ page }) => {
  await page.goto('/test/calibration/row.html')
  const state = await page.evaluate(async () => {
    document.body.innerHTML = '<div id="c"></div>'
    const { default: settings } = await import('/index.js')
    const s = settings({ wall: { type: 'slider:range', value: [1, 4], min: 0, max: 5, step: .1 }, gap: { value: [0, 5], min: 0, max: 5 } }, { container: '#c' })
    const hi = document.querySelector('[data-key="wall"] .s-readout-hi')
    hi.value = '.5'; hi.dispatchEvent(new Event('change'))
    return { wall: [...s.wall], gap: document.querySelectorAll('[data-key="gap"] input[type=range]').length }
  })
  expect(state.wall).toEqual([1, 1])
  expect(state.gap).toBe(2)
})


// json: the panel reads as the object it edits, and every value stays editable in place
test('json: entries read as JSON and edit in place', async ({ page }) => {
  await page.goto('/test/calibration/row.html')
  await page.evaluate(async () => {
    document.body.innerHTML = '<div id="c"></div>'
    const { default: settings } = await import('/index.js')
    const { default: json } = await import('/theme/json.js')
    window.s = settings({ name: 'Aurora', on: true, room: { type: 'folder' }, 'room.wall': { type: 'slider:range', value: [0, 5], min: 0, max: 5, step: .1 }, at: { type: 'vector', value: [1, 2], pad: 'open' }, blend: { options: ['screen', 'multiply'], value: 'screen' }, go() {} },
      { container: '#c', title: 'State', theme: json() })
  })
  const text = await page.locator('.s-panel').evaluate(p => {
    const pseudo = (el, at) => { const c = getComputedStyle(el, at).content; return c === 'none' || c === 'normal' ? '' : c.replace(/^"|"$/g, '').replace(/\\"/g, '"') }
    const walk = el => {
      if (el.checkVisibility && !el.checkVisibility() || el.type === 'checkbox') return ''
      const own = ['INPUT', 'SELECT'].includes(el.tagName) ? (el.tagName === 'SELECT' ? el.selectedOptions[0].text : el.value)
        : [...el.childNodes].map(n => n.nodeType === 3 ? (getComputedStyle(el).fontSize === '0px' ? '' : n.textContent.trim()) : walk(n)).join('')
      return pseudo(el, '::before') + own + pseudo(el, '::after')
    }
    return walk(p)
  })
  expect(text).toBe('{"name": "Aurora","on": true,"room": {"wall": [0, 5]},"at": [1, 2],"blend": "screen"go()}')
  await page.locator('[data-key="on"] .s-track').click()
  expect(await page.evaluate(() => s.on)).toBe(false)
  await page.locator('[data-key="at"] input').nth(1).fill('7')
  await page.locator('[data-key="at"] input').nth(1).press('Enter')
  expect(await page.evaluate(() => [...s.at])).toEqual([1, 7])
  await expect(page.locator('[data-key="blend"] select')).toBeVisible()
})

test('json: a panel without a title still opens and closes its braces', async ({ page }) => {
  await page.goto('/test/calibration/row.html')
  const braces = await page.evaluate(async () => {
    document.body.innerHTML = '<div id="c"></div>'
    const { default: settings } = await import('/index.js')
    const { default: json } = await import('/theme/json.js')
    settings({ n: 1 }, { container: '#c', theme: json() })
    const c = document.querySelector('.s-panel-content')
    return [getComputedStyle(c, '::before').content, getComputedStyle(c, '::after').content]
  })
  expect(braces).toEqual(['"{"', '"}"'])
})

// Studio: a slider under the pointer shows the steps ahead as dots, as DialKit's hashmarks; at rest it shows none
test('studio: a slider shows its steps under the pointer and in hand', async ({ page }) => {
  await page.goto('/demo/cases/studio')
  const track = page.locator('[data-key="size"] .s-track'), input = track.locator('input')
  const dots = () => input.evaluate(i => getComputedStyle(i).backgroundImage)
  await page.mouse.move(0, 0)
  expect(await dots()).toBe('none')
  const b = await track.boundingBox()
  await page.mouse.move(b.x + b.width * .4, b.y + b.height / 2)
  expect(await dots()).toContain('radial-gradient')
  await page.mouse.down()
  expect(await dots()).toContain('radial-gradient')
  await page.mouse.up()
  await page.mouse.move(0, 0)
  expect(await dots()).toBe('none')
})

// json: a wrapped choice row never leaves its comma alone on a line (with Menlo it did at 244px)
test('json: a choice row keeps its comma on its last choice at every width', async ({ page }) => {
  await page.goto('/test/calibration/row.html')
  const alone = await page.evaluate(async () => {
    document.body.innerHTML = '<div id="g"></div>'
    const { default: settings } = await import('/index.js'), { default: json } = await import('/theme/json.js')
    const out = []
    for (let w = 220; w <= 330; w += 2) {
      const c = document.createElement('div'); c.style.width = w + 'px'; g.append(c)
      settings({ left: { type: 'select:segmented', options: ['mirror', 'wall', 'open'], value: 'wall' }, n: 1 }, { container: c, theme: json({ font: 'Menlo, monospace' }) })
      const row = c.querySelector('[data-key=left]').getBoundingClientRect(), last = c.querySelector('[data-key=left] button:last-child').getBoundingClientRect()
      if (row.bottom - last.bottom > 9) out.push(w)
    }
    return out
  })
  expect(alone).toEqual([])
})

// Studio: a slider's number is as wide as its text, so the caret's area is the value and nothing beside it
test('studio: a slider readout hugs its value', async ({ page }) => {
  await page.goto('/demo/cases/studio')
  const over = await page.locator('.s-slider .s-readout').evaluateAll(rs => rs.map(r => {
    const ctx = document.createElement('canvas').getContext('2d'), cs = getComputedStyle(r)
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    return r.getBoundingClientRect().width - ctx.measureText(r.value).width
  }))
  for (const d of over) expect(d).toBeLessThan(2)
})

// A scrub draws its change: a trail in the row from the press to the pointer, gone when the drag ends
test('a scrub draws a trail from where it began to the pointer, and clears it', async ({ page }) => {
  await page.goto('/demo/cases/figma')
  const label = await page.locator('[data-key="rotation"] .s-label').boundingBox()
  await page.mouse.move(label.x + 4, label.y + 4)
  await page.mouse.down()
  await page.mouse.move(label.x + 44, label.y + 4, { steps: 4 })
  const trail = page.locator('[data-key="rotation"] .s-scrub-trail')
  await expect(trail).toHaveCount(1)
  expect(Math.round((await trail.boundingBox()).width)).toBe(40)
  await page.mouse.up()
  await expect(trail).toHaveCount(0)
})

// Studio: in hand, a slider's label steps aside only while the handle is over it
test('studio: a dragged slider hides its label only while the handle passes over it', async ({ page }) => {
  await page.goto('/demo/cases/studio')
  const row = page.locator('[data-key="size"]'), b = await row.locator('.s-track').boundingBox(), label = await row.locator('.s-label').boundingBox()
  await page.mouse.move(b.x + b.width * .8, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width * .7, b.y + b.height / 2, { steps: 3 })
  await expect(row).not.toHaveClass(/s-over-label/)
  await page.mouse.move(label.x + label.width / 2, b.y + b.height / 2, { steps: 6 })
  await expect(row).toHaveClass(/s-over-label/)
  await page.mouse.up()
  await expect(row).not.toHaveClass(/s-over-label/)
})

// Studio: a range takes a press anywhere on its row, and the nearer handle comes to it
test('studio: a press anywhere on a range moves its nearer handle there', async ({ page }) => {
  await page.goto('/test/calibration/row.html')
  await page.evaluate(async () => {
    document.body.innerHTML = '<div id="c" style="width:320px"></div>'
    const { default: settings } = await import('/index.js'), { default: studio } = await import('/theme/studio.js')
    window.s = settings({ span: { type: 'slider:range', value: [40, 60], min: 0, max: 100, step: 1 } }, { container: '#c', theme: studio() })
  })
  const b = await page.locator('[data-key=span] .s-interval-track').boundingBox(), y = b.y + b.height / 2
  // (the row's end holds the values, which edit on a press)
  await page.mouse.move(b.x + b.width * .72, y)
  await page.mouse.down(); await page.mouse.up()
  const [lo, hi] = await page.evaluate(() => [...s.span])
  expect(lo).toBe(40)
  expect(hi).toBeGreaterThan(65)
  await page.mouse.move(b.x + b.width * .1, y)
  await page.mouse.down(); await page.mouse.up()
  const [lo2, hi2] = await page.evaluate(() => [...s.span])
  expect(lo2).toBeLessThan(20)
  expect(hi2).toBe(hi)
  // and, dragged over the label, the label steps aside
  const label = await page.locator('[data-key=span] .s-label').boundingBox(), row = page.locator('[data-key=span]')
  await page.mouse.move(b.x + b.width * .5, y); await page.mouse.down()
  await page.mouse.move(label.x + label.width / 2, y, { steps: 6 })
  await expect(row).toHaveClass(/s-over-label/)
  await page.mouse.up()
  await expect(row).not.toHaveClass(/s-over-label/)
})
