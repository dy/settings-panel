/**
 * Vector control — multiple numeric values as inline axis inputs (X/Y/Z/W).
 *
 * value: number[]  ·  opts: dimensions, labels (or false), min, max, step
 * (each of min/max/step may be a scalar or a per-axis array).
 */

import control from './control.js'

const template = `
  <span class="s-vec-axis" :each="d in dims">
    <label class="s-vec-label" :text="d.label" :hidden="!d.label"></label>
    <input type="number" :value="vals[d.i]" :min="d.min" :max="d.max" :step="d.step" :oninput="e => setAt(d.i, e.target.value)" />
  </span>
`

const at = (v, i) => Array.isArray(v) ? v[i] : (v ?? null)

export default (sig, opts = {}) => {
  const arr = Array.isArray(sig.value) ? sig.value : [0, 0]
  const n = opts.dimensions || arr.length
  const labels = opts.labels === false ? [] : (opts.labels || ['X', 'Y', 'Z', 'W'])
  const { dimensions, labels: _l, ...rest } = opts

  const dims = Array.from({ length: n }, (_, i) => ({
    i,
    label: labels[i] ?? '',
    min: at(opts.min, i),
    max: at(opts.max, i),
    step: at(opts.step, i) ?? 'any',
  }))

  const clampAt = (i, v) => {
    const mn = at(opts.min, i), mx = at(opts.max, i)
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

  return control(sig, { ...rest, type: 'vector', template, dims, vals: sig, setAt })
}
