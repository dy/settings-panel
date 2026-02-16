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
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

test('effect: exported from settings-panel', () => {
  ok(typeof effect === 'function')
})

test('signal: exported from settings-panel', () => {
  ok(typeof signal === 'function')
})
