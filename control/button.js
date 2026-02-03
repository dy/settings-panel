/**
 * Button control - action trigger
 */

import sprae from 'sprae'

const template = `
  <div class="s-control s-button">
    <span class="s-label" :text="label"></span>
    <span class="s-input">
      <button :onclick="action" :text="text"></button>
    </span>
  </div>
`

class SButton extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const label = this.getAttribute('label') || ''
    const text = this.getAttribute('text') || 'Action'

    this.innerHTML = template

    const el = this
    sprae(this, {
      label,
      text,
      action() { el._action?.() }
    })
  }

  set onclick(fn) { this._action = fn }
  get onclick() { return this._action }
}

customElements.define('s-button', SButton)
