import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { contrast } from '../theme/color.js'
import { themes as registry } from '../demo/themes.js'

const themes = ['default', 'skeu', 'glass', 'neu', 'porcelain', 'brutal', 'lab01', 'swiss', 'terminal', 'control-panel', 'dat', 'tweakpane', 'leva', 'controlkit', 'uil', 'oui', 'figma', 'apple', 'devtools', 'studio', 'editorial', 'synth', 'imgui', 'retro', 'bitmap', 'industrial']

test('DevTools empty declarations keep braces on static panels and through collapse cycles', async ({ page }) => {
  await page.goto('/')
  const results = await page.evaluate(async () => {
    const { default: settings } = await import('/index.js')
    const { default: devtools } = await import('/theme/devtools.js')
    const host = document.createElement('div')
    document.body.appendChild(host)
    const results = []
    for (const collapsed of [undefined, false]) {
      const panel = settings({}, { container: host, title: 'element.style', collapsed, theme: devtools() })
      const el = host.querySelector('.s-panel')
      const read = () => ({ opening: getComputedStyle(el.firstElementChild, '::after').content, closing: getComputedStyle(el, '::after').content, display: getComputedStyle(el, '::after').display })
      results.push(read())
      if (el.tagName === 'DETAILS') {
        for (const open of [false, true, true]) { el.open = open; results.push(read()) }
      }
      panel[Symbol.dispose]()
    }
    host.remove()
    return results
  })
  expect(results.map(r => r.display)).toEqual(['block', 'block', 'none', 'block', 'block'])
  for (const result of results) {
    expect(result.opening).toBe('"{"')
    expect(result.closing).toBe('"}"')
  }
})

test('all gallery themes fit a narrow host at both size and density extremes', async ({ page }) => {
  await page.goto('/')
  const issues = await page.evaluate(async names => {
    const { default: settings } = await import('/index.js')
    const host = document.createElement('div')
    host.className = 'live-panel'
    host.style.width = '288px'
    document.body.appendChild(host)
    const issues = []
    for (const name of names) {
      const { default: theme } = await import(`/theme/${name}.js`)
      for (const axes of [{ size: .8, spacing: .65 }, { size: 1.2, spacing: 1.5 }]) {
        const panel = settings({ name: { type: 'text', value: 'Aurora' }, blend: ['Screen', 'Multiply'], opacity: { type: 'slider', value: 82, min: 0, max: 100 }, enabled: { type: 'boolean', variant: 'switch', value: true }, tint: '#8b80f9', apply: { type: 'button', text: 'Apply effect', label: false } }, { container: host, title: 'Layer', collapsed: false, theme: theme(axes) })
        const bounds = host.getBoundingClientRect()
        for (const el of host.querySelectorAll('input, select, button')) {
          const r = el.getBoundingClientRect()
          if (el.checkVisibility() && r.width && (r.left < bounds.left - 1 || r.right > bounds.right + 1)) issues.push(`${name} size=${axes.size} ${el.closest('[data-key]').dataset.key}: ${Math.round(r.right - bounds.right)}px`)
        }
        panel[Symbol.dispose]()
      }
    }
    host.remove()
    return issues
  }, themes)
  expect(issues).toEqual([])
})

