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
      :class="{ selected: opt.value == value }"
      :onclick="() => set(opt.value)"
      :text="opt.label"
    ></button>
  `
}

const normalizeOptions = opts =>
  (opts || []).map(o => typeof o === 'string' ? { value: o, label: o } : o)

export default (sig, opts = {}) => {
  const { variant = 'dropdown', options: rawOptions = [], ...rest } = opts
  const options = normalizeOptions(rawOptions)
  const radioName = `s-${Math.random().toString(36).slice(2)}`

  return control(sig, {
    ...rest,
    type: `select ${variant}`,
    template: templates[variant] || templates.dropdown,
    value: sig, set: v => { sig.value = v },
    options, radioName
  })
}
