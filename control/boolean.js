/**
 * Boolean control - toggle, checkbox, switch
 */

import control from './control.js'

const template = `
  <label>
    <input type="checkbox" :id="label || null" :checked="value" :onchange="e => set(e.target.checked)" />
    <span class="s-track"></span>
  </label>
`

export default (sig, opts = {}) => {
  const { variant = 'toggle', ...rest } = opts
  return control(sig, { ...rest, type: `boolean ${variant}`, template, value: sig, set: v => { sig.value = v } })
}
