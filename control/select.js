/**
 * Select control - dropdown, radio, buttons
 */

import control from './control.js'

const templates = {
  dropdown: `
    <select :value="value" :onchange="e => set(e.target.value)">
      <option :each="opt in options" :value="opt.value" :selected="opt.value == value" :text="opt.label"></option>
    </select>
  `,
  radio: `
    <label :each="opt in options" :class="{ selected: opt.value == value }">
      <input type="radio" :name="radioName" :value="opt.value" :checked="opt.value == value" :onchange="() => set(opt.value)" />
      <span :text="opt.label"></span>
    </label>
  `,
  buttons: `
    <button
      :each="opt in options"
      :class="{ selected: multiple ? (value || []).includes(opt.value) : opt.value == value }"
      :onclick="(e) => { e.preventDefault(); toggle(opt.value) }"
      :text="opt.label"
    ></button>
  `
}

const normalizeOptions = opts =>
  (opts || []).map(o => typeof o === 'string' ? { value: o, label: o } : o)

export default (sig, opts = {}) => {
  const { variant = 'dropdown', multiple = false, options: rawOptions = [], ...rest } = opts
  const options = normalizeOptions(rawOptions)
  const radioName = `s-${Math.random().toString(36).slice(2)}`

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
