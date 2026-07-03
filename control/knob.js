/**
 * Knob control — a rotary dial over a 270° arc. value: number.
 *
 * Drag vertically (up = increase) or use arrow keys. opts: min, max, step,
 * unit, startAngle (default −135), endAngle (default +135),
 * mode: 'linear' (default, vertical drag) | 'circular' (value follows the
 * pointer's angle around the dial, hardware-knob style).
 */

import control from './control.js'
import { clamp, stepMul, decimals } from './util.js'
import { computed } from '../signals.js'

const template = `
  <span class="s-knob-wrap" :onpointerdown="grab" tabindex="0" :onkeydown.arrow.prevent="key">
    <span class="s-knob-dial" :style="knobStyle"><i></i></span>
    <span class="s-knob-val" :text="display"></span>
  </span>
`

export default (sig, opts = {}) => {
  const { min = 0, max = 1, step, unit = '', startAngle = -135, endAngle = 135, mode = 'linear', ...rest } = opts
  const prec = decimals(step, 2)

  const angle = computed(() => startAngle + clamp((sig.value - min) / (max - min), 0, 1) * (endAngle - startAngle))
  const knobStyle = computed(() => `transform: rotate(${angle.value.toFixed(1)}deg)`)
  const display = computed(() => (step ? sig.value.toFixed(prec) : +(+sig.value).toFixed(2)) + unit)

  const set = v => {
    let nv = clamp(v, min, max)
    if (step) nv = Math.round(nv / step) * step
    sig.value = +nv.toFixed(6)
  }

  let startY, startV, cx, cy
  // circular: value follows the pointer's angle around the dial center
  // (0° at top, clockwise); angles clamp to the arc, splitting at the bottom gap
  const moveC = e => {
    const a = clamp(Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180 / Math.PI, startAngle, endAngle)
    set(min + (a - startAngle) / (endAngle - startAngle) * (max - min))
  }
  const move = e => set(startV + ((startY - e.clientY) / 150) * (max - min))
  const stop = () => {
    removeEventListener('pointermove', move); removeEventListener('pointermove', moveC)
    removeEventListener('pointerup', stop)
  }
  const grab = e => {
    if (mode === 'circular') {
      const r = e.currentTarget.getBoundingClientRect()
      cx = r.x + r.width / 2; cy = r.y + r.height / 2
      moveC(e)
      addEventListener('pointermove', moveC)
    } else {
      startY = e.clientY; startV = sig.value
      addEventListener('pointermove', move)
    }
    addEventListener('pointerup', stop)
    e.currentTarget.focus(); e.preventDefault()
  }
  const key = e => {
    const s = (step || (max - min) / 100) * stepMul(e)
    set(sig.value + (e.key === 'ArrowUp' || e.key === 'ArrowRight' ? s : -s))
  }

  return control(sig, { ...rest, type: 'knob', template, knobStyle, display, grab, key, dispose: () => stop() })
}
