/**
 * Slider control - linear, log, discrete
 *
 * Options:
 *   min, max - range bounds
 *   step - increment: number | number[] (array = discrete values with snap)
 *   scale - 'linear' | 'log'
 *   marks - visual indicators on track:
 *           false (default), true (at step positions), 'ends', 'center',
 *           [values] (ticks only), {value: 'label'} (ticks + labels)
 *   snap - snap to marks during drag: false (default), true if step provided, or number (% threshold)
 *   track - CSS gradient for custom track background
 *   unit - suffix appended to displayed value (e.g. 'px', '%', 'ms')
 *   format - (value) → string, overrides default auto-precision display
 */

import control from './control.js'
import { signal, effect, computed } from '../signals.js'

const template = `
  <span class="s-track">
    <input type="range" :style="track ? '--track:' + track : '--p:' + progress + '%'" :min="dMin" :max="dMax" :step="dStep" :value="value" :oninput="e => set(+e.target.value)" :onpointerdown="grab" :onpointerup="release" />
    <span class="s-marks" :each="m in marks"><span class="s-mark" :class="{active: m.pct <= progress}" :style="'left:' + m.pct + '%'"></span></span>
    <span class="s-mark-labels" :each="l in labels"><span class="s-mark-label" :class="{active: l.pct <= progress}" :style="'left:' + l.pct + '%'" :text="l.text"></span></span>
  </span>
  <span class="s-value" :text="format(actual)"></span>
`

const defaultFormat = v => v >= 1000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3)

// Curve: maps [0,1] → [0,1] non-linearly
// number: power (>1 = precise low, <1 = precise high)
// 'exp': alias for 2, 'log': alias for 0.5
// function: custom f(x) → y
const makeCurve = (opt) => {
  if (!opt || opt === 1) return { to: x => x, from: x => x }
  if (opt === 'exp') opt = 2
  if (opt === 'log') opt = 0.5
  if (typeof opt === 'function') return { to: opt, from: null } // no inverse for custom
  const n = opt
  return { to: x => Math.pow(x, n), from: y => Math.pow(y, 1/n) }
}

export default (sig, opts = {}) => {
  const { min = 0, max = 1, step: stepOpt = 0.01, scale = 'linear', curve: curveOpt, marks: marksOpt, snap: snapOpt, track, unit = '', format: fmt, ...rest } = opts
  const format = fmt || (v => defaultFormat(v) + unit)

  // Curve (maps normalized [0,1] non-linearly)
  const curve = makeCurve(curveOpt)

  // Step: number (continuous) or array (discrete with snap)
  const discrete = Array.isArray(stepOpt)
  const steps = discrete ? stepOpt.slice().sort((a, b) => a - b) : null
  const step = discrete ? null : stepOpt

  const isLog = scale === 'log'
  const logMin = isLog ? Math.log(Math.max(min, 1e-10)) : min
  const logMax = isLog ? Math.log(max) : max

  // toDisplay: value → slider position, fromDisplay: slider position → value
  // Curve transforms normalized [0,1]: slider shows curved position, value is linear
  const normalize = v => (v - min) / (max - min)
  const denormalize = n => min + n * (max - min)

  const toDisplay = v => {
    if (isLog) return ((Math.log(Math.max(v, 1e-10)) - logMin) / (logMax - logMin)) * 1000
    if (curve.from) return denormalize(curve.from(normalize(v)))
    return v
  }
  const fromDisplay = d => {
    if (isLog) return Math.exp(logMin + (d / 1000) * (logMax - logMin))
    if (curve.to) return denormalize(curve.to(normalize(d)))
    return d
  }

  const value = signal(toDisplay(sig.value))
  const actual = signal(sig.value)
  const dispose = effect(() => { value.value = toDisplay(sig.value); actual.value = sig.value })

  const dMin = isLog ? 0 : min
  const dMax = isLog ? 1000 : max
  const dStep = isLog ? 1 : (discrete ? 'any' : step)

  const progress = computed(() => ((value.value - dMin) / (dMax - dMin)) * 100)

  // Mark positions must account for curve (display is curved, marks should appear at curved positions)
  const markPct = v => {
    const n = (v - min) / (max - min)
    const curved = curve.from ? curve.from(n) : n
    return curved * 100
  }

  // Resolve marks first (needed for snap)
  let markVals = [], labelTexts = {}
  if (marksOpt && typeof marksOpt === 'object' && !Array.isArray(marksOpt)) {
    markVals = Object.keys(marksOpt).map(Number)
    labelTexts = marksOpt
  } else if (Array.isArray(marksOpt)) {
    markVals = marksOpt
  } else if (marksOpt === true) {
    if (discrete) {
      markVals = steps
    } else {
      const count = Math.round((max - min) / step)
      if (count <= 10) {
        for (let v = min; v <= max; v += step) markVals.push(Math.round(v * 1e10) / 1e10)
      } else {
        // Find nice interval giving ~4-10 marks
        const range = max - min
        const mag = Math.pow(10, Math.floor(Math.log10(range)))
        const nices = [.1, .2, .25, .5, 1, 2, 2.5, 5, 10]
        let interval = range
        for (const n of nices) {
          const s = n * mag
          const c = range / s
          if (c >= 4 && c <= 8) { interval = s; break }
        }
        for (let v = Math.ceil(min / interval) * interval; v <= max; v += interval)
          markVals.push(Math.round(v * 1e10) / 1e10)
        if (markVals[0] !== min) markVals.unshift(min)
        if (markVals[markVals.length - 1] !== max) markVals.push(max)
      }
    }
  } else if (marksOpt === 'ends') {
    markVals = [min, max]
  } else if (marksOpt === 'center') {
    markVals = [(min + max) / 2]
  }

  const marks = markVals.map(v => ({ pct: markPct(v) }))
  const labels = Object.keys(labelTexts).length
    ? markVals.map(v => ({ pct: markPct(v), text: labelTexts[v] }))
    : []

  // Snap to nearest mark in display space (constant visual zone regardless of curve)
  // Always include min/max as snap targets so ends are reachable
  const snapDefault = discrete || 'step' in opts ? 2 : 0
  const snapThreshold = snapOpt === false ? 0 : (typeof snapOpt === 'number' ? snapOpt : snapDefault)
  const snapRange = (dMax - dMin) * snapThreshold / 100
  const snapTargets = [...new Set([min, ...markVals, max])]

  const snap = v => {
    if (!snapRange) return v
    const dv = toDisplay(v)
    let best = v, bestDist = Infinity
    for (const t of snapTargets) {
      const d = Math.abs(dv - toDisplay(t))
      if (d <= snapRange && d < bestDist) { best = t; bestDist = d }
    }
    return best
  }

  // Snap only during pointer drag, not keyboard
  let dragging = false
  const grab = () => { dragging = true }
  const release = () => { dragging = false }

  const set = d => {
    const raw = fromDisplay(d)
    const clamped = Math.min(max, Math.max(min, raw))
    const final = dragging ? snap(clamped) : clamped
    sig.value = final
    if (final !== raw) value.value = toDisplay(final)
  }

  return control(sig, {
    ...rest,
    type: 'slider', template, dispose, value, actual, progress, marks, labels, track,
    dMin, dMax, dStep, set, grab, release,
    format
  })
}
