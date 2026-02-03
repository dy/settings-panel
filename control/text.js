/**
 * Text control - single line input
 */

import sprae from 'sprae'
import { signal, effect } from 'sprae'

const template = `
  <label class="s-control s-text">
    <span class="s-label" :text="label"></span>
    <span class="s-input">
      <input type="text" :value="_val" :placeholder="placeholder" :oninput="e => update(e.target.value)" />
    </span>
  </label>
`

class SText extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const key = this.getAttribute('key')
    const label = this.getAttribute('label') || key
    const placeholder = this.getAttribute('placeholder') || ''

    this.innerHTML = template

    const el = this
    const _val = signal('')
    
    sprae(this, {
      label,
      placeholder,
      _val,
      update(val) { 
        _val.value = val
        if (el._store) el._store[key] = val 
      }
    })
    
    // Sync from store
    this._sync = () => { _val.value = el._store?.[key] ?? '' }
  }

  set state(s) { 
    this._store = s
    this._sync?.()
  }
  get state() { return this._store }
}

customElements.define('s-text', SText)
