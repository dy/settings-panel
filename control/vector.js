/**
 * Vector control — multiple numeric values as inline axis inputs (X/Y/Z/W).
 *
 * value: number[]  ·  opts: dimensions, labels (or false), min, max, step
 * (each of min/max/step may be a scalar or a per-axis array),
 * pad (2D only) — expandable XY-pad picker, tweakpane point2d style.
 */

import control from './control.js'
import { axis } from './util.js'
import { padTemplate, padState } from './xy.js'
import { signal } from '../signals.js'

const axesTemplate = `
  <span class="s-vec-axis" :each="d in dims">
    <label class="s-vec-label" :text="d.label" :hidden="!d.label"></label>
    <input type="number" :value="vals[d.i]" :min="d.min" :max="d.max" :step="d.step" :onchange="e => setAt(d.i, e.target.value)" />
  </span>
`

const expandTemplate = `
  <button type="button" class="s-vec-expand" :class="{'s-open': padOpen}" :onclick="() => padOpen = !padOpen" aria-label="Toggle 2D pad"></button>
`

export default (sig, opts = {}) => {
  const arr = Array.isArray(sig.value) ? sig.value : [0, 0]
  const n = opts.dimensions || arr.length
  const labels = opts.labels === false ? [] : (opts.labels || ['X', 'Y', 'Z', 'W'])
  const { dimensions, labels: _l, pad, dispose, ...rest } = opts

  const dims = Array.from({ length: n }, (_, i) => ({
    i,
    label: labels[i] ?? '',
    min: axis(opts.min, i),
    max: axis(opts.max, i),
    step: axis(opts.step, i) ?? 'any',
  }))

  const clampAt = (i, v) => {
    let mn = axis(opts.min, i), mx = axis(opts.max, i)
    if (mn != null && mx != null && mn > mx) [mn, mx] = [mx, mn]  // flipped axis (min > max)
    if (mn != null) v = Math.max(mn, v)
    if (mx != null) v = Math.min(mx, v)
    return v
  }

  const setAt = (i, raw) => {
    const v = parseFloat(raw)
    if (!Number.isFinite(v)) return
    const next = [...(sig.value || [])]
    next[i] = clampAt(i, v)
    sig.value = next
  }

  // Expandable XY-pad picker (2D vectors only) — shares the xy control's widget
  const withPad = pad && n === 2
  const padExtras = withPad ? { padOpen: signal(false), ...padState(sig, opts) } : null
  const template = withPad
    ? expandTemplate + axesTemplate + padTemplate(' :if="padOpen"')
    : axesTemplate

  return control(sig, {
    ...rest, type: 'vector', template, dims, vals: sig, setAt, ...padExtras,
    dispose: () => { padExtras?.stop(); dispose?.() }
  })
}
