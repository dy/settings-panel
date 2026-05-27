import './register.js'
import test, { is, ok } from 'tst'
import { normalizeHex, parseColor } from '../theme/color.js'

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
