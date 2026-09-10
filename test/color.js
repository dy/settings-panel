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
