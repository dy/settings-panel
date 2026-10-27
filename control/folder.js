/**
 * Folder — visual-only collapsible group
 * No store, no children. Just a DOM wrapper with open/close.
 */

import sprae from 'sprae'
import { signal } from '../signals.js'
import { resolveEl } from './util.js'

const tmplManaged = `
  <details class="s-control s-folder" :class="variantCls || null" :data-key="key" :open="_open">
    <summary class="s-label" :data-key="key" :onclick="toggle" :text="label"></summary>
    <div class="s-content"></div>
  </details>
`

const tmplNative = `
  <details class="s-control s-folder" :class="variantCls || null" :data-key="key" :name="name">
    <summary class="s-label" :data-key="key" :text="label"></summary>
    <div class="s-content"></div>
  </details>
`

export default ({ key = null, label, collapsed = false, name, variant, style, container }) => {
  const wrapper = document.createElement('div')
  const native = !!name

  wrapper.innerHTML = native ? tmplNative : tmplManaged

  const variantCls = variant ? `s-${variant}` : null
  const state = native
    ? { key, label, name, variantCls }
    : (() => {
      const _open = signal(!collapsed)
      return { key, label, variantCls, _open, toggle: (e) => { e.preventDefault(); _open.value = !_open.value } }
    })()

  sprae(wrapper, state)

  const el = wrapper.firstElementChild
  if (style) el.setAttribute('style', style)
  if (native && !collapsed) el.open = true
  const content = el.querySelector('.s-content')

  if (container) resolveEl(container)?.appendChild(el)

  return { el, content, [Symbol.dispose]() { wrapper[Symbol.dispose]?.(); el?.remove() } }
}
