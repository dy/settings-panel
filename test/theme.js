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

// A skeu key draws its wall and the line it stands on inside its box: nothing below it but the blurred shadow, so the
// silhouette wraps them round the ends as one edge with no second crescent outside it
test('theme: skeu draws its key inside the box', () => {
  for (const depth of [0, .5, 1, 2]) {
    const css = themes.skeu({ depth })
    const key = css.match(/--key: ([^;]+);/)[1].split(/,(?![^(]*\))/)
    is(key.filter(s => !s.includes('inset') && /^\s*0 calc\([\d.]+ \* var\(--length\)\) 0 /.test(s)).length, 0, `depth ${depth}: no edge below the box`)
    is(key.filter(s => s.includes('inset')).length, depth ? 4 : 3, `depth ${depth}: base line, silhouette, rim${depth ? ', wall' : ''}`)
  }
})

// Soft's groove is a groove, not an outline: its floor holds at most 1.3:1 against the material, drawn back only that far
// (read from the slider's channel, which keeps a hairline's 1.3:1 on a light finish, so a hair over it by rounding)
test('theme: soft keeps its groove within 1.3:1 of the material', async () => {
  const { contrast } = await import('../theme/color.js')
  for (const shade of ['#ca9d63', '#ba965a', '#c0cbb9', '#b87959', '#c6cac9', '#f1f2f4', '#1e1e1e', '#ffffff', '#000000']) {
    const floor = themes.default({ shade }).match(/--channel: (#[0-9a-f]{6})/)[1], c = contrast(shade, floor)
    ok(c <= 1.32, `${shade}: floor ${floor} at ${c.toFixed(3)}:1`)
    if (['#ca9d63', '#ba965a', '#b87959'].includes(shade)) ok(c > 1.28, `${shade}: drawn back to the cap, no further`)
  }
})

// Neu's raised shadows stay on their part: no outer layer's near edge passes a control's far edge (34px at size 1) by more
// than its blur feathers back, in hard light or deep relief alike
test('theme: neu keeps every outer shadow layer attached to its part', () => {
  for (const axes of [{}, { softness: 0 }, { depth: 2 }, { softness: 0, depth: 3 }, { softness: 0, light: 90 }]) {
    const raise = themes.neu(axes).match(/--neu-raise: ([^;]+);/)[1]
    for (const layer of raise.split(/,(?![^(]*\))/).filter(l => !l.includes('inset'))) {
      const [x, y, blur, spread = 0] = layer.trim().match(/-?[\d.]+px/g).map(parseFloat)
      ok(Math.hypot(x, y) + Math.max(0, -spread) - blur / 2 <= 34 + .01, `${JSON.stringify(axes)}: ${layer.trim().slice(0, 40)}`)
    }
  }
})

// Skeu's silhouette edge is shade laid over the key, one layer all round: translucent, so over the face at the rounded
// ends it falls deeper by itself; no second layer at the ends (two translucent shades there doubled the border)
test('theme: skeu edges its keys in one translucent shade', () => {
  for (const shade of ['#f1f2f4', '#c6cac9', '#1e1e1e', '#ca9d63']) {
    const key = themes.skeu({ shade }).match(/--key: ([^;]+);/)[1]
    const outline = +key.match(/inset 0 0 0 calc\(1 \* var\(--length\)\) rgb\([\d ]+\/ ([\d.]+)\)/)?.[1]
    ok(outline > 0 && outline < 1, `${shade}: the edge at ${outline}, translucent`)
    is(key.match(/inset -?calc\([-\d.]+ \* var\(--length\)\) 0 0 /g), null, `${shade}: no layer of its own at the ends`)
  }
})

// Soft's groove takes the palette's ink hue where there is one (chalk's blue-grey), and stays neutral without one
test('theme: soft tints its groove by the ink', async () => {
  const { parseColor } = await import('../theme/color.js')
  const floor = axes => parseColor(themes.default(axes).match(/--channel: (#[0-9a-f]{6})/)[1])
  const bare = floor({ shade: '#f1f2f4' }), inked = floor({ shade: '#f1f2f4', ink: '#4a5362' }), ink = parseColor('#4a5362')
  ok(inked.C > bare.C * 1.5, `chalk with its ink: chroma ${inked.C.toFixed(4)} over ${bare.C.toFixed(4)}`)
  ok(Math.abs(inked.H - ink.H) < 20, `chalk with its ink: hue ${inked.H.toFixed(0)} near the ink's ${ink.H.toFixed(0)}`)
  is(floor({ shade: '#1e1e1e', ink: '#f8f9fa' }).C < .01, true, 'graphite with its neutral ink stays neutral')
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

// Studio's lettering keeps one polarity: on a mid shade (copper) a value over a darker ground stays dark, never white
test('theme: studio letters every ground in one ink polarity', async () => {
  const { parseColor } = await import('../theme/color.js')
  for (const shade of ['#b87959', '#ba965a', '#b4b4b4', '#384957', '#212121', '#f4f4f4']) {
    const css = themes.studio({ shade }), tok = n => css.match(new RegExp(`--${n}: ([^;]+);`))[1]
    const dark = parseColor(tok('ink')).L > parseColor(shade).L
    for (const n of ['ink-label', 'value', 'ink-placeholder']) is(parseColor(tok(n)).L > parseColor(shade).L, dark, `${shade}: ${n} on the ink's side`)
  }
})

// JSON's muted lettering stays on the lettering's side on a mid grey, where the hovered row's wash would flip it
test('theme: json mutes on the lettering side', async () => {
  const { parseColor } = await import('../theme/color.js')
  for (const shade of ['#757575', '#7a7a7a', '#808080', '#b87959', '#384957', '#ffffff', '#1e1e1e']) {
    const css = themes.json({ shade }), tok = n => parseColor(css.match(new RegExp(`--${n}: ([^;]+);`))[1]).L
    is(tok('muted') > parseColor(shade).L, tok('fg') > parseColor(shade).L, `${shade}: muted on the fg's side`)
  }
})

// Soft's groove: the wall's crescent at its top edge as wide as the crevice's under the key (the chalk study's, about 1px)
test('theme: soft groove wall and crevice even', () => {
  const css = themes.default(), k = '\\(var\\(--g\\) \\* ([\\d.]+)\\)'
  const crevice = +css.match(new RegExp(`0 calc${k} 0 0 [^,]+, 0 calc${k} 0 0`))[1]
  const [, dy, spread] = css.match(new RegExp(`0 calc${k} 0 calc${k} [^,]+,\\s*0 0 0 var\\(--g\\)`)).map(Number)
  is(+(1 - (spread - dy)).toFixed(3), crevice, 'wall crescent = crevice')
  ok(crevice >= .25 && crevice <= .4, `about 1px of a 3.3px socket: ${crevice}`)
})

// Glass edges and fills an on-state's lens in the accent lit, not greyed with white
test('theme: glass lights its accent in its own hue', () => {
  const css = themes.glass({ accent: '#4e2920' })
  ok(/--accent-lit: oklch\(from var\(--accent\) calc\(l \+ \(1 - l\) \* [\d.]+\) calc\(c \* [\d.]+\) h\)/.test(css), 'lighter, as saturated')
  ok(/--lens-edge-on: inset 0 0 0 [^,]+ var\(--accent-lit\)/.test(css), 'on-state hairline')
  ok(css.includes('var(--accent-lit) 0 var(--p, 0%)'), 'slider fill under the pale ring')
  ok(!/var\(--accent\), white/.test(css), 'no white mixed into the accent')
})
