import './register.js'
import test, { is, ok } from 'tst'
import settings, { effect, signal } from '../index.js'

// ─────────────────────────────────────────────────────────────────────────────
// ONCHANGE CALLBACK
// ─────────────────────────────────────────────────────────────────────────────

test('onchange: fires on state change', () => {
  let last = null
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings(
    { volume: 0.5 },
    { container, onchange: s => { last = { ...s } } }
  )

  state.volume = 0.8
  is(last.volume, 0.8)

  state[Symbol.dispose]()
  container.remove()
})

test('onChange: camelCase also works', () => {
  let called = false
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings(
    { enabled: true },
    { container, onChange: () => { called = true } }
  )

  state.enabled = false
  ok(called)

  state[Symbol.dispose]()
  container.remove()
})

test('onchange: receives full state', () => {
  let last = null
  const container = document.createElement('div')
  document.body.appendChild(container)
  const state = settings(
    { a: 1, b: 2 },
    { container, onchange: s => { last = s } }
  )

  state.a = 10
  is(last.a, 10)
  is(last.b, 2)

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
