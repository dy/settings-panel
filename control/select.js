/**
 * Select control - dropdown, radio, buttons
 */

import control from './control.js'

const templates = {
  dropdown: `
    <select :id="label || null" :name="label || null" :value="value" :onchange="e => set(e.target.value)">
      <option :each="opt in options" :value="opt.value" :selected="opt.value == value" :text="opt.label"></option>
    </select>
  `,
  radio: `
    <label :each="opt in options" :style="opt.style || null" :class="{ 's-selected': opt.value == value }">
      <input type="radio" :name="label || radioName" :value="opt.value" :checked="opt.value == value" :onchange="set(opt.value)" />
      <span :text="opt.label"></span>
    </label>
  `,
  segmented: `
    <button
      :each="opt in options"
      :style="opt.style || null"
      :class="{ 's-selected': multiple ? (value || []).includes(opt.value) : opt.value == value }"
      :onclick="toggle(opt.value)"
      :text="opt.label"
    ></button>
  `,
  checkboxes: `
    <label :each="opt in options" :style="opt.style || null">
      <input type="checkbox" :name="label || null" :checked="(value || []).includes(opt.value)" :onchange="toggle(opt.value)" />
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

  if (multiple && variant === 'dropdown') console.warn('[settings-panel] select multiple is not supported for the dropdown variant — use segmented or checkboxes')

  // <select> yields the option value as a DOM string; restore the original typed value.
  const typed = v => { const o = options.find(o => String(o.value) === String(v)); return o ? o.value : v }

  const toggle = v => {
    if (!multiple) { sig.value = typed(v); return }
    const arr = [...(sig.value || [])]
    const i = arr.indexOf(v)
    i < 0 ? arr.push(v) : arr.splice(i, 1)
    sig.value = arr
  }

  return control(sig, {
    ...rest,
    type: `select ${variant}`,
    template: templates[variant] || templates.dropdown,
    value: sig, set: v => { sig.value = typed(v) },
    multiple, toggle,
    options, radioName
  })
}
