/**
 * Folder — visual-only collapsible group
 * No store, no children. Just a DOM wrapper with open/close.
 */

import sprae, { signal } from 'sprae'

const tmpl = `
  <details class="s-control s-folder" :open="_open">
    <summary class="s-label" :onclick="toggle" :text="label"></summary>
    <div class="s-content"></div>
  </details>
`

export default ({ label, collapsed = false, container }) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = tmpl
  const _open = signal(!collapsed)
  const toggle = (e) => { e.preventDefault(); _open.value = !_open.value }
  sprae(wrapper, { label, _open, toggle })

  const el = wrapper.firstElementChild
  const content = el.querySelector('.s-content')

  if (container) {
    const target = typeof container === 'string'
      ? document.querySelector(container)
      : container
    target?.appendChild(el)
  }

  return { el, content, [Symbol.dispose]() { el?.remove() } }
}