test('every theme scales type with size and spacing independently, retaining finite geometry', async ({ page }) => {
  await page.goto('/')
  const results = await page.evaluate(async names => {
    const { default: settings } = await import('/index.js')
    const host = document.createElement('div')
    host.style.width = '500px'
    document.body.appendChild(host)
    const results = []
    for (const name of names) {
      const { default: theme } = await import(`/theme/${name}.js`)
      const samples = []
      for (const axes of [{ size: 1, spacing: 1 }, { size: 1.2, spacing: 1 }, { size: 1, spacing: .5 }, { size: 1, spacing: 2 }, { size: 1, spacing: 1 }]) {
        const panel = settings({ name: { type: 'text', value: 'Layer' }, blend: ['Screen', 'Multiply'], opacity: { type: 'slider', value: 0, min: 0, max: 100 }, enabled: false }, { container: host, title: 'Layer', theme: theme(axes) })
        const el = host.querySelector('.s-panel'), style = getComputedStyle(el)
        const input = el.querySelector('input[type=text]')
        samples.push({ font: parseFloat(style.fontSize), height: el.offsetHeight, input: input.offsetHeight, width: el.offsetWidth })
        panel[Symbol.dispose]()
      }
      results.push({ name, samples })
    }
    host.remove()
    return results
  }, themes)
  for (const { name, samples: [base, large, dense, roomy, again] } of results) {
    expect(large.font / base.font, name).toBeCloseTo(1.2, 2)
    expect(dense.font, name).toBe(base.font)
    expect(roomy.font, name).toBe(base.font)
    expect(roomy.height, name).toBeGreaterThan(dense.height)
    expect(large.input, name).toBeGreaterThanOrEqual(base.input)
    expect(again, name).toEqual(base)
    for (const sample of [base, large, dense, roomy]) for (const n of Object.values(sample)) expect(Number.isFinite(n) && n > 0, name).toBe(true)
  }
})

test('reported flat themes paint a distinct panel surface and UIL fills its available columns', async ({ page }) => {
  await page.goto('/')
  for (const name of ['oui', 'control-panel', 'figma', 'soft']) {
    await page.locator(`[data-theme="${name}"] .theme-choice`).click()
    await page.locator('input[name=light][value=chalk]').check()
    const colors = await page.locator('#live-panel .s-panel').evaluate(el => [getComputedStyle(el).backgroundColor, getComputedStyle(el.closest('#preview-scene')).backgroundColor])
    expect(colors[0], name).not.toBe('rgba(0, 0, 0, 0)')
    expect(colors[0], name).not.toBe(colors[1])
  }
  await page.locator('[data-theme=uil] .theme-choice').click()
  const row = page.locator('#live-panel [data-key=name]')
  const input = row.locator('input')
  const [r, i] = await Promise.all([row.boundingBox(), input.boundingBox()])
  expect(i.x + i.width).toBeCloseTo(r.x + r.width, 0)
  await input.fill('Wide UIL')
  await page.locator('#live-panel [data-key=enabled] .s-track').click()
  await expect(page.locator('#live-panel [data-key=enabled] input')).not.toBeChecked()
})

