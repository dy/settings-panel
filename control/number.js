/**
 * Number control - numeric input with stepper
 */

import control from './control.js'

const template = `
  <button class="s-step s-dec" :onclick="dec" :disabled="value <= min">−</button>
  <input type="number" :value="value" :min="min" :max="max" :step="step" :oninput="e => set(+e.target.value)" />
  <button class="s-step s-inc" :onclick="inc" :disabled="value >= max">+</button>
`

export default (sig, opts = {}) => {
  const { min = -Infinity, max = Infinity, step = 1, ...rest } = opts
  const clamp = v => Math.min(max, Math.max(min, v))

  return control(sig, {
    ...rest,
    type: 'number', template, min, max, step,
    set: v => { sig.value = clamp(v) },
    inc: () => { sig.value = clamp(sig.value + step) },
    dec: () => { sig.value = clamp(sig.value - step) }
  })
}
