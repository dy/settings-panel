import { test, expect } from '@playwright/test'
import { themes as registry } from '../demo/themes.js'

// Design consistency at size 1, one theme at a time: each text role has one size, boxed controls one
// height, every slider one thumb, a painted row insets its buttons evenly, slider marks stay in their row.
// Exceptions are the ones each theme's reference prescribes (docs/themes.md names them).
const files = registry.map(t => [t.id, t.file || t.id])

// roles whose size differs from body by design, per theme
const typeExceptions = {
  swiss: ['label', 'folder', 'button'],           // DM Sans caps labels and section heads, display-size actions
  bitmap: ['select', 'segment', 'button', 'folder'], // Chicago 12 controls and headings over Geneva 9 text
  industrial: ['select', 'segment', 'button'],     // keys lettered in system-ui over printed Courier labels
  synth: ['folder'],                               // card titles at 1.4em
  controlkit: ['button', 'folder'],                // chrome buttons 10px caps, group titles 12px
  devtools: ['segment', 'button'],                 // Chrome's 12px action pills
  editorial: ['button'],                           // actions in the reference's small tracked capitals
}
// painted button rows whose side inset follows another grid by design
const sideInsetExceptions = { controlkit: 'the label grid sets the side inset' }
// sliders whose fill is the value, without a thumb to match
const fillSliders = ['oui', 'dialkit']
// themes whose colour alpha slider keeps its own thumb by design
const alphaExceptions = { studio: 'the row is the slider, its handle a hairline at the fill edge; the alpha keeps a knob over its ramp' }
// themes whose boxed controls keep more than one height by design
const boxExceptions = { studio: 'boxes nest inside its 36px rows', apple: 'borderless fields', devtools: 'inline declarations', oui: "native's 25px buttons", bitmap: "System 7's control heights", synth: "the original's 25.5px chips", swiss: 'typographic rows', editorial: 'reader rows' }

const mount = (page, file, schema) => page.evaluate(async ([file, schema]) => {
  const { default: settings } = await import('/index.js')
  const { default: theme } = await import(`/theme/${file}.js`)
  document.querySelector('#consistency')?.remove()
  window.consistencyPanel?.[Symbol.dispose]?.()
  const host = document.createElement('div')
  host.id = 'consistency'
  host.style.cssText = 'width: 360px; position: absolute; left: 0; top: 0; z-index: 9'
  document.body.prepend(host)
  const noop = () => {}
  for (const v of Object.values(schema)) if (v.buttons) for (const k in v.buttons) v.buttons[k] = typeof v.buttons[k] === 'object' ? { ...v.buttons[k], onclick: noop } : noop
  window.consistencyPanel = settings(schema, { container: host, title: 'Layer', collapsed: false, theme: theme() })
}, [file, schema])

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important }' })
})

// themes find a slider's end ticks and labels by class, never by matching the inline style
// (happy-dom skips the first :each item's class binding, so this one runs in the browser)
test('a slider marks its end ticks and labels s-first / s-last', async ({ page }) => {
  const classes = await page.evaluate(async () => {
    const { signal } = await import('/signals.js')
    const { default: slider } = await import('/control/slider.js')
    const ctrl = slider(signal(.5), { min: 0, max: 1, step: .5, marks: { 0: 'Low', .5: 'Mid', 1: 'High' }, container: document.body })
    const ends = sel => [...ctrl.el.querySelectorAll(sel)].map(e => [e.classList.contains('s-first'), e.classList.contains('s-last')])
    const out = [ends('.s-mark-label'), ends('.s-mark')]
    ctrl[Symbol.dispose]()
    return out
  })
  for (const ends of classes) expect(ends).toEqual([[true, false], [false, false], [false, true]])
})

