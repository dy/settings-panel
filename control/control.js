/**
 * Base control utilities
 */

import sprae from 'sprae'
import { resolveEl } from './util.js'

/**
 * Create a control that wraps a signal
 * @param {Signal} sig - source signal
 * @param {object} opts - { type, template, container?, dispose?, ...state }
 */
// Ids pair a label with its field (for) and its ? with its title text (aria-describedby)
let ids = 0, tips = 0

export default function control(sig, opts) {
  const {
    type = 'text', template, container, label = '', hint = '', title = '', disabled = false, dispose, style, inputTag = 'div',
    ...state
  } = opts

  // Split type into base + variant classes
  const [base, ...variants] = type.split(/\s+/)
  const classes = ['s-control', `s-${base}`, ...variants.map(v => `s-${v}`)].join(' ')

  const wrapper = document.createElement('div')

  wrapper.innerHTML = `<div class="${classes}">
      <label class="s-label-group" :for="label ? id : null" :hidden="label === false && !hint && !title">
        <span class="s-label-row">
          <span class="s-label" :text="label" :hidden="!label"></span>
          <span class="s-title" :if="title" tabindex="0" :aria-describedby="tipId" data-tip>?</span>
          <span class="s-title-text" :if="title" role="tooltip" :id="tipId" :text="title"></span>
        </span>
        <span class="s-hint" :if="hint" :text="hint"></span>
      </label>
      <${inputTag} class="s-input" :inert="disabled"></${inputTag}>
    </div>`
  wrapper.querySelector('.s-input').innerHTML = template

  const el = wrapper.firstElementChild
  if (label) el.dataset.name = label
  if (style) el.setAttribute('style', style)

  sprae(wrapper, { ...state, id: `s-field-${++ids}`, label, hint, title, disabled, tipId: title ? `s-tip-${++tips}` : null })

  // Mount if container provided
  if (container) resolveEl(container)?.appendChild(el)

  return Object.assign(sig, {
    el,
    [Symbol.dispose]() {
      dispose?.()
      wrapper[Symbol.dispose]?.()  // release sprae reactive subscriptions
      el?.remove()
    }
  })
}
