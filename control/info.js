/**
 * Info / monitor — read-only display of a (possibly live) signal value.
 *
 * Usage: `fps: { type: 'info', value: fpsSignal }` or `{ type: 'info', value: 0, format: v => v + ' fps' }`.
 * No write-back — it reflects the value, themes style it as a readout.
 */

import control from './control.js'
import { computed } from '../signals.js'

const template = `<output class="s-monitor" :text="display"></output>`

export default (sig, opts = {}) => {
  const { format, ...rest } = opts
  // With a format fn → derived text; otherwise the signal itself (sprae unwraps + tracks it).
  const display = typeof format === 'function' ? computed(() => format(sig.value)) : sig
  return control(sig, { ...rest, type: 'info', template, display })
}