// dragging a slider's number drags the slider: the same value per pixel as the track, so the fill (or
// thumb) follows the pointer whichever part is grabbed; a click without movement still edits the number
for (const file of ['studio', 'default']) test(`${file}: dragging the slider's number moves it as dragging the slider does`, async ({ page }) => {
  await mount(page, file, { level: { type: 'slider', value: 20, min: 0, max: 100, step: 1 } })
  const drag = async (sel, from, dx) => {
    const box = await page.locator(`#consistency [data-key=level] ${sel}`).boundingBox()
    const x = from(box), y = box.y + box.height / 2
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx / 2, y, { steps: 4 }); await page.mouse.move(x + dx, y, { steps: 4 }); await page.mouse.up()
    return page.evaluate(() => consistencyPanel.level)
  }
  // the thumb sits at 20% of the track; grab it there
  const track = await drag('input[type=range]', b => b.x + b.width * .2, 60)
  await page.evaluate(() => { consistencyPanel.level = 20 })
  await page.waitForTimeout(50)
  const number = await drag('.s-readout', b => b.x + b.width / 2, 60)
  expect(number - 20, `${file}: number moved ${number - 20}, track ${track - 20}`).toBeGreaterThan(0)
  expect(Math.abs((number - 20) - (track - 20)), `${file}: number moved ${number - 20}, track ${track - 20}`).toBeLessThanOrEqual(Math.max(2, (track - 20) * .15))
  // a press without movement still opens the number for typing
  await page.locator('#consistency [data-key=level] .s-readout').click()
  await expect(page.locator('#consistency [data-key=level] .s-readout')).toBeFocused()
})

// a scrubbing number keeps the convention: 1px = 1 step (shift ×10), whatever slider readouts do
test('dragging a number steps it one step per pixel', async ({ page }) => {
  await mount(page, 'default', { count: { type: 'number', value: 7, step: 1, scrub: true } })
  const input = page.locator('#consistency [data-key=count] input')
  const box = await input.boundingBox(), y = box.y + box.height / 2
  await page.mouse.move(box.x + 10, y); await page.mouse.down(); await page.mouse.move(box.x + 22, y, { steps: 4 }); await page.mouse.up()
  expect(await page.evaluate(() => consistencyPanel.count)).toBe(19)
  await page.keyboard.down('Shift'); await page.mouse.move(box.x + 10, y); await page.mouse.down(); await page.mouse.move(box.x + 5, y, { steps: 4 }); await page.mouse.up(); await page.keyboard.up('Shift')
  expect(await page.evaluate(() => consistencyPanel.count)).toBe(-31)
})

