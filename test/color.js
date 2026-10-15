import './register.js'
import test, { is, ok } from 'tst'
import { resolveRoles, normalizeHex, parseColor } from '../theme/color.js'

test('normalizeHex: #rgb → #rrggbb', () => {
  is(normalizeHex('#fff'), '#ffffff')
  is(normalizeHex('#000'), '#000000')
  is(normalizeHex('#abc'), '#aabbcc')
})

test('normalizeHex: bare hex gets # prefix', () => {
  is(normalizeHex('fff'), '#ffffff')
  is(normalizeHex('000'), '#000000')
})

test('normalizeHex: #rgba shorthand → #rrggbbaa', () => {
  is(normalizeHex('#f008'), '#ff000088')
})

test('normalizeHex: #rrggbb passes through (lowercase)', () => {
  is(normalizeHex('#FF0000'), '#ff0000')
  is(normalizeHex('#ff0000'), '#ff0000')
})

test('normalizeHex: incomplete hex unchanged', () => {
  is(normalizeHex('#ff'), '#ff')
  is(normalizeHex('red'), 'red')
})

test('normalizeHex: rgb/hsl unchanged', () => {
  is(normalizeHex('rgb(255,0,0)'), 'rgb(255,0,0)')
  is(normalizeHex('hsl(0,100%,50%)'), 'hsl(0,100%,50%)')
})

test('parseColor: short hex', () => {
  ok(parseColor('#fff').L > 0.99)
  is(parseColor('#000').L, 0)
  ok(parseColor('fff').L > 0.99)
})

test('parseColor: #fff matches #ffffff', () => {
  const short = parseColor('#fff')
  const full = parseColor('#ffffff')
  is(+short.L.toFixed(3), +full.L.toFixed(3))
  is(+short.C.toFixed(4), +full.C.toFixed(4))
  is(+short.H.toFixed(1), +full.H.toFixed(1))
})


test('resolveRoles: accent text follows the fill, independently of panel shade', () => {
  for (const shade of ['#111111', '#eeeeee']) {
    is(resolveRoles(shade, '#b6d9cf').onAccent, '#000')
    is(resolveRoles(shade, '#35685a').onAccent, '#fff')
    is(resolveRoles(shade, '#ffffff').onAccent, '#000')
    is(resolveRoles(shade, '#000000').onAccent, '#fff')
  }
})

test('parseColor: unknown and absent inputs retain the caller fallback', () => {
  for (const input of [undefined, null, '', 'rgb(0,0,0)', 'var(--brand)']) {
    is(parseColor(input, null), null)
    is(parseColor(input).L, .97)
  }
  is(parseColor('#000', null).L, 0)
})

test('resolveRoles: unsupported CSS accents preserve white ink and the original fill', () => {
  for (const accent of ['rgb(0,0,0)', 'hsl(0 0% 0%)', 'var(--brand)', 'navy']) {
    const roles = resolveRoles('#eeeeee', accent)
    is(roles.accent, accent)
    is(roles.onAccent, '#fff')
  }
})

test('resolveRoles: contrast boundaries, default accents, and repeated calls', () => {
  for (const shade of ['#111111', '#eeeeee']) {
    for (const [accent, ink] of [
      ['#000', '#fff'], ['#fff', '#000'],
      ['#757575', '#fff'], ['#767676', '#000'],
      ['oklch(0 0 0)', '#fff'], ['oklch(1 0 0)', '#000'],
      [0, '#fff'], [1, '#000'],
    ]) {
      const a = resolveRoles(shade, accent)
      is(a.onAccent, ink)
      is(JSON.stringify(resolveRoles(shade, accent)), JSON.stringify(a))
      resolveRoles(shade, ink === '#000' ? '#000' : '#fff')
      is(JSON.stringify(resolveRoles(shade, accent)), JSON.stringify(a))
    }
    for (const accent of [undefined, null, '']) {
      const a = resolveRoles(shade, accent)
      is(a.accent, resolveRoles(shade).accent)
      is(a.onAccent, resolveRoles(shade).onAccent)
    }
  }
})


