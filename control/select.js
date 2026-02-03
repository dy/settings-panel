/**
 * Select control - dropdown, radio, buttons
 */

import sprae, { signal } from 'sprae'

const templates = {
  dropdown: `
    <label class="s-control s-select s-dropdown">
      <span class="s-label" :text="label"></span>
      <span class="s-input">
        <select :onchange="e => update(e.target.value)">
          <option :each="opt in options" :value="opt.value" :selected="opt.value === _val" :text="opt.label"></option>
        </select>
      </span>
    </label>
  `,
  radio: `
    <fieldset class="s-control s-select s-radio">
      <legend class="s-label" :text="label"></legend>
      <span class="s-input">
        <label :each="opt in options" :class="{ selected: opt.value === _val }">
          <input type="radio" :name="name" :value="opt.value" :checked="opt.value === _val" :onchange="e => update(e.target.value)" />
          <span :text="opt.label"></span>
        </label>
      </span>
    </fieldset>
  `,
  buttons: `
    <fieldset class="s-control s-select s-buttons">
      <legend class="s-label" :text="label"></legend>
      <span class="s-input">
        <button
          :each="opt in options"
          :class="{ selected: opt.value === _val }"
          :onclick="() => update(opt.value)"
          :text="opt.label"
        ></button>
      </span>
    </fieldset>
  `
}

class SSelect extends HTMLElement {
  connectedCallback() {
    if (this._init) return
    this._init = true

    const key = this.getAttribute('key')
    const label = this.getAttribute('label') || key
    const variant = this.getAttribute('variant') || 'dropdown'
    const optionsAttr = this.getAttribute('options')

    let options = []
    if (optionsAttr?.startsWith('[')) {
      options = JSON.parse(optionsAttr)
    } else if (optionsAttr) {
      options = optionsAttr.split(',').map(v => ({ value: v.trim(), label: v.trim() }))
    }

    this.innerHTML = templates[variant] || templates.dropdown

    const el = this
    const _val = signal(options[0]?.value ?? '')
    
    sprae(this, {
      label,
      options,
      name: `s-${key}-${Math.random().toString(36).slice(2)}`,
      _val,
      update(val) { 
        _val.value = val
        if (el._store) el._store[key] = val 
      }
    })
    
    this._sync = () => { _val.value = el._store?.[key] ?? options[0]?.value ?? '' }
  }

  set state(s) { 
    this._store = s
    this._sync?.()
  }
  get state() { return this._store }
}

customElements.define('s-select', SSelect)
