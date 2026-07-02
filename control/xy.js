/**
 * XY pad control — a 2D draggable crosshair. value: [x, y].
 *
 * opts: min, max, step (scalar or per-axis [x, y]), readout (false | true | fn),
 * format. Y is screen-inverted (up = larger), matching how pads read in
 * graphics/audio tools; pass min > max to flip an axis (screen-style Y:
 * min: [0, 1], max: [1, 0]) — direction lives in the sign of max − min.
 *
 * The pad widget (template + behavior) is exported for embedding in other
 * controls — vector uses it for its expandable 2D picker.
 */

import control from './control.js'
import { clamp, axis } from './util.js'
import { computed } from '../signals.js'

export const padTemplate = (attrs = '') => `
  <div class="s-pad"${attrs} :style="vars" :onpointerdown="grab" tabindex="0" :onkeydown.arrow.prevent="key">
    <span class="s-pad-x"></span>
    <span class="s-pad-y"></span>
    <span class="s-pad-dot"></span>
  </div>
`

/** Pad behavior over a [x, y] signal → { vars, grab, key, stop } (sprae state + cleanup). */
export const padState = (sig, opts = {}) => {
  const minX = axis(opts.min, 0, 0), maxX = axis(opts.max, 0, 1)
  const minY = axis(opts.min, 1, 0), maxY = axis(opts.max, 1, 1)
  const stepX = axis(opts.step, 0), stepY = axis(opts.step, 1)
  const snap = (v, s) => s ? Math.round(v / s) * s : v
  const clean = v => +v.toFixed(4)

  // --x/--y position the dot (base CSS) and drive theme crosshair lines;
  // --angle/--dist describe the center→point vector (CSS trig can't consume
  // percentage vars, so themes drawing a connector line get it precomputed)
  const vars = computed(() => {
    const [x, y] = sig.value || [0, 0]
    const px = clamp((x - minX) / (maxX - minX), 0, 1) * 100
    const py = (1 - clamp((y - minY) / (maxY - minY), 0, 1)) * 100
    const angle = +Math.atan2(py - 50, px - 50).toFixed(4)
    const dist = +Math.hypot(px - 50, py - 50).toFixed(2)
    return `--x:${px}%; --y:${py}%; --angle:${angle}rad; --dist:${dist}%`
  })

  let rect
  const fromEvent = e => {
    const fx = clamp((e.clientX - rect.left) / rect.width, 0, 1)
    const fy = clamp((e.clientY - rect.top) / rect.height, 0, 1)
    sig.value = [
      clean(snap(minX + fx * (maxX - minX), stepX)),
      clean(snap(minY + (1 - fy) * (maxY - minY), stepY)),
    ]
  }
  const move = e => fromEvent(e)
  const stop = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', stop) }
  const grab = e => {
    rect = e.currentTarget.getBoundingClientRect()
    fromEvent(e)
    addEventListener('pointermove', move)
    addEventListener('pointerup', stop)
    e.currentTarget.focus()
    e.preventDefault()
  }

  const [loX, hiX] = minX < maxX ? [minX, maxX] : [maxX, minX]
  const [loY, hiY] = minY < maxY ? [minY, maxY] : [maxY, minY]
  const key = e => {
    const [x, y] = sig.value || [0, 0]
    // explicit steps are magnitudes — arrow direction follows the axis (sign of max − min)
    const sx = (stepX || Math.abs(maxX - minX) / 100) * Math.sign(maxX - minX || 1)
    const sy = (stepY || Math.abs(maxY - minY) / 100) * Math.sign(maxY - minY || 1)
    const k = e.key
    sig.value = [
      clean(clamp(x + (k === 'ArrowRight' ? sx : k === 'ArrowLeft' ? -sx : 0), loX, hiX)),
      clean(clamp(y + (k === 'ArrowUp' ? sy : k === 'ArrowDown' ? -sy : 0), loY, hiY)),
    ]
  }

  return { vars, grab, key, stop }
}

export default (sig, opts = {}) => {
  const { dispose, readout = false, format = ([x, y]) => x + ',' + y, ...rest } = opts
  const { vars, grab, key, stop } = padState(sig, opts)
  const readoutText = typeof readout === 'function' ? readout : format
  const display = computed(() => readoutText(sig.value || [0, 0]))
  const template = padTemplate() + (readout ? `<span class="s-pad-val" :text="display"></span>` : '')
  return control(sig, { ...rest, type: 'xy', template, vars, grab, key, display, dispose: () => { stop(); dispose?.() } })
}
