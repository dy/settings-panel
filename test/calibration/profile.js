// Material rows: our text-free button's averaged vertical profile against the study's reference
// pill (materials.json), both on the same u grid (u = 0 top edge, 1 bottom edge), compared as mean
// OKLab ΔE ×100 per zone: halo above, top edge, face, bottom edge, shadow below.
// OKLab: Björn Ottosson, "A perceptual color space for image processing" (2020), published matrices.
import { readFileSync } from 'node:fs'

export const materials = JSON.parse(readFileSync(new URL('./materials.json', import.meta.url), 'utf8'))

const lin = c => (c /= 255) <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4
const oklab = ([R, G, B]) => {
  const r = lin(R), g = lin(G), b = lin(B)
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b)
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b)
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b)
  return [.2104542553 * l + .7936177850 * m - .0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .8086757660 * s]
}

// Our profile: the second (text-free) button of test/calibration/row.html, averaged over its straight
// part, pixel rows centred at y + .5 against the continuous border box, resampled to the grid.
export async function profile(page, theme, palette, word) {
  await page.goto(`/test/calibration/row.html#${new URLSearchParams({ theme, palette, word })}`)
  await page.waitForSelector('body[data-ready]')
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  const bb = await page.locator('.s-button button').nth(1).boundingBox()
  const { u0, u1, n } = materials.grid
  const clip = { x: Math.floor(bb.x), y: Math.floor(bb.y + u0 * bb.height) - 2, width: Math.ceil(bb.width) + 1, height: Math.ceil((u1 - u0) * bb.height) + 4 }
  const png = await page.screenshot({ clip })
  return page.evaluate(async ([b64, bb, clip, u0, u1, n]) => {
    const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob())
    const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d')
    g.drawImage(img, 0, 0)
    const { data, width, height } = g.getImageData(0, 0, img.width, img.height), dpr = width / clip.width
    const H = bb.height * dpr, top = (bb.y - clip.y) * dpr
    const x0 = Math.round((bb.x - clip.x) * dpr), x1 = Math.round((bb.x + bb.width - clip.x) * dpr) - 1
    const a = x0 + Math.trunc(.42 * H), b = x1 - Math.trunc(.42 * H)
    const rows = []
    for (let y = 0; y < height; y++) {
      const sum = [0, 0, 0]
      for (let x = a; x <= b; x++) for (let k = 0; k < 3; k++) sum[k] += data[(y * width + x) * 4 + k]
      rows.push({ u: (y + .5 - top) / H, rgb: sum.map(v => v / (b - a + 1)) })
    }
    return Array.from({ length: n }, (_, i) => {
      const u = u0 + (u1 - u0) * i / (n - 1)
      const j = rows.findIndex(r => r.u >= u)
      if (j <= 0) return rows[j < 0 ? rows.length - 1 : 0].rgb
      const p = rows[j - 1], q = rows[j], t = (u - p.u) / (q.u - p.u)
      return p.rgb.map((v, k) => v + (q.rgb[k] - v) * t)
    })
  }, [png.toString('base64'), bb, clip, u0, u1, n])
}

// Mean ΔE ×100 per zone between a reference and our profile.
export function zones(reference, ours) {
  const { u0, u1, n } = materials.grid
  const out = {}
  for (const [name, [a, b]] of Object.entries(materials.zones)) {
    let sum = 0, count = 0
    for (let i = 0; i < n; i++) {
      const u = u0 + (u1 - u0) * i / (n - 1)
      if (u < a || u >= b && b !== u1) continue
      const p = oklab(reference[i]), q = oklab(ours[i])
      sum += Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) * 100; count++
    }
    out[name] = +(sum / count).toFixed(2)
  }
  return out
}