for (const [id, file] of files) test.describe(id, () => {
  test('type roles and boxes', async ({ page }) => {
    await mount(page, file, {
      name: { type: 'text', value: 'Aurora', hint: 'Hint text' }, blend: ['Screen', 'Multiply'],
      mode: { type: 'select', variant: 'segmented', options: ['Draft', 'Fine'], value: 'Fine' }, count: 7,
      tint: { type: 'color', value: '#8b80f9' }, folder: { type: 'folder', label: 'Folder' }, 'folder.x': 1,
      run: { type: 'button', text: 'Apply', label: false },
    })
    const m = await page.evaluate(() => {
      const q = s => document.querySelector(`#consistency ${s}`)
      const fs = s => q(s) && Math.round(parseFloat(getComputedStyle(q(s)).fontSize) * 10) / 10
      const h = s => q(s) && Math.round(q(s).getBoundingClientRect().height)
      return {
        type: { label: fs('[data-key=name] .s-label'), field: fs('[data-key=name] input'), select: fs('[data-key=blend] select'), segment: fs('[data-key=mode] button'), button: fs('[data-key=run] button'), number: fs('[data-key=count] input'), hex: fs('[data-key=tint] input[type=text]'), folder: fs('.s-folder > summary') },
        box: { field: h('[data-key=name] input'), select: h('[data-key=blend] select'), button: h('[data-key=run] button'), number: h('[data-key=count] input') },
      }
    })
    const skip = typeExceptions[id] || [], body = m.type.field
    for (const [role, size] of Object.entries(m.type)) if (size && !skip.includes(role)) expect(size, `${id} ${role} at the body size`).toBeCloseTo(body, 0)
    if (!boxExceptions[id]) {
      const heights = Object.values(m.box).filter(Boolean)
      expect(Math.max(...heights) - Math.min(...heights), `${id} boxes ${JSON.stringify(m.box)}`).toBeLessThanOrEqual(1)
    }
  })

  test('the alpha slider wears the slider\'s thumb', async ({ page }) => {
    test.skip(!!alphaExceptions[id], alphaExceptions[id])
    await mount(page, file, { a: { type: 'slider', value: 50, min: 0, max: 100, readout: false }, b: { type: 'color', variant: 'rgba', value: '#8b80f980' } })
    // the thumb painted two flat colours in turn: the pixels that differ are exactly its drawn shape,
    // whatever lies behind it (a white thumb on a white track would otherwise vanish)
    const thumb = async sel => {
      const el = page.locator(`#consistency ${sel}`), box = await el.boundingBox(), pad = 16
      const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + 2 * pad, height: box.height + 2 * pad }
      const paint = c => page.addStyleTag({ content: `#consistency input[type=range]::-webkit-slider-thumb { background: ${c} !important; border-color: ${c} !important; box-shadow: none !important; outline: none !important; filter: none !important }` })
      const shots = []
      for (const c of ['#ff00ff', '#00ffff']) { const style = await paint(c); shots.push(await page.screenshot({ clip })); await style.evaluate(s => s.remove()) }
      return page.evaluate(async ([a, b]) => {
        const read = async png => { const i = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob()), c = new OffscreenCanvas(i.width, i.height), g = c.getContext('2d'); g.drawImage(i, 0, 0); return [g.getImageData(0, 0, i.width, i.height), i.width] }
        const [[da, w], [db]] = [await read(a), await read(b)]
        let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1
        for (let i = 0; i < da.data.length; i += 4) if (Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]) > 96) {
          const x = (i / 4) % w, y = Math.floor(i / 4 / w); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
        }
        return x1 < 0 ? null : [x1 - x0 + 1, y1 - y0 + 1]
      }, shots.map(s => s.toString('base64')))
    }
    const [plain, alpha] = [await thumb('[data-key=a] input[type=range]'), await thumb('[data-key=b] .s-alpha')]
    // a thumbless slider (the fill is the value; OUI draws its fill with a stretched thumb) may mark the
    // alpha's value with a narrow handle
    if (!plain || fillSliders.includes(id)) return expect(!alpha || alpha[0] <= 3, `${id}: a thumbless slider, so at most a handle on the alpha (${alpha})`).toBe(true)
    expect(alpha, `${id}: the alpha slider draws a thumb`).not.toBeNull()
    expect(Math.abs(alpha[0] - plain[0]), `${id} thumb width ${plain[0]} vs alpha ${alpha[0]}`).toBeLessThanOrEqual(2)
    expect(Math.abs(alpha[1] - plain[1]), `${id} thumb height ${plain[1]} vs alpha ${alpha[1]}`).toBeLessThanOrEqual(2)
  })

  test('a painted button row insets its buttons evenly; marks stay in their row', async ({ page }) => {
    await mount(page, file, {
      temp: { type: 'slider', value: 50, min: 0, max: 100, step: 1, marks: { 0: 'Cold', 50: 'Warm', 100: 'Boil' } }, next: 'Next row',
      pair: { type: 'button', variant: 'group', label: false, buttons: { Reset: { variant: 'secondary' }, Apply: null } },
    })
    const m = await page.evaluate(() => {
      const q = s => document.querySelector(`#consistency ${s}`)
      const row = q('[data-key=pair]'), b = q('[data-key=pair] button'), r = row.getBoundingClientRect(), br = b.getBoundingClientRect(), cs = getComputedStyle(row)
      const painted = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none'
      const marks = [...document.querySelectorAll('#consistency [data-key=temp] .s-mark-label')].filter(l => l.checkVisibility()).map(l => l.getBoundingClientRect().bottom)
      const last = [...row.querySelectorAll('button')].at(-1).getBoundingClientRect()
      return { painted, top: br.top - r.top, bottom: r.bottom - br.bottom, side: Math.min(br.left - r.left, r.right - last.right), marks: marks.length ? Math.max(...marks) : null, next: q('[data-key=next]').getBoundingClientRect().top }
    })
    if (m.painted) {
      expect(Math.abs(m.top - m.bottom), `${id} button row inset top ${m.top} vs bottom ${m.bottom}`).toBeLessThanOrEqual(1.5)
      if (!sideInsetExceptions[id]) expect(Math.abs(m.side - m.top), `${id} button row inset near side ${m.side} vs top ${m.top}`).toBeLessThanOrEqual(1.5)
    }
    if (m.marks != null) expect(m.marks, `${id} mark labels end above the next row`).toBeLessThanOrEqual(m.next + .5)
  })
})
