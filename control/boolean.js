/**
 * Boolean control - checkbox, toggle, switch
 */

import sprae, { signal } from 'sprae'

const template = `
  <label class="s-control s-boolean" :class="{ checked: _val }">
    <span class="s-label" :text="label"></span>
    <span class="s-input">
      <input
        type="checkbox"
        :checked="_val"
        :onchange="e => update(e.target.checked)"
      />
      <span class="s-toggle"></span>
    </span>
  </label>
`

class SBoolean extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const key = this.getAttribute('key')
    const label = this.getAttribute('label') || key
    const variant = this.getAttribute('variant') || 'toggle'

    this.classList.add(`s-${variant}`)
    this.innerHTML = template

    const el = this
    const _val = signal(false)
    
    sprae(this, {
      label,
      _val,
      update(val) { 
        _val.value = val
        if (el._store) el._store[key] = val 
      }
    })
    
    this._sync = () => { _val.value = el._store?.[key] ?? false }
  }

  set state(s) { 
    this._store = s
    this._sync?.()
  }
  get state() { return this._store }
}

customElements.define('s-boolean', SBoolean)
