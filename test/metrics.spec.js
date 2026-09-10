import { test, expect } from '@playwright/test'

const themes = ['default', 'skeu', 'glass', 'neu', 'porcelain', 'brutal', 'lab01', 'swiss', 'terminal', 'control-panel', 'dat', 'tweakpane', 'leva', 'controlkit', 'uil', 'oui', 'figma', 'apple', 'devtools']

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
    await page.locator('#colormap-select').selectOption('chalk')
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
    await page.locator('#colormap-select').selectOption(map)
    await expect(live).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(live.locator('[data-key=name] input')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(live).toHaveCSS('color', map === 'chalk' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)')
    await expect(live.locator('[data-key=name]')).toHaveCSS('border-top-width', '1px')
  }
  await live.locator('[data-key=name] input').fill('On the backdrop')
  await page.locator('#colormap-select').selectOption('graphite')
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
