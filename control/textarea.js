/**
 * Textarea control - multiline text input
 */

import sprae, { signal } from 'sprae'

const template = `
  <label class="s-control s-textarea">
    <span class="s-label" :text="label"></span>
    <span class="s-input">
      <textarea :value="_val" :placeholder="placeholder" :rows="rows" :oninput="e => update(e.target.value)"></textarea>
    </span>
  </label>
`

class STextarea extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const key = this.getAttribute('key')
    const label = this.getAttribute('label') || key
    const placeholder = this.getAttribute('placeholder') || ''
    const rows = this.getAttribute('rows') || 3

    this.innerHTML = template

    const el = this
    const _val = signal('')
    
    sprae(this, {
      label,
      placeholder,
      rows,
      _val,
      update(val) { 
        _val.value = val
        if (el._store) el._store[key] = val 
      }
    })
    
    this._sync = () => { _val.value = el._store?.[key] ?? '' }
  }

  set state(s) { 
    this._store = s
    this._sync?.()
  }
  get state() { return this._store }
}

customElements.define('s-textarea', STextarea)
