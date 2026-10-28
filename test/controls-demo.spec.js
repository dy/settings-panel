import { test, expect } from '@playwright/test'
import { themes } from '../demo/themes.js'

// The controls page shows every control, variant and field option. In every theme, with every folder open, nothing
// a control draws reaches past the panel's edges (floating tooltips and title texts excepted), no two rows overlap,
// a text area or an info shows all its lines, and labelled marks never print over each other.
for (const { id } of themes) test(`controls page: ${id} keeps every control inside the panel`, async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 470, height: 900 } })
  await page.goto('/demo/controls')
  await page.locator('#theme-picker').selectOption(id)
  await page.locator('#open-all').click()
  await page.waitForTimeout(600)
  const bad = await page.evaluate(id => {
    const panel = document.querySelector('.s-panel'), P = panel.getBoundingClientRect(), out = []
    for (const e of panel.querySelectorAll('*')) {
      if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) || e.closest('.s-title-text, .s-tooltip, option, datalist, .s-scrub-trail')) continue
      // lil-gui (dat) keeps a name on one line and lets a long one push its widget out, clipped by the panel
      if (id === 'dat' && e.closest('[data-key=longLabel]')) continue
      const r = e.getBoundingClientRect()
      if (r.width && (r.right > P.right + 1 || r.left < P.left - 1)) out.push(`${e.closest('[data-key]')?.dataset.key}: ${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} past the panel by ${Math.round(Math.max(r.right - P.right, P.left - r.left))}px`)
    }
    for (const box of panel.querySelectorAll('.s-panel-content, .s-content')) {
      const rows = [...box.children].filter(e => e.checkVisibility())
      for (let i = 1; i < rows.length; i++) if (rows[i].getBoundingClientRect().top < rows[i - 1].getBoundingClientRect().bottom - 1) out.push(`${rows[i].dataset.key}: overlaps ${rows[i - 1].dataset.key}`)
    }
    // a text area, and an info's value, shows all its lines
    for (const t of panel.querySelectorAll('textarea, .s-monitor')) if (t.checkVisibility() && getComputedStyle(t).overflowY !== 'visible' && t.scrollHeight > t.clientHeight + 1) out.push(`${t.closest('[data-key]').dataset.key}: hides ${t.scrollHeight - t.clientHeight}px of its text`)
    // labelled marks never print over each other: one with no room is left out
    const marks = [...panel.querySelectorAll('[data-key=temperature] .s-mark-label')].filter(e => e.checkVisibility({ visibilityProperty: true })).map(e => e.getBoundingClientRect()).sort((a, b) => a.left - b.left)
    for (let i = 1; i < marks.length; i++) if (marks[i].left < marks[i - 1].right - .5) out.push(`temperature: mark labels ${i - 1} and ${i} overlap`)
    return [...new Set(out)].slice(0, 12)
  }, id)
  await page.close()
  expect(bad, id).toEqual([])
})

// A range takes a press anywhere on its track, in every theme: the nearer thumb comes to it
for (const { id } of themes) test(`controls page: ${id} range moves its nearer thumb to a press`, async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 470, height: 900 } })
  await page.goto('/demo/controls')
  await page.locator('#theme-picker').selectOption(id)
  await page.locator('.s-folder[data-key=sl] > summary').click()
  await page.waitForTimeout(600)   // the folder's opening transition settles
  const track = page.locator('[data-key=tempRange] .s-interval-track')
  test.skip(!await track.locator('input').first().isVisible(), `${id} draws its range without a track`)
  await track.evaluate(e => e.scrollIntoView({ block: 'center' }))   // clear of the sticky theme bar
  const b = await track.boundingBox()
  const vals = () => page.evaluate(() => [...document.querySelectorAll('[data-key=tempRange] .s-interval-track input')].map(e => +e.value))
  const y = b.y + b.height / 2, [lo0, hi0] = await vals()
  // far up the track, short of anything laid over its end (Studio's values, Swiss's high value)
  for (const f of [.9, .85, .8, .75, .7]) {
    await page.mouse.move(b.x + b.width * f, y)
    if (await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.matches('.s-interval-track input'), [b.x + b.width * f, y])) break
  }
  await page.mouse.down(); await page.mouse.up()
  const [lo1, hi1] = await vals()
  expect([lo1, hi1 > hi0 + 5], id).toEqual([lo0, true])
  // and near its start, short of anything laid over it (Swiss's low value)
  for (const f of [.08, .14, .2]) {
    await page.mouse.move(b.x + b.width * f, y)
    if (await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.matches('.s-interval-track input'), [b.x + b.width * f, y])) break
  }
  await page.mouse.down(); await page.mouse.up()
  const [lo2, hi2] = await vals()
  expect([lo2 < lo0 - 10, hi2], id).toEqual([true, hi1])
  await page.close()
})

