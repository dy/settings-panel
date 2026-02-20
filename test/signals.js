import test, { is, ok } from 'tst'
import {
  signal, effect, from, map, persist, delay,
  readonly, peek, throttle, debounce
} from '../signals.js'

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL BASICS
// ─────────────────────────────────────────────────────────────────────────────

test('signal: read/write', () => {
  const s = signal(1)
  is(s.value, 1)
  s.value = 2
  is(s.value, 2)
})

test('effect: tracks signal', () => {
  const s = signal(0)
  let count = 0
  const dispose = effect(() => { count += s.value })
  is(count, 0)
  s.value = 1
  is(count, 1)
  s.value = 2
  is(count, 3)
  dispose()
})

test('effect: dispose stops tracking', () => {
  const s = signal(0)
  let count = 0
  const dispose = effect(() => { count += s.value })
  s.value = 1
  dispose()
  s.value = 2
  is(count, 1)
})

// ─────────────────────────────────────────────────────────────────────────────
// FROM
// ─────────────────────────────────────────────────────────────────────────────

test('from: plain value → signal', () => {
  const s = from(42)
  is(s.value, 42)
  s.value = 100
  is(s.value, 100)
})

test('from: signal passthrough', () => {
  const original = signal(5)
  const s = from(original)
  is(s, original)
})

test('from: TC39 style (.get/.set)', () => {
  let store = 10
  const tc39 = {
    get: () => store,
    set: (v) => { store = v }
  }
  const s = from(tc39)
  is(s.value, 10)
})

test('from: Solid style [getter, setter]', () => {
  let store = 20
  const solid = [() => store, (v) => { store = v }]
  const s = from(solid)
  is(s.value, 20)
})

// ─────────────────────────────────────────────────────────────────────────────
// MAP
// ─────────────────────────────────────────────────────────────────────────────

test('map: derives from source', () => {
  const s = signal(2)
  const doubled = map(s, v => v * 2)
  is(doubled.value, 4)
  s.value = 5
  is(doubled.value, 10)
})

test('map: dispose stops updates', () => {
  const s = signal(1)
  const doubled = map(s, v => v * 2)
  is(doubled.value, 2)
  doubled[Symbol.dispose]()
  s.value = 10
  is(doubled.value, 2)
})

// ─────────────────────────────────────────────────────────────────────────────
// READONLY
// ─────────────────────────────────────────────────────────────────────────────

test('readonly: reads source', () => {
  const s = signal(5)
  const r = readonly(s)
  is(r.value, 5)
  s.value = 10
  is(r.value, 10)
})

test('readonly: peek returns value', () => {
  const s = signal(7)
  const r = readonly(s)
  is(r.peek(), 7)
})

// ─────────────────────────────────────────────────────────────────────────────
// PEEK
// ─────────────────────────────────────────────────────────────────────────────

test('peek: reads without tracking', () => {
  const s = signal(3)
  is(peek(s), 3)
})

// ─────────────────────────────────────────────────────────────────────────────
// THROTTLE
// ─────────────────────────────────────────────────────────────────────────────

test('throttle: initial value', () => {
  const s = signal(1)
  const t = throttle(s, 50)
  is(t.value, 1)
  t[Symbol.dispose]()
})

test('throttle: passes first update immediately', async () => {
  const s = signal(0)
  const t = throttle(s, 50)
  s.value = 1
  is(t.value, 1)
  t[Symbol.dispose]()
})

test('throttle: delays rapid updates', async () => {
  const s = signal(0)
  const t = throttle(s, 50)
  s.value = 1
  s.value = 2
  s.value = 3
  is(t.value, 1) // first passes, rest queued
  await new Promise(r => setTimeout(r, 60))
  is(t.value, 3) // final value after throttle
  t[Symbol.dispose]()
})

// ─────────────────────────────────────────────────────────────────────────────
// DEBOUNCE
// ─────────────────────────────────────────────────────────────────────────────

test('debounce: initial value', () => {
  const s = signal(1)
  const d = debounce(s, 50)
  is(d.value, 1)
  d[Symbol.dispose]()
})

test('debounce: waits for quiet period', async () => {
  const s = signal(0)
  const d = debounce(s, 30)
  s.value = 1
  s.value = 2
  s.value = 3
  is(d.value, 0) // not yet updated
  await new Promise(r => setTimeout(r, 50))
  is(d.value, 3) // final value after debounce
  d[Symbol.dispose]()
})

test('debounce: resets timer on each update', async () => {
  const s = signal(0)
  const d = debounce(s, 50)
  s.value = 1
  await new Promise(r => setTimeout(r, 30))
  s.value = 2 // reset timer
  await new Promise(r => setTimeout(r, 30))
  is(d.value, 0) // still waiting
  await new Promise(r => setTimeout(r, 40))
  is(d.value, 2)
  d[Symbol.dispose]()
})

// ─────────────────────────────────────────────────────────────────────────────
// DELAY
// ─────────────────────────────────────────────────────────────────────────────

test('delay: initial value', () => {
  const s = signal(1)
  const d = delay(s, 50)
  is(d.value, 1)
  d[Symbol.dispose]()
})

test('delay: delays updates', async () => {
  const s = signal(0)
  const d = delay(s, 30)
  s.value = 5
  is(d.value, 0) // not yet
  await new Promise(r => setTimeout(r, 50))
  is(d.value, 5)
  d[Symbol.dispose]()
})

// ─────────────────────────────────────────────────────────────────────────────
// PERSIST (mock localStorage)
// ─────────────────────────────────────────────────────────────────────────────

const mockStorage = () => {
  const store = {}
  globalThis.localStorage = {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] }
  }
  return store
}

test('persist: saves to localStorage', () => {
  mockStorage()
  const s = signal(10)
  const p = persist(s, 'test-key')
  is(localStorage.getItem('test-key'), '10')
  s.value = 20
  is(localStorage.getItem('test-key'), '20')
  p[Symbol.dispose]()
})

test('persist: restores from localStorage', () => {
  const store = mockStorage()
  store['restore-key'] = '42'
  const s = signal(0)
  const p = persist(s, 'restore-key')
  is(s.value, 42)
  p[Symbol.dispose]()
})
