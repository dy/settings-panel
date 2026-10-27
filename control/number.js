/**
 * Number control - numeric input; its label drags the value
 *
 * The field carries --chars, its value's length, for a theme that sizes the field to its value (a number input
 * ignores field-sizing).
 */

import control from './control.js'
import { scrub, clamp } from './util.js'

const template = `
  <input type="number" :id="id" :name="label || null" :class="{ 's-scrub': scrub }" :style="'--chars:' + String(value).length" :value="value" :min="min" :max="max" :step="step" :oninput="e => set(+e.target.value)" :onpointerdown="scrub" />
  <span class="s-step">
    <button class="s-step-up" tabindex="-1" :onclick="() => set(value.valueOf() + step)">&#x25B4;</button>
    <button class="s-step-down" tabindex="-1" :onclick="() => set(value.valueOf() - step)">&#x25BE;</button>
  </span>
`

export default (sig, opts = {}) => {
  const { min = -Infinity, max = Infinity, step = 1, scrub: scrubOpt = false, ...rest } = opts
  const set = v => { sig.value = clamp(v, min, max) }
  const drag = scrub(() => sig.value, set, step)

  const result = control(sig, {
    ...rest,
    type: 'number', template, value: sig, step,
    min: Number.isFinite(min) ? min : null,  // omit ±Infinity from min/max attrs
    max: Number.isFinite(max) ? max : null,
    set,
    // opt-in: bare number fields don't scrub in most native UIs (text-select wins)
    scrub: scrubOpt ? drag : null
  })
  // the label always scrubs, as does the field's own frame (a theme's grip glyph): neither competes with text selection
  result.el.querySelector('.s-label-group').addEventListener('pointerdown', drag)
  result.el.querySelector('.s-input').addEventListener('pointerdown', e => e.target === e.currentTarget && drag(e))
  return result
}
