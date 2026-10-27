/**
 * Text control - single line input
 *
 * A theme that declares `.s-text { --s-text-wrap: wrap }` gets a one-row textarea instead:
 * a long value wraps, Enter starts a new line, and the row grows (DialKit's text).
 */

import control from './control.js'
import { signal } from '../signals.js'

const template = `
  <input type="text" :if="!wrap" :id="id" :name="label || null" :value="value" :placeholder="placeholder" :oninput="e => set(e.target.value)" />
  <textarea :else rows="1" :id="id" :name="label || null" :value="value" :placeholder="placeholder" :oninput="e => set(e.target.value)"></textarea>
`

export default (sig, opts = {}) => {
  const { placeholder = '', ...rest } = opts
  const wrap = signal(false)
  const result = control(sig, { ...rest, type: 'text', template, value: sig, set: v => { sig.value = v }, placeholder, wrap })

  // el is in live DOM (panel mounted before controls): read the theme's choice once
  if (result.el.isConnected && getComputedStyle(result.el).getPropertyValue('--s-text-wrap').trim() === 'wrap') wrap.value = true

  return result
}
