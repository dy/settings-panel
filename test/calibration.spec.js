import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { differing } from './calibration/compare.js'
import { materials, profile, zones } from './calibration/profile.js'

// Calibration: our themes against the originals they reproduce, not against our own last render.
// Snapshots can be regenerated to bless any change; these references are the original libraries'
// renders (test/calibration/*.png, captured by capture.mjs from the originals, never from ours),
// and each case may differ from its original by at most its budget in manifest.json. Lowering a
// budget records an improvement; raising one is a decision to accept a deviation.
const { cases } = JSON.parse(readFileSync(new URL('./calibration/manifest.json', import.meta.url), 'utf8'))

test.use({ deviceScaleFactor: 2 })
test.beforeEach(async ({ page }) => {
  const client = await page.context().newCDPSession(page)
  await client.send('Network.setCacheDisabled', { cacheDisabled: true })
})

for (const [name, c] of Object.entries(cases)) {
  test(`calibration: ${name} within ${c.budget}px of ${c.source}`, async ({ page }) => {
    await page.setViewportSize({ width: c.viewport[0], height: c.viewport[1] })
    await page.goto('/' + c.page, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(700)
    if (c.click) { await page.click(c.click); await page.waitForTimeout(800) }
    await page.evaluate(() => { const s = document.querySelector('.case-bar'); if (s) s.style.visibility = 'hidden' })
    const shot = c.clip ? await page.screenshot({ clip: c.clip }) : await page.locator('.s-panel').first().screenshot()
    expect(await differing(page, shot, `/test/calibration/${name}.png`), `${name}: pixels differing from the original`).toBeLessThanOrEqual(c.budget)
  })
}

// Material themes against the study they reproduce: each row's averaged button profile, per zone
// (halo above, top edge, face, bottom edge, shadow below), within its budget in materials.json.
for (const [key, row] of Object.entries(materials.rows)) {
  const [theme, palette] = key.split('/')
  test(`calibration: ${theme} in ${palette} matches the study's ${row.word} row`, async ({ page }) => {
    await page.setViewportSize({ width: 760, height: 700 })
    const got = zones(row.profile, await profile(page, theme, palette, row.word))
    for (const [zone, limit] of Object.entries(row.budget)) expect(got[zone], `${key}, ${zone}: ΔE ×100`).toBeLessThanOrEqual(limit)
  })
}