test('Swiss preserves its transparent demo surface and action spacing through colormap changes', async ({ page }) => {
  await page.goto('/demo/cases/swiss')
  const demo = page.locator('#panel .s-panel')
  await expect(demo).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(demo.locator('[data-key=company] input')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(demo.locator('.s-button')).toHaveCSS('padding-top', '56px')
  await expect(demo.locator('.s-button')).toHaveCSS('padding-bottom', '16px')
  await page.goto('/#theme=swiss')
  const live = page.locator('#live-panel .s-panel')
  for (const map of ['chalk', 'graphite', 'chalk']) {
    await page.locator(`input[name=light][value=${map}]`).check()
    await expect(live).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(live.locator('[data-key=name] input')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(live).toHaveCSS('color', map === 'chalk' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)')
    await expect(live.locator('[data-key=name]')).toHaveCSS('border-top-width', '1px')
  }
  await live.locator('[data-key=name] input').fill('On the backdrop')
  await page.locator('input[name=light][value=graphite]').check()
  await expect(live.locator('[data-key=name] input')).toHaveValue('On the backdrop')
})

test('DevTools declarations edit, collapse, reopen and reset', async ({ page }) => {
  await page.goto('/demo/cases/devtools')
  await page.locator('[data-key=display] select').selectOption('flex')
  await page.locator('[data-key=opacity] input[type=range]').press('Home')
  await page.locator('[data-key=visible] input').uncheck()
  await page.locator('[data-key="font-size"] input').fill('24')
  await page.locator('[data-key=transform] input').fill('none')
  await page.locator('.s-folder > summary').click()
  await page.locator('[data-key=gap] input').fill('32')
  await page.locator('.s-panel > summary').click()
  await expect(page.locator('[data-key=display] select')).toBeHidden()
  await page.locator('.s-panel > summary').click()
  await expect(page.locator('[data-key=display] select')).toHaveValue('flex')
  await expect(page.locator('[data-key=opacity] input[type=range]')).toHaveValue('0')
  await page.getByRole('button', { name: 'Reset declarations' }).click()
  await expect(page.locator('[data-key=display] select')).toHaveValue('grid')
  await expect(page.locator('[data-key=opacity] input[type=range]')).toHaveValue('0.85')
  await expect(page.locator('[data-key=visible] input')).toBeChecked()
  await expect(page.locator('[data-key="font-size"] input')).toHaveValue('14')
  await expect(page.locator('[data-key=transform] input')).toHaveValue('translateY(0)')
  await expect(page.locator('[data-key=gap] input')).toHaveValue('16')
})

test('DevTools light and dark keep Chrome colors, inline fields and edited values through appearance changes', async ({ page }) => {
  await page.goto('/demo/cases/devtools')
  await page.setViewportSize({ width: 320, height: 700 })
  const panel = page.locator('.s-panel'), field = page.locator('[data-key=transform] input')
  await field.fill('')
  await field.focus()
  await expect(field).toHaveCSS('outline-style', 'solid')
  expect(await field.evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(5)
  await field.fill('translateX(' + '1'.repeat(100) + 'px)')
  await page.locator('[data-key=visible] input').uncheck()
  for (const mode of ['light', 'light', 'dark', 'light']) {
    await page.locator('#appearance').selectOption(mode)
    await expect(panel).toHaveCSS('background-color', mode === 'light' ? 'rgb(255, 255, 255)' : 'rgb(40, 40, 40)')
    await expect(panel).toHaveCSS('color-scheme', mode)
    await expect(panel.locator('[data-key=display] .s-label')).toHaveCSS('color', mode === 'light' ? 'rgb(220, 54, 46)' : 'rgb(92, 213, 251)')
    await expect(field).toHaveCSS('color', mode === 'light' ? 'rgb(31, 31, 31)' : 'rgb(227, 227, 227)')
    await expect(field).toHaveValue('translateX(' + '1'.repeat(100) + 'px)')
    await expect(page.locator('[data-key=visible] input')).not.toBeChecked()
    expect(await panel.evaluate(el => {
      const bounds = el.getBoundingClientRect()
      return [...el.querySelectorAll('input, select, button')].filter(el => el.checkVisibility()).every(el => {
        const r = el.getBoundingClientRect()
        return r.left >= bounds.left && r.right <= bounds.right
      })
    })).toBe(true)
  }
  const punctuation = await panel.evaluate(el => ({
    declaration: getComputedStyle(el.querySelector('[data-key=transform]'), '::after').content,
    folder: getComputedStyle(el.querySelector('.s-folder'), '::after').content,
  }))
  expect(punctuation).toEqual({ declaration: '";"', folder: 'none' })
  await page.getByRole('button', { name: 'Reset declarations' }).click()
  await expect(field).toHaveValue('translateY(0)')
  await expect(page.locator('[data-key=visible] input')).toBeChecked()
  await page.locator('#appearance').selectOption('dark')
  await page.reload()
  await expect(page.locator('#appearance')).toHaveValue('dark')
  await expect(panel).toHaveCSS('color-scheme', 'dark')
})

test('boolean, radio and checkbox-list properties follow resets after native interaction', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const { default: settings } = await import('/index.js')
    const host = document.createElement('div')
    host.id = 'checked-review'
    document.body.appendChild(host)
    window.checkedPanel = settings({
      flag: { type: 'boolean', variant: 'checkbox', value: true },
      choice: { type: 'select', variant: 'radio', options: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }], value: 1 },
      list: { type: 'select', variant: 'checkboxes', multiple: true, options: ['A', 'B'], value: ['A'] },
    }, { container: host })
  })
  const host = page.locator('#checked-review')
  await expect(host.locator('[data-key=choice] input').nth(0)).toBeChecked()
  await host.locator('[data-key=flag] input').uncheck()
  await host.getByLabel('Two', { exact: true }).check()
  await host.getByText('A', { exact: true }).click()
  await host.getByText('B', { exact: true }).click()
  expect(await page.evaluate(() => [checkedPanel.flag, checkedPanel.choice, [...checkedPanel.list]])).toEqual([false, 2, ['B']])
  for (const values of [{ flag: true, choice: 1, list: ['A'] }, { flag: false, choice: 2, list: [] }, { flag: true, choice: 1, list: ['A'] }]) {
    await page.evaluate(values => Object.assign(checkedPanel, values), values)
    await expect(host.locator('[data-key=flag] input')).toBeChecked({ checked: values.flag })
    await expect(host.locator('[data-key=choice] input').nth(0)).toBeChecked({ checked: values.choice === 1 })
    await expect(host.getByLabel('A', { exact: true })).toBeChecked({ checked: values.list.includes('A') })
    await expect(host.getByLabel('B', { exact: true })).not.toBeChecked()
  }
  await page.evaluate(() => { checkedPanel[Symbol.dispose](); document.querySelector('#checked-review').remove(); delete window.checkedPanel })
})

