/**
 * Folder — visual-only collapsible group
 * No store, no children. Just a DOM wrapper with open/close.
 */

import sprae, { signal } from 'sprae'

const tmplManaged = `
  <details class="s-control s-folder" :class="variant || null" :open="_open">
    <summary class="s-label" :onclick="toggle" :text="label"></summary>
    <div class="s-content"></div>
  </details>
`

const tmplNative = `
  <details class="s-control s-folder" :class="variant || null" :name="name">
    <summary class="s-label" :text="label"></summary>
    <div class="s-content"></div>
  </details>
`

export default ({ label, collapsed = false, name, variant, container }) => {
  const wrapper = document.createElement('div')
  const native = !!name

  wrapper.innerHTML = native ? tmplNative : tmplManaged

  const state = native
    ? { label, name, variant: variant || null }
    : (() => {
      const _open = signal(!collapsed)
      return { label, variant: variant || null, _open, toggle: (e) => { e.preventDefault(); _open.value = !_open.value } }
    })()

  sprae(wrapper, state)

  const el = wrapper.firstElementChild
  if (native && !collapsed) el.open = true
  const content = el.querySelector('.s-content')

  if (container) {
    const target = typeof container === 'string'
      ? document.querySelector(container)
      : container
    target?.appendChild(el)
  }

  return { el, content, [Symbol.dispose]() { el?.remove() } }
}
