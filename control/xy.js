/**
 * XY pad control — a 2D draggable crosshair. value: [x, y].
 *
 * opts: min, max, step (scalar or per-axis [x, y]). Y is screen-inverted
 * (up = larger), matching how pads read in graphics/audio tools.
 */

import control from './control.js'
import { computed } from '../signals.js'

const template = `
  <div class="s-pad" :onpointerdown="grab" tabindex="0" :onkeydown.arrow.prevent="key">
    <span class="s-pad-x"></span>
    <span class="s-pad-y"></span>
    <span class="s-pad-dot" :style="dot"></span>
  </div>
`

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const ax = (v, i, d) => Array.isArray(v) ? (v[i] ?? d) : (v ?? d)

export default (sig, opts = {}) => {
  const minX = ax(opts.min, 0, 0), maxX = ax(opts.max, 0, 1)
  const minY = ax(opts.min, 1, 0), maxY = ax(opts.max, 1, 1)
  const stepX = ax(opts.step, 0, null), stepY = ax(opts.step, 1, null)
  const snap = (v, s) => s ? Math.round(v / s) * s : v
  const clean = v => +v.toFixed(4)
  const { dispose, ...rest } = opts

  const dot = computed(() => {
    const [x, y] = sig.value || [0, 0]
    const px = clamp((x - minX) / (maxX - minX), 0, 1) * 100
    const py = (1 - clamp((y - minY) / (maxY - minY), 0, 1)) * 100
    return `left:${px}%; top:${py}%`
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

  const key = e => {
    const [x, y] = sig.value || [0, 0]
    const sx = stepX || (maxX - minX) / 100, sy = stepY || (maxY - minY) / 100
    const k = e.key
    sig.value = [
      clean(clamp(x + (k === 'ArrowRight' ? sx : k === 'ArrowLeft' ? -sx : 0), minX, maxX)),
      clean(clamp(y + (k === 'ArrowUp' ? sy : k === 'ArrowDown' ? -sy : 0), minY, maxY)),
    ]
  }

  return control(sig, { ...rest, type: 'xy', template, dot, grab, key, dispose: () => { stop(); dispose?.() } })
}
