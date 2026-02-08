/**
 * Base control utilities
 */

import sprae from 'sprae'

/**
 * Create a control that wraps a signal
 * @param {Signal} sig - source signal
 * @param {object} opts - { type, template, container?, dispose?, ...state }
 */
export default function control(sig, opts) {
  const {
    type = 'text', template, container, label = '', hint = '', title = '', dispose,
    // Build context (passed by folder, not used by leaf controls)
    controls, children,
    ...state
  } = opts

  // Split type into base + variant classes
  const [base, ...variants] = type.split(/\s+/)
  const classes = ['s-control', `s-${base}`, ...variants].join(' ')

  const wrapper = document.createElement('div')

  wrapper.innerHTML = `<label class="${classes}">
      <span class="s-label-group" :hidden="!label && !hint">
        <span class="s-label" :text="label" :hidden="!label" :title="title"></span>
        <span class="s-hint" :text="hint" :hidden="!hint"></span>
      </span>
      <span class="s-input"></span>
    </label>`
  wrapper.querySelector('.s-input').innerHTML = template

  const el = wrapper.firstElementChild
  if (label) el.dataset.name = label

  sprae(wrapper, { ...state, label, hint, title })

  // Mount if container provided
  if (container) {
    const target = typeof container === 'string'
      ? document.querySelector(container)
      : container
    target?.appendChild(el)
  }

  return Object.assign(sig, {
    el,
    [Symbol.dispose]() {
      dispose?.()
      el?.remove()
    }
  })
}