// base.js owns the structure every theme shares: a label's title text sits out of the flow, hidden
// until its ? is hovered or focused (the ? is in the tab order, described by the text); swatches keep their size and wrap inside the panel; a slider's tooltip
// readout floats centred over the thumb (DevTools prints it inline, as a CSS value; Synth at the end of
// the label line, where its readouts sit); vector fields show their whole value; a radio or checkbox
// list styles its options, never the row's own label.
const ownTooltip = ['devtools', 'synth']
test('every theme hides title text until hover, wraps swatches, floats tooltips, fits vectors and leaves list labels plain', async ({ page }) => {
  await page.goto('/')
  for (const name of themes) {
    const rest = await page.evaluate(async name => {
      const { default: settings } = await import('/index.js')
      const { default: theme } = await import(`/theme/${name}.js`)
      const host = document.createElement('div')
      host.id = 'structure'
      host.style.width = '360px'
      document.body.appendChild(host)
      window.structurePanel = settings({
        help: { type: 'text', value: 'x', title: 'A long explanation that would wrap over several lines' },
        palette: { type: 'color', variant: 'swatches', value: '#ff0000' },
        pick: { type: 'select', variant: 'radio', options: ['A', 'B'], value: 'A' },
        many: { type: 'select', variant: 'checkboxes', multiple: true, options: ['C', 'D'], value: ['C'] },
        tip: { type: 'slider', value: 50, min: 0, max: 100, step: 1, readout: 'tooltip' },
        vec: { type: 'vector', value: [0, 90, 180] },
      }, { container: host, collapsed: false, theme: theme() })
      const tip = host.querySelector('.s-title-text'), bounds = host.querySelector('.s-panel').getBoundingClientRect()
      return {
        position: getComputedStyle(tip).position,
        visible: tip.checkVisibility({ visibilityProperty: true }),
        swatches: [...host.querySelectorAll('.s-swatches button')].filter(b => { const r = b.getBoundingClientRect(); return r.width < 4 || r.right > bounds.right + 1 }).length,
        labels: [...host.querySelectorAll(':is(.s-radio, .s-checkboxes) > .s-label-group')].map(l => getComputedStyle(l, '::before').content),
        tooltip: (([t, i]) => Math.abs(t.left + t.width / 2 - i.left - i.width / 2) <= 4 && t.bottom < i.top + i.height / 2)([host.querySelector('.s-tooltip'), host.querySelector('.s-slider input[type=range]')].map(e => e.getBoundingClientRect())),
        clipped: [...host.querySelectorAll('.s-vector input')].filter(i => i.scrollWidth > i.clientWidth + 1).map(i => i.value),
      }
    }, name)
    expect(rest, name).toEqual({ position: 'absolute', visible: false, swatches: 0, labels: ['none', 'none'], tooltip: !ownTooltip.includes(name), clipped: [] })
    const shown = () => page.evaluate(() => document.querySelector('#structure .s-title-text').checkVisibility({ visibilityProperty: true }))
    await page.locator('#structure .s-title').hover()
    await expect.poll(shown, { message: `${name}: hover` }).toBe(true)
    await page.mouse.move(0, 0)
    await expect.poll(shown, { message: `${name}: unhover` }).toBe(false)
    await page.locator('#structure .s-title').focus()
    await expect.poll(shown, { message: `${name}: keyboard focus` }).toBe(true)
    expect(await page.evaluate(() => { const q = document.querySelector('#structure .s-title'), t = document.getElementById(q.getAttribute('aria-describedby')); return t?.getAttribute('role') === 'tooltip' && t.classList.contains('s-title-text') }), name).toBe(true)
    await page.evaluate(() => { structurePanel[Symbol.dispose](); document.querySelector('#structure').remove() })
  }
})

