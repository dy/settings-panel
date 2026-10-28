import './register.js'
import test, { is, ok } from 'tst'
import { readdirSync } from 'node:fs'
import metrics, { BODY, scale } from '../theme/metrics.js'

test('metrics: invalid axes fall back, finite axes clamp, and font defaults survive empty overrides', () => {
  const token = (css, name) => css.match(new RegExp(`--${name}: ([^;]+);`))[1]
  for (const value of [undefined, null, '', '2', NaN, Infinity, -Infinity]) {
    const css = metrics({ size: value, spacing: value }, { body: BODY })
    is(token(css, 'size'), '1')
    is(token(css, 'spacing'), '1')
  }
  for (const [value, expected] of [[-1, '.5'], [0, '.5'], [.5, '.5'], [1, '1'], [2, '2'], [3, '2']]) {
    const css = metrics({ size: value, spacing: value }, { body: BODY })
    is(Number(token(css, 'size')), Number(expected))
    is(Number(token(css, 'spacing')), Number(expected))
  }
  for (const font of [undefined, null, '', '   ', 12]) {
    is(token(metrics({ font }, { fontFamily: 'monospace' }), 'font-family'), 'monospace')
  }
  is(token(metrics({ font: 'Georgia, serif' }), 'font-family'), 'Georgia, serif')
  const initial = metrics()
  is(metrics({}), initial)
  metrics({ size: 2, spacing: .5, font: 'serif' })
  is(metrics(), initial)
})

// size 1 is a 13px body in every theme: --size is the size axis, clamped to .5–2 first, times BODY over
// the theme's apparent body px (its font size unless it says otherwise), so a native size gives 1 exactly.
test('metrics: --size normalises the clamped size axis to a 13px body', () => {
  const size = (axes, base) => Number(metrics(axes, base).match(/--size: ([^;]+);/)[1])
  is(BODY, 13)
  is(size({}, { fontSize: 13 }), 1)
  is(size({}), scale(1, 14))
  is(size({}, { fontSize: 11 }), 1.181818)
  is(size({}, { fontSize: 16, body: 13 }), 1)
  for (const body of [9, 10, 11, 12, 12.5, 13, 14, 16]) {
    is(size({ size: body / BODY }, { body }), 1)
    is(size({ size: 1.2 * body / BODY }, { body }), 1.2)
  }
  is(size({ size: 3 }, { body: 10 }), 2.6)
  is(size({ size: .1 }, { body: 10 }), .65)
  is(scale(2, 9), 2.888889)
})

// Every theme is a pure function: axes in, one scoped stylesheet out. A theme
// module that fails to import (a stray backtick inside its CSS template) or
// returns a sheet without the panel root only surfaces in the browser otherwise.
const names = readdirSync(new URL('../theme/', import.meta.url))
  .filter(f => f.endsWith('.js') && !['base.js', 'color.js', 'mixins.js', 'metrics.js', 'texture.js'].includes(f))
  .map(f => f.slice(0, -3))

const themes = Object.fromEntries(await Promise.all(names.map(async n => [n, (await import(`../theme/${n}.js`)).default])))

test('theme: every module exports a function returning a .s-panel sheet', () => {
  for (const [name, theme] of Object.entries(themes)) {
    is(typeof theme, 'function', `${name} exports a function`)
    const css = theme()
    is(typeof css, 'string', `${name}() returns a string`)
    // base contributes one `.s-panel {` rule; the theme's own overrides must add at least one more
    ok(css.split('.s-panel {').length > 2, `${name}() adds its own .s-panel rule on top of base`)
    ok(css.includes('--bg:'), `${name}() sets --bg`)
    ok(!/NaN|undefined/.test(css), `${name}() emits no NaN/undefined`)
  }
})

test('theme: pure — same axes give the same sheet', () => {
  for (const [name, theme] of Object.entries(themes)) {
    is(theme({ shade: '#334455' }), theme({ shade: '#334455' }), `${name} is deterministic`)
  }
})

test('theme: a dark shade changes the sheet', () => {
  for (const [name, theme] of Object.entries(themes)) {
    ok(theme({ shade: '#f5f4f2' }) !== theme({ shade: '#1a1a1a' }), `${name} reacts to shade`)
  }
})

test('theme: numeric accent (derived from shade hue) is accepted', () => {
  for (const [name, theme] of Object.entries(themes)) {
    const css = theme({ shade: '#20304a', accent: 0.6 })
    ok(css.includes('.s-panel {'), `${name} accepts accent as a number`)
    ok(!/NaN|undefined/.test(css), `${name} emits no NaN/undefined with numeric accent`)
  }
})

test('theme: extreme axes stay finite', () => {
  const zero = { spacing: 0.5, size: 0.5, roundness: 0, weight: 100, depth: 0, bevel: 0, blur: 0, tint: 0, softness: 0, contrast: 0, light: 0, offset: 0, grain: 0, leading: 1 }
  const max = { spacing: 2, size: 2, roundness: 2, weight: 900, depth: 3, bevel: 2, blur: 60, tint: 1, softness: 2, contrast: 2, light: 360, offset: 12, grain: 1, leading: 2.5 }
  for (const [name, theme] of Object.entries(themes)) {
    for (const axes of [zero, max]) {
      const css = theme(axes)
      ok(!/NaN|undefined|Infinity/.test(css), `${name} at ${axes === zero ? 'min' : 'max'} axes emits no NaN/undefined/Infinity`)
    }
  }
})

