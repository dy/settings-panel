/**
 * Number control - numeric input
 */

import control from './control.js'

const template = `
  <input type="number" :id="label || null" :name="label || null" :value="value" :min="min" :max="max" :step="step" :oninput="e => set(+e.target.value)" />
  <span class="s-step">
    <button class="s-step-up" tabindex="-1" :onclick="() => set(value.valueOf() + step)">&#x25B4;</button>
    <button class="s-step-down" tabindex="-1" :onclick="() => set(value.valueOf() - step)">&#x25BE;</button>
  </span>
`

export default (sig, opts = {}) => {
  const { min = -Infinity, max = Infinity, step = 1, ...rest } = opts
  const clamp = v => Math.min(max, Math.max(min, v))

  return control(sig, {
    ...rest,
    type: 'number', template, value: sig, min, max, step,
    set: v => { sig.value = clamp(v) }
  })
}