// Under forced colours (Windows contrast themes) backgrounds, shadows and masks give way to system
// colours, so state must not live in them: native boxes, radios and sliders carry it, and the chosen
// segment takes Highlight.
test('every theme keeps checked, chosen and slider state perceivable under forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/')
  const results = await page.evaluate(async names => {
    const { default: settings } = await import('/index.js')
    const host = document.createElement('div')
    host.style.width = '360px'
    document.body.appendChild(host)
    const results = {}
    for (const name of names) {
      const { default: theme } = await import(`/theme/${name}.js`)
      const panel = settings({
        sw: { type: 'boolean', variant: 'switch', value: true },
        cb: { type: 'boolean', variant: 'checkbox', value: true },
        tg: { type: 'boolean', variant: 'toggle', value: true },
        list: { type: 'select', variant: 'checkboxes', multiple: true, options: ['A', 'B'], value: ['A'] },
        radio: { type: 'select', variant: 'radio', options: ['C', 'D'], value: 'C' },
        seg: { type: 'select', variant: 'segmented', options: ['E', 'F'], value: 'E' },
        sl: { type: 'slider', value: 70, min: 0, max: 100, step: 1 },
      }, { container: host, theme: theme() })
      const shown = e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && e.getBoundingClientRect().width > 2
      const [on, off] = ['.s-selected', 'button:not(.s-selected)'].map(s => getComputedStyle(host.querySelector(`.s-segmented ${s}`)).backgroundColor)
      results[name] = { hidden: [...host.querySelectorAll('input:is([type=checkbox], [type=radio], [type=range])')].filter(e => !shown(e)).length, chosen: on !== off }
      panel[Symbol.dispose]()
    }
    host.remove()
    return results
  }, themes)
  for (const name of themes) expect(results[name], name).toEqual({ hidden: 0, chosen: true })
})

// A vector axis keeps room for its value: in a narrow host the axes wrap rather than clip.
test('every theme keeps vector values whole in a narrow host', async ({ page }) => {
  await page.goto('/')
  const clipped = await page.evaluate(async names => {
    const { default: settings } = await import('/index.js')
    const host = document.createElement('div')
    host.style.width = '288px'
    document.body.appendChild(host)
    const clipped = {}
    for (const name of names) {
      const { default: theme } = await import(`/theme/${name}.js`)
      const panel = settings({ vec: { type: 'vector', value: [0, 90, 180] } }, { container: host, collapsed: false, theme: theme() })
      const bounds = host.querySelector('.s-panel').getBoundingClientRect()
      clipped[name] = [...host.querySelectorAll('.s-vector input')].filter(i => i.scrollWidth > i.clientWidth + 1 || i.getBoundingClientRect().right > bounds.right + 1).map(i => i.value)
      panel[Symbol.dispose]()
    }
    host.remove()
    return clipped
  }, themes)
  expect(clipped).toEqual(Object.fromEntries(themes.map(name => [name, []])))
})