test('parseColor: malformed literals return the exact fallback, never partial or NaN roles', () => {
  const fallback = { L: .4, C: .02, H: 120 }
  for (const input of [
    undefined, null, '', ' ', 1, {}, '#gggggg', '#12zz34', '#12345gff', '#12',
    'oklch(', 'oklch(0 0 0', 'oklch(0 0 0)tail', 'prefix oklch(0 0 0)',
    `oklch(${'1'.repeat(4096)} 0 0)`,
    'oklch(. 0 0)', 'oklch(1..2 0 0)', 'oklch(1e999 0 0)', 'oklch(0 0 0 / 1e999)',
  ]) {
    ok(parseColor(input, fallback) === fallback, String(input))
    is(parseColor(input, null), null)
    is(JSON.stringify(fallback), '{"L":0.4,"C":0.02,"H":120}')
  }
})

test('parseColor: complete numeric literals and repeated fallback calls preserve semantic components', () => {
  for (const [input, expected] of [
    ['oklch(0 0 0)', { L: 0, C: 0, H: 0 }],
    [' OKLCH(.5 2e-2 -30 / 50%) ', { L: .5, C: .02, H: -30 }],
    ['oklch(1 0 360 / 1)', { L: 1, C: 0, H: 360 }],
  ]) {
    for (const next of [input, '#fff', 'oklch(0 0 0']) {
      is(JSON.stringify(parseColor(input, null)), JSON.stringify(expected))
      parseColor(next, null)
      is(JSON.stringify(parseColor(input, null)), JSON.stringify(expected))
    }
  }
  for (const accent of ['#gggggg', 'oklch(. 0 0)', 'oklch(0 0 0']) {
    const roles = resolveRoles('#eee', accent)
    is(roles.accent, accent)
    is(roles.onAccent, '#fff')
    ok(!/NaN|Infinity/.test(JSON.stringify(roles)))
  }
})

// Reference ratios from the WebAIM contrast checker (WCAG 2.x formula):
// https://webaim.org/resources/contrastchecker/ – #767676 on #ffffff is the
// lightest grey passing AA (4.54:1); #777777 fails it (4.48:1).
test('contrast: WCAG ratios match the reference checker', async () => {
  const { contrast, luminance } = await import('../theme/color.js')
  is(contrast('#000000', '#ffffff'), 21)
  is(contrast('#ffffff', '#ffffff'), 1)
  ok(Math.abs(contrast('#767676', '#ffffff') - 4.54) < .01, '#767676 on white is 4.54:1')
  ok(Math.abs(contrast('#777777', '#ffffff') - 4.48) < .01, '#777777 on white is 4.48:1')
  is(contrast('#ffffff', '#000000'), contrast('#000000', '#ffffff'), 'symmetric')
  is(luminance('#ffffff'), 1)
  is(luminance('red'), null)
  is(contrast('red', '#fff'), null)
})

