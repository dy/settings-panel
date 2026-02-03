/**
 * Color control - picker, swatches, palette
 */

import sprae, { signal } from 'sprae'

const templates = {
  picker: `
    <label class="s-control s-color s-picker">
      <span class="s-label" :text="label"></span>
      <span class="s-input">
        <input type="color" :value="_val" :oninput="e => update(e.target.value)" />
        <span class="s-preview" :style="'background:' + _val"></span>
        <span class="s-hex" :text="_val"></span>
      </span>
    </label>
  `,
  swatches: `
    <fieldset class="s-control s-color s-swatches">
      <legend class="s-label" :text="label"></legend>
      <span class="s-input">
        <button
          :each="c in colors"
          :class="{ selected: c === _val }"
          :style="'background:' + c"
          :onclick="() => update(c)"
          :title="c"
        ></button>
      </span>
    </fieldset>
  `
}

const defaultColors = [
  '#ff0000', '#ff8000', '#ffff00', '#80ff00',
  '#00ff00', '#00ff80', '#00ffff', '#0080ff',
  '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
  '#ffffff', '#c0c0c0', '#808080', '#000000'
]

class SColor extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const key = this.getAttribute('key')
    const label = this.getAttribute('label') || key
    const variant = this.getAttribute('variant') || 'picker'
    const colorsAttr = this.getAttribute('colors')

    let colors = defaultColors
    if (colorsAttr?.startsWith('[')) {
      colors = JSON.parse(colorsAttr)
    } else if (colorsAttr) {
      colors = colorsAttr.split(',').map(c => c.trim())
    }

    this.innerHTML = templates[variant] || templates.picker

    const el = this
    const _val = signal('#000000')
    
    sprae(this, {
      label,
      colors,
      _val,
      update(val) { 
        _val.value = val
        if (el._store) el._store[key] = val 
      }
    })
    
    this._sync = () => { _val.value = el._store?.[key] ?? '#000000' }
  }

  set state(s) { 
    this._store = s
    this._sync?.()
  }
  get state() { return this._store }
}

customElements.define('s-color', SColor)