// A slider readout keeps its theme's width for a short value and widens for a long one: an input
// shows its whole value, a read-only readout keeps it on one line.
test('a long slider readout shows its whole value in every theme', async ({ page }) => {
  await page.goto('/')
  const whole = await page.evaluate(async names => {
    const { default: settings } = await import('/index.js')
    const host = document.createElement('div')
    host.style.width = '288px'
    document.body.appendChild(host)
    const fits = e => {
      if (e.scrollWidth > e.clientWidth + 1) return false
      if (e.tagName === 'INPUT') return true
      const text = document.createRange()
      text.selectNodeContents(e)
      return new Set([...text.getClientRects()].map(r => Math.round(r.top))).size === 1 && text.getBoundingClientRect().right <= e.getBoundingClientRect().right + 1
    }
    const whole = {}
    for (const name of names) {
      const { default: theme } = await import(`/theme/${name}.js`)
      const hz = { type: 'slider', value: 440, min: 20, max: 20000, scale: 'log', unit: ' Hz' }
      const panel = settings({ input: hz, text: { ...hz, readout: 'readonly' }, volume: .75 }, { container: host, collapsed: false, theme: theme() })
      whole[name] = Object.fromEntries(['input', 'text', 'volume'].map(key => [key, fits(host.querySelector(`[data-key=${key}] .s-readout`))]))
      panel[Symbol.dispose]()
    }
    host.remove()
    return whole
  }, themes)
  expect(whole).toEqual(Object.fromEntries(themes.map(name => [name, { input: true, text: true, volume: true }])))
})

// Lab01 draws a checked box's core in the switch's on fill, so the checked state reads at 3:1
// against an unchecked box (WCAG 1.4.11) in each of the source's three materials.
test('lab01 on-states read in dark, light and gold: checked boxes and radios at 3:1, the toggle\'s On at 4.5:1', async ({ page }) => {
  await page.goto('/')
  const centre = async locator => page.evaluate(async png => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob())
    const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d')
    g.drawImage(img, 0, 0)
    return '#' + [...g.getImageData(img.width >> 1, img.height >> 1, 1, 1).data.slice(0, 3)].map(v => v.toString(16).padStart(2, '0')).join('')
  }, (await locator.screenshot()).toString('base64'))
  // the lightest and darkest pixels of a toggle: its lettering against its fill
  const extremes = async locator => page.evaluate(async png => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob())
    const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d')
    g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, img.width, img.height).data, hex = i => '#' + [...d.slice(i, i + 3)].map(v => v.toString(16).padStart(2, '0')).join('')
    let lo = 0, hi = 0
    for (let i = 0; i < d.length; i += 4) { const l = d[i] + d[i + 1] + d[i + 2]; if (l < d[lo] + d[lo + 1] + d[lo + 2]) lo = i; if (l > d[hi] + d[hi + 1] + d[hi + 2]) hi = i }
    return [hex(lo), hex(hi)]
  }, (await locator.screenshot()).toString('base64'))
  for (const shade of ['#111111', '#b4b4b4', '#ba965a']) {
    await page.evaluate(async shade => {
      const { default: settings } = await import('/index.js')
      const { default: lab01 } = await import('/theme/lab01.js')
      document.querySelector('#lab01-checks')?.remove()
      const host = document.createElement('div')
      host.id = 'lab01-checks'
      host.style.cssText = `width: 360px; background: ${shade}`
      document.body.prepend(host)
      settings({
        on: { type: 'boolean', variant: 'checkbox', value: true },
        off: { type: 'boolean', variant: 'checkbox', value: false },
        list: { type: 'select', variant: 'checkboxes', multiple: true, options: ['A', 'B'], value: ['A'] },
        radio: { type: 'select', variant: 'radio', options: ['C', 'D'], value: 'C' },
        tg: { type: 'boolean', variant: 'toggle', value: true },
      }, { container: host, collapsed: false, theme: lab01({ shade }) })
    }, shade)
    const host = page.locator('#lab01-checks'), list = host.locator('.s-checkboxes .s-track')
    expect(contrast(await centre(list.nth(0)), await centre(list.nth(1))), `${shade}: list`).toBeGreaterThanOrEqual(3)
    expect(contrast(await centre(host.locator('[data-key=on] .s-track')), await centre(host.locator('[data-key=off] .s-track'))), `${shade}: checkbox`).toBeGreaterThanOrEqual(3)
    const radios = host.locator('.s-radio input')
    expect(contrast(await centre(radios.nth(0)), await centre(radios.nth(1))), `${shade}: radio`).toBeGreaterThanOrEqual(3)
    expect(contrast(...await extremes(host.locator('[data-key=tg] .s-track'))), `${shade}: toggle On`).toBeGreaterThanOrEqual(4.5)
  }
})