test('ink: passing tones return unchanged; failing tones move just past the ratio, keeping hue', async () => {
  const { ink, contrast, parseColor } = await import('../theme/color.js')
  const maps = ['#111111', '#1e1e1e', '#384957', '#b87959', '#ba965a', '#ca9d63', '#b4b4b4', '#c0cbb9', '#c6cac9', '#f4ecdc', '#f1f2f4', '#ffffff']
  for (const bg of maps) {
    for (const ratio of [3, 4.5, 7]) {
      const muted = ink(bg, ratio), best = Math.max(contrast('#000000', bg), contrast('#ffffff', bg))
      if (best < ratio) { is(contrast(muted, bg), best, `${bg}: unreachable ${ratio} returns the best extreme`); continue }
      ok(contrast(muted, bg) >= ratio, `${bg}: muted ink reaches ${ratio}`)
      ok(contrast(muted, bg) < ratio + .35, `${bg}: muted ink stays near ${ratio} (${contrast(muted, bg).toFixed(2)})`)
    }
    // A tone on the wrong side of the background still resolves outward.
    const wrong = parseColor(bg).L < .5 ? '#000000' : '#ffffff'
    ok(contrast(ink(bg, 4.5, wrong), bg) >= 4.5, `${bg}: wrong-side tone resolves`)
  }
  is(ink('#ffffff', 4.5, '#000000'), '#000000', 'already-passing tone is kept')
  const tinted = ink('#384957', 4.5, 'oklch(.5 .1 30)')
  ok(contrast(tinted, '#384957') >= 4.5, 'tinted tone reaches AA on slate')
  ok(Math.abs(parseColor(tinted).H - 30) < 6, 'hue is preserved while lightness moves')
  is(ink('#808080', 21), '#000000', 'unreachable ratios return the best extreme')
  is(ink('var(--bg)', 4.5, '#333'), '#333', 'unparseable backgrounds pass the tone through')
})

test('ink: tone forms, trivial ratios, and output format', async () => {
  const { ink, contrast, parseColor } = await import('../theme/color.js')
  is(ink('#ffffff', 4.5, 'red'), 'red', 'unparseable tone passes through unchanged')
  const tone = { L: .5, C: .08, H: 250 }
  const fromObject = ink('#ffffff', 4.5, tone), fromString = ink('#ffffff', 4.5, 'oklch(.5 .08 250)')
  is(fromObject, fromString, 'an {L, C, H} tone and its oklch() string resolve identically')
  ok(contrast(fromObject, '#ffffff') >= 4.5, 'object tone reaches the ratio')
  is(ink('#292b2e', 1, '#2a2c2f'), '#2a2c2f', 'ratio 1 accepts any tone, even one matching bg')
  for (const bg of ['#111111', '#b87959', '#ffffff']) for (const t of [undefined, '#777777', tone]) {
    const out = ink(bg, 3, t)
    ok(/^#[0-9a-f]{6}$/.test(out), `${bg}: parseable input yields #rrggbb (${out})`)
    ok(parseColor(out, null), 'output parses back')
  }
})

// mix(a, b, t): sRGB is a + (b − a)·t on each gamma-encoded 8-bit channel, rounded once, as CSS
// color-mix(in srgb, a, b t·100%) defines it for opaque colors (https://www.w3.org/TR/css-color-5/#color-mix)
// and as b at opacity t composites over a (source-over, https://www.w3.org/TR/compositing-1/).
// OKLab interpolates L, a, b (https://bottosson.github.io/posts/oklab/): an achromatic L gives linear
// sRGB L³, so black and white meet at L .5 → .125 linear → 99.07 → #636363. The browser's own
// color-mix() is checked against mix() in test/metrics.spec.js.
test('mix: endpoints, sRGB channel interpolation and OKLab', async () => {
  const { mix } = await import('../theme/color.js')
  is(mix('#123456', '#abcdef', 0), '#123456')
  is(mix('#123456', '#abcdef', 1), '#abcdef')
  is(mix('#000', '#fff', .5), '#808080', '127.5 rounds to 128')
  is(mix('#ff0000', '#0000ff', .25), '#bf0040', '191.25 → bf, 63.75 → 40')
  is(mix('#1f1f1f', '#ebebeb', .3), '#5c5c5c', '31 + 204 × .3 = 92.2 → 5c')
  is(mix('oklch(1 0 0)', '#000000', .5), '#808080', 'any parseable color')
  is(mix('#000', '#fff', .5, 'oklab'), '#636363')
  is(mix('#000', '#fff', 0, 'oklab'), '#000000')
  is(mix('#000', '#fff', 1, 'oklab'), '#ffffff')
  is(mix('#fff', '#000', 1.5), '#000000', 'an overshoot stays a color')
})