// Like controls look alike within a theme: a swatch is square, the vector's and the curve's pads are the XY pad (one size, one place),
// and dials stand in one column whatever their values read. A terminal's swatch is two character cells; DevTools sets
// each value right after its name, as the Styles pane does, so a pad or a dial stands where its name ends. A labelled
// separator is text between two rules, not the plain rule's paint, but in dat, whose labelled separator is a band, and
// ControlKit, where every row is a band. DialKit draws a curve on its easing editor's own graph, at 256:180.
const ragged = { terminal: ['swatch'], devtools: ['place'], dat: ['band'], controlkit: ['band'], dialkit: ['curve'] }
for (const { id } of themes) test(`controls page: ${id} draws like controls alike`, async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 470, height: 900 } })
  await page.goto('/demo/controls')
  await page.locator('#theme-picker').selectOption(id)
  await page.locator('#open-all').click()
  await page.waitForTimeout(600)
  const bad = await page.evaluate(skip => {
    const out = [], box = s => { const e = document.querySelector(s); return e?.checkVisibility() ? e.getBoundingClientRect() : null }
    if (!skip.includes('swatch')) for (const b of document.querySelectorAll('.s-swatches button')) { const r = b.getBoundingClientRect(); if (Math.abs(r.width - r.height) > 1) out.push(`swatch ${Math.round(r.width)}×${Math.round(r.height)}`) }
    const xy = box('[data-key=pad] .s-pad')
    for (const [name, at] of [['vector pad', 'anchor'], ...skip.includes('curve') ? [] : [['curve pad', 'easing']]]) {
      const p = box(`[data-key=${at}] .s-pad`)
      if (p && xy && [p.width - xy.width, p.height - xy.height, skip.includes('place') ? 0 : p.left - xy.left].some(d => Math.abs(d) > 1))
        out.push(`${name} ${Math.round(p.width)}×${Math.round(p.height)} at ${Math.round(p.left)}, XY pad ${Math.round(xy.width)}×${Math.round(xy.height)} at ${Math.round(xy.left)}`)
    }
    // a dial turns, so its centre, not its box, marks where it stands
    const [a, b] = ['knob', 'freq'].map(k => box(`[data-key=${k}] .s-knob-dial`)).map(r => r && r.left + r.width / 2)
    if (a && b && !skip.includes('place') && Math.abs(a - b) > 1) out.push(`dials at ${Math.round(a)} and ${Math.round(b)}`)
    const sep = document.querySelector('.s-separator-labeled'), bg = sep && getComputedStyle(sep).backgroundColor
    if (bg && !skip.includes('band') && !/^rgba\(.*, 0\)$|transparent/.test(bg)) out.push(`labelled separator painted ${bg}`)
    return [...new Set(out)]
  }, ragged[id] || [])
  // a dial stays where it stands as its value grows longer (440 Hz → 1040 Hz)
  const wrap = page.locator('[data-key=freq] .s-knob-wrap')
  if (await wrap.isVisible() && !ragged[id]?.includes('place')) {
    const centre = () => page.locator('[data-key=freq] .s-knob-dial').evaluate(e => { const r = e.getBoundingClientRect(); return Math.round(r.left + r.width / 2) })
    const before = await centre()
    await wrap.focus()
    for (let i = 0; i < 60; i++) await page.keyboard.press('Shift+ArrowUp')
    bad.push(...(await centre() !== before ? [`dial moved from ${before} to ${await centre()} as its value grew`] : []))
  }
  await page.close()
  expect(bad, id).toEqual([])
})