// Text reads at WCAG 1.4.3 contrast (4.5:1, large text 3:1) in every theme at its native defaults, as
// axe-core measures it. A replica keeps its original's look, not its defects: where the original's ink
// fails, the theme moves it to the minimum. Disabled controls are exempt; axe leaves text over images
// and gradients undecided, so those are not counted.
test('every theme\'s text meets WCAG contrast at its native defaults', async ({ page }) => {
  await page.goto('/')
  await page.addScriptTag({ path: fileURLToPath(new URL('../node_modules/axe-core/axe.min.js', import.meta.url)) })
  // a transparent theme (Swiss) inks for the host ground the gallery gives it
  const grounds = Object.fromEntries(registry.filter(t => t.ground).map(t => [t.file || t.id, t.ground]))
  const results = await page.evaluate(async ([names, grounds]) => {
    const { default: settings } = await import('/index.js')
    const results = {}
    for (const name of names) {
      const { default: theme } = await import(`/theme/${name}.js`)
      const host = document.createElement('div')
      host.style.width = '360px'
      host.style.background = grounds[name] || ''
      document.body.appendChild(host)
      const noop = () => {}
      const panel = settings({
        name: { type: 'text', value: 'Aurora', hint: 'A hint under its label' },
        count: 7,
        volume: { type: 'slider', value: .75, min: 0, max: 1, step: .01 },
        freq: { type: 'slider', value: 440, min: 20, max: 20000, scale: 'log', unit: ' Hz' },
        temp: { type: 'slider', value: 50, min: 0, max: 100, step: 1, marks: { 0: 'Cold', 50: 'Warm', 100: 'Boil' } },
        level: { type: 'slider', value: 66, min: 0, max: 100, step: 1, readout: 'readonly' },
        mode: { type: 'select', variant: 'segmented', options: ['Light', 'Dark', 'Auto'], value: 'Auto' },
        blend: ['Screen', 'Multiply'],
        pick: { type: 'select', variant: 'radio', options: ['A', 'B'], value: 'A' },
        many: { type: 'select', variant: 'checkboxes', multiple: true, options: ['C', 'D'], value: ['C'] },
        tint: '#4488cc',
        enabled: { type: 'boolean', variant: 'switch', value: true },
        toggle: { type: 'boolean', variant: 'toggle', value: true },
        rule: { type: 'separator', label: 'Section' },
        more: { type: 'folder', label: 'Folder' },
        'more.depth': 3,
        actions: { type: 'button', variant: 'group', buttons: { Save: noop, Reset: { variant: 'secondary', onclick: noop } } },
        run: { type: 'button', text: 'Run', label: false },
      }, { container: host, title: 'Contrast', collapsed: false, theme: theme() })
      const { violations } = await axe.run(host, { runOnly: ['color-contrast'] })
      results[name] = violations.flatMap(v => v.nodes.map(n => `${n.target.join(' ')} ${n.any[0]?.data?.contrastRatio}:1`))
      panel[Symbol.dispose]()
      host.remove()
    }
    return results
  }, [themes, grounds])
  for (const name of themes) expect(results[name], name).toEqual([])
})

