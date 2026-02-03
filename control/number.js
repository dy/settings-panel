/**
 * Number control - numeric input with optional step
 */

import sprae, { signal } from 'sprae'

const template = `
  <label class="s-control s-number">
    <span class="s-label" :text="label"></span>
    <span class="s-input">
      <button class="s-step s-dec" :onclick="dec" :disabled="_val <= min">−</button>
      <input
        type="number"
        :value="_val"
        :min="min"
        :max="max"
        :step="step"
        :oninput="e => update(+e.target.value)"
      />
      <button class="s-step s-inc" :onclick="inc" :disabled="_val >= max">+</button>
    </span>
  </label>
`

class SNumber extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const key = this.getAttribute('key')
    const label = this.getAttribute('label') || key
    const min = +this.getAttribute('min') || -Infinity
    const max = +this.getAttribute('max') || Infinity
    const step = +this.getAttribute('step') || 1

    this.innerHTML = template

    const el = this
    const _val = signal(0)
    
    sprae(this, {
      label, min, max, step,
      _val,
      update(val) { 
        const clamped = Math.min(max, Math.max(min, val))
        _val.value = clamped
        if (el._store) el._store[key] = clamped
      },
      inc() { this.update(_val.value + step) },
      dec() { this.update(_val.value - step) }
    })
    
    this._sync = () => { _val.value = el._store?.[key] ?? 0 }
  }

  set state(s) { 
    this._store = s
    this._sync?.()
  }
  get state() { return this._store }
}

customElements.define('s-number', SNumber)
