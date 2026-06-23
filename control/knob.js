/**
 * Knob control — a rotary dial over a 270° arc. value: number.
 *
 * Drag vertically (up = increase) or use arrow keys. opts: min, max, step,
 * unit, startAngle (default −135), endAngle (default +135).
 */

import control from './control.js'
import { computed } from '../signals.js'

const template = `
  <span class="s-knob-wrap" :onpointerdown="grab" tabindex="0" :onkeydown.arrow.prevent="key">
    <span class="s-knob-dial" :style="knobStyle"><i></i></span>
    <span class="s-knob-val" :text="display"></span>
  </span>
`

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export default (sig, opts = {}) => {
  const { min = 0, max = 1, step, unit = '', startAngle = -135, endAngle = 135, ...rest } = opts
  const prec = step ? (String(step).split('.')[1] || '').length : 2

  const angle = computed(() => startAngle + clamp((sig.value - min) / (max - min), 0, 1) * (endAngle - startAngle))
  const knobStyle = computed(() => `transform: rotate(${angle.value.toFixed(1)}deg)`)
  const display = computed(() => (step ? sig.value.toFixed(prec) : +(+sig.value).toFixed(2)) + unit)

  const set = v => {
    let nv = clamp(v, min, max)
    if (step) nv = Math.round(nv / step) * step
    sig.value = +nv.toFixed(6)
  }

  let startY, startV
  const move = e => set(startV + ((startY - e.clientY) / 150) * (max - min))
  const stop = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', stop) }
  const grab = e => {
    startY = e.clientY; startV = sig.value
    addEventListener('pointermove', move); addEventListener('pointerup', stop)
    e.currentTarget.focus(); e.preventDefault()
  }
  const key = e => {
    const s = (step || (max - min) / 100) * (e.shiftKey ? 10 : 1)
    set(sig.value + (e.key === 'ArrowUp' || e.key === 'ArrowRight' ? s : -s))
  }

  return control(sig, { ...rest, type: 'knob', template, knobStyle, display, grab, key, dispose: () => stop() })
}
