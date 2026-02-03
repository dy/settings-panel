/**
 * Slider control - linear, log, range
 */

import sprae, { signal } from 'sprae'

const template = `
  <label class="s-control s-slider">
    <span class="s-label" :text="label"></span>
    <span class="s-input">
      <input
        type="range"
        :value="_display"
        :min="displayMin"
        :max="displayMax"
        :step="displayStep"
        :oninput="e => updateFromDisplay(+e.target.value)"
      />
      <span class="s-value" :text="formatted"></span>
    </span>
  </label>
`

class SSlider extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const key = this.getAttribute('key')
    const label = this.getAttribute('label') || key
    const min = +this.getAttribute('min') || 0
    const max = +this.getAttribute('max') || 100
    const step = +this.getAttribute('step') || 1
    const scale = this.getAttribute('scale') || 'linear'

    const isLog = scale === 'log'
    const logMin = isLog ? Math.log(Math.max(min, 1e-10)) : min
    const logMax = isLog ? Math.log(max) : max

    this.innerHTML = template

    const el = this
    const _val = signal(min)
    const _display = signal(isLog ? 0 : min)
    
    const toDisplay = (v) => isLog ? ((Math.log(Math.max(v, 1e-10)) - logMin) / (logMax - logMin)) * 1000 : v
    const fromDisplay = (d) => isLog ? Math.exp(logMin + (d / 1000) * (logMax - logMin)) : d
    const format = (v) => v >= 1000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3)
    
    sprae(this, {
      label,
      displayMin: isLog ? 0 : min,
      displayMax: isLog ? 1000 : max,
      displayStep: isLog ? 1 : step,
      _display,
      get formatted() { return format(_val.value) },
      updateFromDisplay(displayVal) {
        _display.value = displayVal
        const val = Math.min(max, Math.max(min, fromDisplay(displayVal)))
        _val.value = val
        if (el._store) el._store[key] = val
      }
    })
    
    this._sync = () => { 
      const v = el._store?.[key] ?? min
      _val.value = v
      _display.value = toDisplay(v)
    }
  }

  set state(s) { 
    this._store = s
    this._sync?.()
  }
  get state() { return this._store }
}

customElements.define('s-slider', SSlider)
