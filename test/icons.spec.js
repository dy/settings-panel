import { test, expect } from '@playwright/test'
import { themes } from '../demo/themes.js'

// Every glyph a control relies on is drawn, and big enough to read, in every theme: a folder's chevron, a dropdown's
// arrow, a number's steppers (where the theme shows them), a vector's pad toggle, a label's ? and a button's icon.
// Each is shot as drawn and with the glyph hidden; the pixels that change are the glyph, and they must span at
// least 6px each way (2x shots, so 12 device pixels).
const MIN = 6

// What a glyph is, where it sits and how to hide it (the CSS hides only the glyph, never the text beside it)
const glyphs = [
  { name: 'folder chevron', at: '.s-folder:not(.s-section) > summary', hide: '.s-folder > summary::before, .s-folder > summary::after, .s-folder > summary > * { visibility: hidden !important } .s-folder > summary { background-image: none !important }' },
  { name: 'dropdown arrow', at: '[data-key=category] .s-input', hide: '[data-key=category] .s-input::before, [data-key=category] .s-input::after { visibility: hidden !important } [data-key=category] select { background-image: none !important }' },
  { name: 'steppers', at: '[data-key=quantity] .s-step', hide: '[data-key=quantity] .s-step, [data-key=quantity] .s-step * { visibility: hidden !important }', optional: true },
  { name: 'pad toggle', at: '[data-key=anchor] .s-vec-expand', hide: '[data-key=anchor] .s-vec-expand { visibility: hidden !important }', optional: true },
  { name: 'title mark', at: '[data-key=titled] .s-title', hide: '[data-key=titled] .s-title { visibility: hidden !important }' },
  { name: 'button icon', at: '[data-key=icons] .s-icon', hide: '[data-key=icons] .s-icon { visibility: hidden !important }' },
]
// glyphs a theme leaves out by design: JSON draws a folder as "key": { and a value as a literal; DevTools sets a
// keyword value as plain text, as the Styles pane does
const without = { json: ['folder chevron', 'dropdown arrow', 'pad toggle', 'title mark', 'button icon'], devtools: ['dropdown arrow'] }

for (const { id } of themes) test(`icons: ${id} draws every glyph its controls use`, async ({ browser }) => {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 600, height: 900 } })
  await page.goto('/demo/controls')
  await page.locator('#theme-picker').selectOption(id)
  await page.locator('#open-all').click()
  await page.waitForTimeout(600)   // the folders' opening transition settles
  // the whole panel in view: nothing scrolls, so a box is where the shot is taken
  await page.setViewportSize({ width: 600, height: Math.ceil(await page.evaluate(() => document.documentElement.scrollHeight)) + 40 })
  await page.evaluate(() => scrollTo(0, 0))
  const rest = async () => page.mouse.move(599, (await page.viewportSize()).height - 1)
  await rest()
  const missing = []
  for (const g of glyphs) {
    if ((without[id] || []).includes(g.name)) continue
    const el = page.locator(g.at).first()
    if (!await el.count() || !await el.isVisible()) { if (!g.optional) missing.push(`${g.name}: not shown`); continue }
    // a glyph shown only under the pointer (Editorial's steppers, Figma's fold chevron) is checked under it; the rest at rest
    if (g.name === 'steppers' || g.name === 'folder chevron') { await el.hover({ force: true }); await page.waitForTimeout(200) } else await rest()
    const box = await el.boundingBox(), pad = 20   /* a glyph may stand just outside its box (DevTools' gutter triangle) */
    const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + 2 * pad, height: box.height + 2 * pad }
    const shown = await page.screenshot({ clip })
    const style = await page.addStyleTag({ content: g.hide })
    const hidden = await page.screenshot({ clip })
    await style.evaluate(s => s.remove())
    const span = await page.evaluate(async ([a, b]) => {
      const load = async b64 => { const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, img.width, img.height) }
      const [x, y] = await Promise.all([load(a), load(b)])
      let l = Infinity, t = Infinity, r = -1, bm = -1
      for (let i = 0; i < x.data.length; i += 4) {
        if (Math.abs(x.data[i] - y.data[i]) + Math.abs(x.data[i + 1] - y.data[i + 1]) + Math.abs(x.data[i + 2] - y.data[i + 2]) < 24) continue
        const p = i / 4, px = p % x.width, py = Math.floor(p / x.width)
        l = Math.min(l, px); r = Math.max(r, px); t = Math.min(t, py); bm = Math.max(bm, py)
      }
      return r < 0 ? [0, 0] : [(r - l + 1) / 2, (bm - t + 1) / 2]
    }, [shown.toString('base64'), hidden.toString('base64')])
    if (!span[0]) missing.push(`${g.name}: not drawn`)
    else if (span[0] < MIN && span[1] < MIN) missing.push(`${g.name}: ${span[0]}×${span[1]}px`)
  }
  await page.close()
  expect(missing, id).toEqual([])
})
