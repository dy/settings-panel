/**
 * Vector control — multiple numeric values as inline axis inputs (X/Y/Z/W).
 *
 * value: number[]  ·  opts: dimensions, labels (or false), min, max, step
 * (each of min/max/step may be a scalar or a per-axis array),
 * pad (2D only) — expandable XY-pad picker, tweakpane point2d style; 'open' starts it shown. It is the xy control's
 * pad, on a line of its own (.s-vec-pad), so it takes the same size and place as an XY pad in any theme.
 * An axis letter drags its value (Figma's X / Y / W / H); with `scrub: true` the field itself does too (Tweakpane).
 */

import control from './control.js'
import { axis, scrub } from './util.js'
import { padTemplate, padState } from './xy.js'
import { signal } from '../signals.js'

const axesTemplate = `
  <span class="s-vec-axis" :each="d in dims">
    <label class="s-vec-label" :for="id + '-' + d.i" :text="d.label" :hidden="!d.label" :onpointerdown="d.scrub"></label>
    <input type="number" :id="id + '-' + d.i" :class="{ 's-scrub': scrubs }" :onpointerdown="scrubs ? d.scrub : null" :value="vals[d.i]" :min="d.min" :max="d.max" :step="d.step" :onchange="e => setAt(d.i, e.target.value)" />
  </span>
`

const expandTemplate = `
  <button type="button" class="s-vec-expand" :class="{'s-open': padOpen}" :onclick="() => padOpen = !padOpen" aria-label="Toggle 2D pad"></button>
`

export default (sig, opts = {}) => {
  const arr = Array.isArray(sig.value) ? sig.value : [0, 0]
  const n = opts.dimensions || arr.length
  const labels = opts.labels === false ? [] : (opts.labels || ['X', 'Y', 'Z', 'W'])
  const { dimensions, labels: _l, pad, dispose, scrub: scrubs = false, ...rest } = opts

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

  const dims = Array.from({ length: n }, (_, i) => {
    const step = axis(opts.step, i) ?? 'any', min = axis(opts.min, i), max = axis(opts.max, i)
    // a stepless axis drags its range in 200px; an unbounded one a tenth of its value's order a pixel (Leva's)
    const rate = typeof step === 'number' ? step : min != null && max != null ? Math.abs(max - min) / 200
      : () => { const v = Math.abs(+sig.value?.[i] || 0); return v ? 10 ** Math.floor(Math.log10(v)) / 10 : .1 }
    return { i, step, min, max, label: labels[i] ?? '', scrub: scrub(() => sig.value?.[i] ?? 0, v => setAt(i, +v.toPrecision(12)), rate) }
  })

  // Expandable XY-pad picker (2D vectors only) — shares the xy control's widget
  const withPad = pad && n === 2
  const padExtras = withPad ? { padOpen: signal(pad === 'open'), ...padState(sig, opts) } : null
  const template = withPad
    ? expandTemplate + axesTemplate + `<span class="s-vec-pad" :if="padOpen">${padTemplate()}</span>`
    : axesTemplate

  return control(sig, {
    ...rest, type: 'vector', template, dims, vals: sig, setAt, scrubs, ...padExtras,
    dispose: () => { padExtras?.stop(); dispose?.() }
  })
}