for (const name of ['skeu', 'matte']) test(`theme: ${name} accepts a ramp function as shade`, () => {
  const ramp = (L, C, H, a) => `oklch(${L} ${C} ${H}${a != null ? ` / ${a}` : ''})`
  const css = themes[name]({ shade: ramp, grid: ['dots', 'crosses'] })
  ok(css.includes('.s-panel {'), `${name} builds from a ramp function`)
  ok(!/NaN|undefined/.test(css), 'ramp-driven sheet emits no NaN/undefined')
})

// A skeu key's face is its box; its wall and base line hang below it by --s-key-lip, which a press travels.
// No depth: no wall, the base line inside the box; a wall shorter than the part closing the face: the base line alone below.
test('theme: skeu hangs its key\'s lip below the box by depth', () => {
  const tok = (css, name) => css.match(new RegExp(`--${name}: calc\\(([\\d.]+) \\* var\\(--length\\)\\);`))?.[1]
  for (const [depth, lip] of [[0, '0'], [.5, '0.75'], [1, '1.5'], [2, '4']]) {
    const css = themes.skeu({ depth })
    is(tok(css, 's-key-lip'), lip, `depth ${depth}: lip`)
    is(tok(css, 'travel'), lip, `depth ${depth}: a press travels the lip`)
    const key = css.match(/--key: ([^;]+);/)[1]
    is(key.split(/,(?![^(]*\))/).filter(s => !s.includes('inset') && /^\s*0 calc\([\d.]+ \* var\(--length\)\) 0 /.test(s)).length, +lip > .75 ? 2 : +lip ? 1 : 0, `depth ${depth}: wall and base line below the box`)
  }
})

// Soft-light shows less of a texture on lighter surfaces; surface() compensates along the
// lightness stops it was calibrated on (graphite, bronze, chalk), so contrast rises with L.
test('texture: surface layers follow the material and rise with lightness', async () => {
  const { surface } = await import('../theme/texture.js')
  is(surface(undefined, '#fff'), null)
  is(surface('paper', '#fff'), null, 'unknown textures draw nothing')
  const grain = surface('grain', '#808080'), wood = surface('wood', '#ca9d63')
  is(grain.blend, 'soft-light')
  is(wood.blend, 'soft-light, soft-light', 'wood is speckle over streaks')
  ok(wood.image.includes('240px 120px') && grain.image.includes('160px'), 'layers carry their tile sizes')
  const slope = css => +decodeURIComponent(css).match(/values='([\d.]+) 0 0 0/)[1]
  const k = ['#111111', '#1e1e1e', '#808080', '#ca9d63', '#f1f2f4', '#ffffff'].map(shade => slope(surface('grain', shade).image))
  for (let i = 1; i < k.length; i++) ok(k[i] >= k[i - 1], `contrast does not fall as the surface lightens (${k})`)
  is(k[0], k[1], 'below the darkest stop the contrast holds')
  is(k[4], k[5], 'above the lightest stop the contrast holds')
  const at = amount => slope(surface('grain', '#ca9d63', amount).image)
  ok(Math.abs(at(2) - 2 * at(1)) < .002 && Math.abs(at(.5) - at(1) / 2) < .002, 'amount scales the calibrated contrast')
  for (const amount of [0, -1, NaN]) is(surface('wood', '#ca9d63', amount), null, `amount ${amount} draws nothing`)
})

// A colormap reaches a theme as axes: the surface always; its ink and texture only where the
// theme declares them, so a theme never receives an axis it would ignore or misread.
test('gallery: a colormap carries shade to every theme, ink and texture only where declared', async () => {
  const { material, colormaps, byId } = await import('../demo/themes.js')
  const { bronze, gold, chalk } = colormaps
  is(material(byId.soft, bronze), { shade: '#ca9d63', ink: '#603415', texture: 'wood' })
  is(material(byId.glass, bronze), { shade: '#ca9d63', ink: '#603415' }, 'glass has no surface of its own to texture')
  is(material(byId.lab01, bronze), { shade: '#ca9d63' }, 'undeclared axes stay out')
  is(material(byId.soft, gold), { shade: '#ba965a' }, 'a map without ink or texture carries only its surface')
  is(material(byId.neu, chalk), { shade: '#f1f2f4', ink: '#4a5362', texture: 'grain' })
  const a = material(byId.soft, bronze)
  Object.assign(a, { shade: '#000', accent: '#000' })
  is(material(byId.soft, bronze), { shade: '#ca9d63', ink: '#603415', texture: 'wood' }, 'each call returns a fresh object')
  is([bronze.shade, bronze.accent], ['#ca9d63', '#603415'], 'mutating the axes leaves the map untouched')
  for (const map of Object.values(colormaps)) for (const theme of Object.values(byId)) {
    const axes = material(theme, map)
    ok(Object.keys(axes).every(k => k === 'shade' || theme.axes.split(' ').includes(k)), `${theme.id} × ${map.name}: only declared axes`)
  }
})
