/**
 * Text control - single line input
 */

import control from './control.js'

const template = `<input type="text" :id="label || null" :name="label || null" :value="value" :placeholder="placeholder" />`

export default (sig, opts = {}) => {
  const { placeholder = '', ...rest } = opts
  return control(sig, { ...rest, type: 'text', template, value: sig, placeholder })
}
