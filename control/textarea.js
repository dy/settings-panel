/**
 * Textarea control - multiline text input
 */

import control from './control.js'

const template = `<textarea :value="value" :placeholder="placeholder" :rows="rows"></textarea>`

export default (sig, opts = {}) => {
  const { placeholder = '', rows = 3, ...rest } = opts
  return control(sig, { ...rest, type: 'textarea', template, value: sig, placeholder, rows })
}
