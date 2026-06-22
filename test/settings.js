import './register.js'
import test, { is, ok } from 'tst'
import settings, { effect, signal } from '../index.js'

const tick = () => new Promise(r => queueMicrotask(r))

// ─────────────────────────────────────────────────────────────────────────────
// ONCHANGE CALLBACK
// ─────────────────────────────────────────────────────────────────────────────

test('onchange: fires on state change', async () => {
  let last = null
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings(
    { volume: 0.5 },
    { container, onchange: s => { last = { ...s } } }
  )

  await tick()
  state.volume = 0.8
  is(last.volume, 0.8)

  state[Symbol.dispose]()
  container.remove()
})

test('onChange: camelCase also works', async () => {
  let called = false
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings(
    { enabled: true },
    { container, onChange: () => { called = true } }
  )

  await tick()
  state.enabled = false
  ok(called)

  state[Symbol.dispose]()
  container.remove()
})

test('onchange: receives full state', async () => {
  let last = null
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings(
    { a: 1, b: 2 },
    { container, onchange: s => { last = s } }
  )

  await tick()
  state.a = 10
  is(last.a, 10)
  is(last.b, 2)

  state[Symbol.dispose]()
  container.remove()
})

// ─────────────────────────────────────────────────────────────────────────────
// COLLAPSED SIGNAL
// ─────────────────────────────────────────────────────────────────────────────

test('collapsed: signal two-way binds to panel open state', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const collapsed = signal(false)
  const state = settings({ a: 1 }, { container, title: 'T', collapsed })
  const panel = container.querySelector('.s-panel')
  is(panel.tagName.toLowerCase(), 'details')
  ok(panel.open, 'open when collapsed=false')
  collapsed.value = true
  ok(!panel.open, 'closes when signal flips to collapsed=true')
  state[Symbol.dispose]()
  container.remove()
})

// ─────────────────────────────────────────────────────────────────────────────
// COLON-TYPE VARIANT SYNTAX
// ─────────────────────────────────────────────────────────────────────────────

test("colon type: 'select:segmented' renders segmented buttons", () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings({ mode: { type: 'select:segmented', value: 'a', options: ['a', 'b', 'c'] } }, { container })
  const btns = container.querySelectorAll('.s-select.s-segmented button')
  is(btns.length, 3)
  state[Symbol.dispose]()
  container.remove()
})

// ─────────────────────────────────────────────────────────────────────────────
// PER-PANEL CUSTOM CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

test('controls option: per-panel custom control factory', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  let made = false
  const gizmo = (sig, opts) => {
    made = true
    const el = document.createElement('div')
    el.className = 's-control'
    opts.container?.appendChild(el)
    return Object.assign(sig, { el, [Symbol.dispose]() { el.remove() } })
  }
  const state = settings({ x: { type: 'gizmo', value: 1 } }, { container, controls: { gizmo } })
  ok(made, 'custom control was invoked')
  state[Symbol.dispose]()
  container.remove()
})

// ─────────────────────────────────────────────────────────────────────────────
// PERSIST
// ─────────────────────────────────────────────────────────────────────────────

test('persist: restores falsy values (false, 0)', async () => {
  localStorage.clear()
  const c1 = document.createElement('div')
  document.body.appendChild(c1)
  const s1 = settings({ flag: true, level: 5 }, { container: c1, persist: 'test-falsy' })
  await tick()
  s1.flag = false
  s1.level = 0
  await tick()
  s1[Symbol.dispose]()
  c1.remove()

  const c2 = document.createElement('div')
  document.body.appendChild(c2)
  const s2 = settings({ flag: true, level: 5 }, { container: c2, persist: 'test-falsy' })
  is(s2.flag, false)
  is(s2.level, 0)
  s2[Symbol.dispose]()
  c2.remove()
  localStorage.clear()
})

// ─────────────────────────────────────────────────────────────────────────────
// SEPARATOR (structural)
// ─────────────────────────────────────────────────────────────────────────────

test('separator: structural — renders but creates no state key', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings({ a: 1, div: { type: 'separator' }, b: 2 }, { container })
  is(Object.keys(state).includes('div'), false)  // no state key for the divider
  is(JSON.stringify(state), '{"a":1,"b":2}')
  is(state.a, 1)
  is(state.b, 2)
  ok(container.querySelector('.s-separator'), 'divider rendered')
  state[Symbol.dispose]()
  container.remove()
})

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

test('effect: exported from settings-panel', () => {
  ok(typeof effect === 'function')
})

test('signal: exported from settings-panel', () => {
  ok(typeof signal === 'function')
})
