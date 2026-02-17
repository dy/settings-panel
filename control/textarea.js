/**
 * Textarea control - multiline text input, auto-grows from rows
 */

import control from './control.js'

const tpl = `<textarea :value="value" :placeholder="placeholder" :readonly="readonly"></textarea>`

export default (sig, opts = {}) => {
  const { placeholder = '', readonly = false, rows = 3, type = 'textarea', ...rest } = opts

  const result = control(sig, { ...rest, type, template: tpl, value: sig, placeholder, readonly })
  const ta = result.el.querySelector('textarea')
  ta.rows = rows

  return result
}