// Placeholder text reads at 4.5:1 too (WCAG 1.4.3), which axe does not check: measured from pixels at
// 2x, a field with its placeholder against the same field without it, the field's most common pixel as
// the ground and the glyph pixel most unlike it as the ink. Glass is a pane over a scene: on a white page
// no light ink reaches 4.5:1 on its lens (white gives 4.4:1), so it is measured over its own colour.
const pane = ['glass']
test('every theme\'s placeholder meets WCAG contrast at its native defaults', async ({ browser }) => {
  const page = await browser.newPage({ deviceScaleFactor: 2 })
  await page.goto('/')
  const grounds = Object.fromEntries(registry.filter(t => t.ground).map(t => [t.file || t.id, t.ground]))
  const failures = {}
  for (const name of themes) {
    await page.evaluate(async ([name, ground, own]) => {
      const { default: settings } = await import('/index.js')
      const { default: theme } = await import(`/theme/${name}.js`)
      window.placeholderPanel?.[Symbol.dispose]()
      document.querySelector('#placeholder')?.remove()
      const host = document.createElement('div')
      host.id = 'placeholder'
      host.style.cssText = `width: 360px; background: ${ground || ''}`
      document.body.prepend(host)
      window.placeholderPanel = settings({ q: { type: 'text', value: '', placeholder: 'Search…' } }, { container: host, title: 'Contrast', collapsed: false, theme: theme() })
      if (own) host.style.background = getComputedStyle(host.querySelector('.s-panel')).getPropertyValue('--bg')
    }, [name, grounds[name], pane.includes(name)])
    const field = page.locator('#placeholder input[type=text]')
    const shown = await field.screenshot()
    await field.evaluate(e => { e.placeholder = '' })
    const bare = await field.screenshot()
    const [ink, bg] = await page.evaluate(async pngs => {
      const { contrast } = await import('/theme/color.js')
      const [a, b] = await Promise.all(pngs.map(async png => {
        const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob())
        const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d')
        g.drawImage(img, 0, 0)
        return g.getImageData(0, 0, img.width, img.height).data
      }))
      const hex = (d, i) => '#' + [...d.slice(i, i + 3)].map(v => v.toString(16).padStart(2, '0')).join('')
      const counts = {}
      for (let i = 0; i < b.length; i += 4) counts[hex(b, i)] = (counts[hex(b, i)] || 0) + 1
      const bg = Object.keys(counts).reduce((x, y) => counts[y] > counts[x] ? y : x)
      let ink = bg
      for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) if (contrast(hex(a, i), bg) > contrast(ink, bg)) ink = hex(a, i)
      return [ink, bg]
    }, [shown, bare].map(png => png.toString('base64')))
    if (contrast(ink, bg) < 4.5) failures[name] = `${ink} on ${bg} ${contrast(ink, bg).toFixed(2)}:1`
  }
  await page.close()
  expect(failures).toEqual({})
})

// A panel without a title is a plain block, never a collapsed one: rules for the folded state belong to
// the titled panel (details:not([open])), so both wear the same surface.
test('every theme paints an untitled panel like an open titled one', async ({ page }) => {
  await page.goto('/')
  const results = await page.evaluate(async names => {
    const { default: settings } = await import('/index.js')
    const surface = el => { const s = getComputedStyle(el); return [s.backgroundColor, s.backgroundImage].join(' ') }
    const results = {}
    for (const name of names) {
      const { default: theme } = await import(`/theme/${name}.js`)
      const [plain, titled] = [undefined, 'Title'].map(title => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const panel = settings({ x: 1 }, { container: host, title, collapsed: false, theme: theme() })
        const s = surface(host.querySelector('.s-panel'))
        panel[Symbol.dispose]()
        host.remove()
        return s
      })
      results[name] = plain === titled
    }
    return results
  }, themes)
  for (const name of themes) expect(results[name], name).toBe(true)
})
