/**
 * Boolean control - toggle, checkbox, switch
 */

import control from './control.js'

const template = `
  <input type="checkbox" :id="label || null" :name="label || null" :checked="value" :onchange="e => set(e.target.checked)" />
  <span class="s-track"></span>
`

export default (sig, opts = {}) => {
  const { variant = 'toggle', ...rest } = opts
  return control(sig, { ...rest, type: `boolean ${variant}`, template, inputTag: 'label', value: sig, set: v => { sig.value = v } })
}
