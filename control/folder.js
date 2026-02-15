/**
 * Folder control - collapsible group
 * Builds children from schema, state backed by sprae/store
 * When label is empty, renders as plain container (root panel)
 */

import sprae, { signal } from 'sprae'
import store, { _signals } from 'sprae/store'
import { infer } from '../index.js'

const tmpl = `
  <details class="s-control s-folder" :open="_open">
    <summary class="s-label" :onclick="toggle" :text="label"></summary>
    <div class="s-content"></div>
  </details>
`

export default (sig, opts = {}) => {
  const { label, collapsed = false, children, controls, container } = opts

  const wrapper = document.createElement('div')

  // Root (no label) renders as plain div, folder renders as collapsible details
  if (label) {
    wrapper.innerHTML = tmpl
    const _open = signal(!collapsed)
    const toggle = (e) => { e.preventDefault(); _open.value = !_open.value }
    sprae(wrapper, { label, _open, toggle })
  }

  const el = label ? wrapper.firstElementChild : wrapper
  const content = label ? el.querySelector('.s-content') : el
  const disposers = []

  // Build children: collect initial values → store, then bind controls to store signals
  const initials = {}
  const fields = {}
  if (children && controls) {
    for (const [key, def] of Object.entries(children)) {
      const field = infer(key, def)
      fields[key] = field
      initials[key] = field.value ?? null
    }
  }

  const state = store(initials)

  for (const [key, field] of Object.entries(fields)) {
    const factory = controls[field.type]
    if (!factory) { console.warn(`Unknown control type: ${field.type}`); continue }

    const childSig = state[_signals][key]
    const decorated = factory(childSig, {
      ...field,
      controls,
      container: content
    })
    if (decorated.el) decorated.el.dataset.key = key
    disposers.push(decorated[Symbol.dispose])
  }

  // Mount
  if (container) {
    const target = typeof container === 'string'
      ? document.querySelector(container)
      : container
    if (label) {
      target?.appendChild(el)
    } else {
      while (el.firstChild) target.appendChild(el.firstChild)
    }
  }

  sig.value = state

  return Object.assign(sig, {
    el: label ? el : container,
    [Symbol.dispose]() {
      disposers.forEach(d => d?.())
      if (label) el?.remove()
    }
  })
}
