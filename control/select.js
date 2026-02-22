/**
 * Select control - dropdown, radio, buttons
 */

import control from './control.js'

const templates = {
  dropdown: `
    <select :id="label || null" :value="value" :onchange="e => set(e.target.value)">
      <option :each="opt in options" :value="opt.value" :selected="opt.value == value" :text="opt.label"></option>
    </select>
  `,
  radio: `
    <label :each="opt in options" :class="{ selected: opt.value == value }">
      <input type="radio" :name="radioName" :value="opt.value" :checked="opt.value == value" :onchange="set(opt.value)" />
      <span :text="opt.label"></span>
    </label>
  `,
  buttons: `
    <button
      :each="opt in options"
      :class="{ selected: multiple ? (value || []).includes(opt.value) : opt.value == value }"
      :onclick="toggle(opt.value)"
      :text="opt.label"
    ></button>
  `,
  checkboxes: `
    <label :each="opt in options" :style="opt.style || null">
      <input type="checkbox" :checked="(value || []).includes(opt.value)" :onchange="toggle(opt.value)" />
      <span class="s-track"></span>
      <span :text="opt.label"></span>
    </label>
  `
}

const normalizeOptions = opts =>
  (opts || []).map(o => typeof o === 'string' ? { value: o, label: o } : { label: o.value, ...o })

export default (sig, opts = {}) => {
  let { variant = 'dropdown', multiple = false, options = [], ...rest } = opts
  const radioName = `s-${Math.random().toString(36).slice(2)}`
  options = normalizeOptions(options)

  const toggle = v => {
    if (!multiple) { sig.value = v; return }
    const arr = [...(sig.value || [])]
    const i = arr.indexOf(v)
    i < 0 ? arr.push(v) : arr.splice(i, 1)
    sig.value = arr
  }

  return control(sig, {
    ...rest,
    type: `select ${variant}`,
    template: templates[variant] || templates.dropdown,
    value: sig, set: v => { sig.value = v },
    multiple, toggle,
    options, radioName
  })
}
