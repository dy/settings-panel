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
 *   snap - snap to marks: true (default if marks), false, or number (% threshold)
 *   track - CSS gradient for custom track background
 *   format - value formatter
 */

import control from './control.js'
import { signal, effect, computed } from '../signals.js'

const template = `
  <span class="s-track">
    <input type="range" :style="track ? '--track:' + track : '--p:' + progress + '%'" :min="dMin" :max="dMax" :step="dStep" :value="value" :oninput="e => set(+e.target.value)" />
    <span class="s-marks" :each="m in marks"><span class="s-mark" :class="{active: m.pct <= progress}" :style="'left:' + m.pct + '%'"></span></span>
    <span class="s-mark-labels" :each="l in labels"><span class="s-mark-label" :class="{active: l.pct <= progress}" :style="'left:' + l.pct + '%'" :text="l.text"></span></span>
  </span>
  <span class="s-value" :text="format(value)"></span>
`

const defaultFormat = v => v >= 1000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3)

export default (sig, opts = {}) => {
  const { min = 0, max = 1, step: stepOpt = 0.01, scale = 'linear', marks: marksOpt, snap: snapOpt, track, format = defaultFormat, ...rest } = opts

  // Step: number (continuous) or array (discrete with snap)
  const discrete = Array.isArray(stepOpt)
  const steps = discrete ? stepOpt.slice().sort((a, b) => a - b) : null
  const step = discrete ? null : stepOpt

  const isLog = scale === 'log'
  const logMin = isLog ? Math.log(Math.max(min, 1e-10)) : min
  const logMax = isLog ? Math.log(max) : max

  const toDisplay = v => isLog ? ((Math.log(Math.max(v, 1e-10)) - logMin) / (logMax - logMin)) * 1000 : v
  const fromDisplay = d => isLog ? Math.exp(logMin + (d / 1000) * (logMax - logMin)) : d

  const value = signal(toDisplay(sig.value))
  const dispose = effect(() => { value.value = toDisplay(sig.value) })

  const dMin = isLog ? 0 : min
  const dMax = isLog ? 1000 : max
  const dStep = isLog ? 1 : (discrete ? 'any' : step)

  const progress = computed(() => ((value.value - dMin) / (dMax - dMin)) * 100)

  // Resolve marks first (needed for snap)
  let markVals = [], labels = []
  if (marksOpt && typeof marksOpt === 'object' && !Array.isArray(marksOpt)) {
    markVals = Object.keys(marksOpt).map(Number)
    labels = markVals.map(v => ({ pct: ((v - min) / (max - min)) * 100, text: marksOpt[v] }))
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
        markVals = [min, max]
      }
    }
  } else if (marksOpt === 'ends') {
    markVals = [min, max]
  } else if (marksOpt === 'center') {
    markVals = [(min + max) / 2]
  }

  const marks = markVals.map(v => ({ pct: ((v - min) / (max - min)) * 100 }))

  // Snap to nearest mark when within threshold (% of range, default 3%)
  const snapThreshold = snapOpt === false ? 0 : (typeof snapOpt === 'number' ? snapOpt : 3)
  const snapDist = (max - min) * snapThreshold / 100

  const snap = v => {
    v = Math.min(max, Math.max(min, v))
    if (!snapDist || !markVals.length) return v
    for (const m of markVals) {
      if (Math.abs(v - m) <= snapDist) return m
    }
    return v
  }

  // Set with snap — also update display value to prevent jerk
  const set = d => {
    const raw = fromDisplay(d)
    const snapped = snap(raw)
    sig.value = snapped
    if (snapped !== raw) value.value = toDisplay(snapped)
  }

  return control(sig, {
    ...rest,
    type: 'slider', template, dispose, value, progress, marks, labels, track,
    dMin, dMax, dStep, set,
    format
  })
}
