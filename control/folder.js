/**
 * Folder control - collapsible group
 */

import sprae from 'sprae'

const template = `
  <details class="s-control s-folder" :open="open">
    <summary class="s-label" :onclick="e => { e.preventDefault(); toggle() }" :text="label"></summary>
    <div class="s-content"></div>
  </details>
`

class SFolder extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const label = this.getAttribute('label') || 'Group'
    const collapsed = this.hasAttribute('collapsed')

    this.innerHTML = template

    sprae(this, {
      label,
      open: !collapsed,
      toggle() { this.open = !this.open }
    })

    this._content = this.querySelector('.s-content')
  }

  get content() { return this._content }

  set state(s) { this._store = s }
  get state() { return this._store }
}

customElements.define('s-folder', SFolder)
