/**
 * Textarea control - multiline text input, auto-grows from rows
 */

import control from './control.js'

const tpl = `<textarea :id="label || null" :name="label || null" :rows="rows" :value="value" :placeholder="placeholder" :readonly="readonly" :oninput="e => set(e.target.value)"></textarea>`

export default (sig, opts = {}) => {
  const { placeholder = '', readonly = false, rows = 3, variant, ...rest } = opts

  const type = variant ? `textarea ${variant}` : 'textarea'
  return control(sig, { ...rest, type, template: tpl, value: sig, set: v => { sig.value = v }, placeholder, readonly, rows })
}

