/**
 * Separator — a visual divider between control groups. Structural; holds no value.
 *
 * Usage: `divider: { type: 'separator' }` or `{ type: 'separator', label: 'Advanced' }`.
 */

import { resolveEl } from './util.js'

export default ({ label, container } = {}) => {
  const el = document.createElement('div')
  el.className = label ? 's-control s-separator s-separator-labeled' : 's-control s-separator'
  if (label) {
    const span = document.createElement('span')
    span.className = 's-separator-label'
    span.textContent = label
    el.appendChild(span)
  }
  if (container) resolveEl(container)?.appendChild(el)
  return { el, [Symbol.dispose]() { el.remove() } }
}
