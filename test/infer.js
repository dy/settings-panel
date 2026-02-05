import test, { is, ok } from 'tst'
import infer from '../infer.js'

// ─────────────────────────────────────────────────────────────────────────────
// BOOLEAN
// ─────────────────────────────────────────────────────────────────────────────

test('boolean: true → boolean', () => {
  const r = infer('enabled', true)
  is(r.type, 'boolean')
  is(r.value, true)
  is(r.label, 'enabled')
})

test('boolean: false → boolean', () => {
  const r = infer('visible', false)
  is(r.type, 'boolean')
  is(r.value, false)
})

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER
// ─────────────────────────────────────────────────────────────────────────────

test('number: integer → number', () => {
  const r = infer('count', 42)
  is(r.type, 'number')
  is(r.value, 42)
})

test('number: negative → number', () => {
  const r = infer('temp', -5)
  is(r.type, 'number')
  is(r.value, -5)
})

test('number: large → number', () => {
  const r = infer('big', 1000000)
  is(r.type, 'number')
})

test('number: 0 → number (boundary)', () => {
  is(infer('z', 0).type, 'number')
})

test('number: 1 → number (boundary)', () => {
  is(infer('o', 1).type, 'number')
})

test('number: 0-1 float → slider', () => {
  const r = infer('opacity', 0.5)
  is(r.type, 'slider')
  is(r.min, 0)
  is(r.max, 1)
  is(r.value, 0.5)
})

test('number: 0.01 → slider', () => {
  is(infer('a', 0.01).type, 'slider')
})

test('number: 0.99 → slider', () => {
  is(infer('b', 0.99).type, 'slider')
})

// ─────────────────────────────────────────────────────────────────────────────
// STRING
// ─────────────────────────────────────────────────────────────────────────────

test('string: plain → text', () => {
  const r = infer('name', 'hello')
  is(r.type, 'text')
  is(r.value, 'hello')
})

test('string: empty → text', () => {
  is(infer('e', '').type, 'text')
})

test('string: multiline → textarea', () => {
  const r = infer('bio', 'line1\nline2')
  is(r.type, 'textarea')
})

// Color patterns
test('string: #rrggbb → color', () => {
  is(infer('c', '#ff0000').type, 'color')
})

test('string: #rgb → color', () => {
  is(infer('c', '#fff').type, 'color')
})

test('string: #rrggbbaa → color', () => {
  is(infer('c', '#ff000080').type, 'color')
})

test('string: rgb() → color', () => {
  is(infer('c', 'rgb(255,0,0)').type, 'color')
})

test('string: rgb() spaces → color', () => {
  is(infer('c', 'rgb(255, 0, 0)').type, 'color')
})

test('string: rgba() → color', () => {
  is(infer('c', 'rgba(255,0,0,0.5)').type, 'color')
})

test('string: hsl() → color', () => {
  is(infer('c', 'hsl(0,100%,50%)').type, 'color')
})

test('string: hsla() → color', () => {
  is(infer('c', 'hsla(0,100%,50%,0.5)').type, 'color')
})

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

test('function → button', () => {
  const fn = () => {}
  const r = infer('reset', fn)
  is(r.type, 'button')
  is(r.onClick, fn)
})

test('async function → button', () => {
  const fn = async () => {}
  is(infer('save', fn).type, 'button')
})

// ─────────────────────────────────────────────────────────────────────────────
// ARRAY
// ─────────────────────────────────────────────────────────────────────────────

test('array: strings → select', () => {
  const r = infer('fruit', ['apple', 'banana', 'cherry'])
  is(r.type, 'select')
  is(r.value, 'apple')
  is(r.options.length, 3)
})

test('array: option objects → select', () => {
  const opts = [{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }]
  const r = infer('size', opts)
  is(r.type, 'select')
  is(r.value, 's')
})

test('array: 2 numbers → vector', () => {
  const r = infer('pos', [0, 0])
  is(r.type, 'vector')
  is(r.dimensions, 2)
})

test('array: 3 numbers → vector', () => {
  const r = infer('rgb', [255, 128, 0])
  is(r.type, 'vector')
  is(r.dimensions, 3)
})

test('array: 4 numbers → vector', () => {
  const r = infer('rgba', [1, 0, 0, 0.5])
  is(r.type, 'vector')
  is(r.dimensions, 4)
})

test('array: empty → text fallback', () => {
  is(infer('x', []).type, 'text')
})

test('array: mixed → text fallback', () => {
  is(infer('x', [1, 'a', true]).type, 'text')
})

// ─────────────────────────────────────────────────────────────────────────────
// OBJECT
// ─────────────────────────────────────────────────────────────────────────────

test('object: explicit type → use as-is', () => {
  const r = infer('lvl', { type: 'slider', value: 5 })
  is(r.type, 'slider')
  is(r.value, 5)
})

test('object: options → select', () => {
  const r = infer('mode', { options: ['a', 'b'], value: 'b' })
  is(r.type, 'select')
  is(r.value, 'b')
})

test('object: min/max → slider', () => {
  const r = infer('lvl', { min: 0, max: 100, value: 50 })
  is(r.type, 'slider')
  is(r.min, 0)
  is(r.max, 100)
})

test('object: min only → slider (default max)', () => {
  const r = infer('lvl', { min: 10, value: 20 })
  is(r.type, 'slider')
  is(r.min, 10)
  is(r.max, 100)
})

test('object: max only → slider (default min)', () => {
  const r = infer('lvl', { max: 50, value: 25 })
  is(r.type, 'slider')
  is(r.min, 0)
  is(r.max, 50)
})

test('object: children → folder', () => {
  const r = infer('grp', { children: { x: 0, y: 0 } })
  is(r.type, 'folder')
  is(r.children.x, 0)
})

test('object: value → infer from value + merge', () => {
  const r = infer('op', { value: 0.5, step: 0.1 })
  is(r.type, 'slider')
  is(r.step, 0.1)
})

test('object: value + label → use provided label', () => {
  const r = infer('x', { value: 0.5, label: 'Opacity' })
  is(r.label, 'Opacity')
})

// ─────────────────────────────────────────────────────────────────────────────
// NESTED OBJECTS → FOLDER
// ─────────────────────────────────────────────────────────────────────────────

test('nested: object with numbers → folder', () => {
  const r = infer('transform', { x: 0, y: 0, scale: 1 })
  is(r.type, 'folder')
  ok(r.children)
})

test('nested: object with booleans → folder', () => {
  const r = infer('flags', { a: true, b: false })
  is(r.type, 'folder')
})

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY
// ─────────────────────────────────────────────────────────────────────────────

test('priority: explicit type wins', () => {
  is(infer('x', { type: 'number', value: 0.5 }).type, 'number')
})

test('priority: options over nested', () => {
  is(infer('x', { options: ['a', 'b'] }).type, 'select')
})

test('priority: min/max over nested', () => {
  is(infer('x', { min: 0, max: 10 }).type, 'slider')
})

// ─────────────────────────────────────────────────────────────────────────────
// EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────

test('edge: null → text fallback', () => {
  const r = infer('n', null)
  is(r.type, 'text')
  is(r.value, '')
})

test('edge: undefined → text fallback', () => {
  is(infer('u', undefined).type, 'text')
})

test('edge: label defaults to key', () => {
  is(infer('myKey', 42).label, 'myKey')
})
