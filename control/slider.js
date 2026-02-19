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
 *   haptic - vibrate on mark crossings during drag: true (10ms tick) or ms duration
 *   readout - value display: true (default), false (hidden), 'input' (editable),
 *            or (value) → string for custom display
 *   unit - suffix appended to displayed value (e.g. 'px', '%', 'ms')
 *   format - (value) → string, overrides default auto-precision display
 */

import control from './control.js'
import { signal, effect, computed } from '../signals.js'

const template = `
  <span class="s-track">
    <input type="range" :list="nativeTicks ? listId : null" :style="track ? '--track:' + track : '--p:' + progress" :min="dMin" :max="dMax" :step="dStep" :value="value" :oninput="e => set(+e.target.value)" :onpointerdown="grab" :onpointerup="release" />
    <datalist :id="listId" :if="nativeTicks"><option :each="v in markDisplayVals" :value="v"></option></datalist>
    <span class="s-marks" :if="!nativeTicks" :each="m in marks"><span class="s-mark" :class="{active: m.pct <= progress}" :style="'left:' + m.pct + '%'"></span></span>
    <span class="s-mark-labels" :if="!nativeTicks" :each="l in labels"><span class="s-mark-label" :class="{active: l.pct <= progress}" :style="'left:' + l.pct + '%'" :text="l.text"></span></span>
  </span>
  <span class="s-readout" :if="showReadout" :text="readoutText(actual)"></span>
  <input type="text" inputmode="decimal" class="s-readout" :if="readout === 'input'" :value="format(actual)" :onchange="setActual" :onkeydown.arrow.prevent="stepKey" :onfocus="e => e.target.select()" />
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
  const { min = 0, max = 1, step: stepOpt = 0.01, scale = 'linear', curve: curveOpt, marks: marksOpt, snap: snapOpt, track, haptic = true, readout = true, unit = '', format: fmt, nativeTicks: nativeTicksOpt, ...rest } = opts

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

  const progress = computed(() => +((value.value - dMin) / (dMax - dMin) * 100).toFixed(3))

  // Percentage position on slider for any real value
  const pct = v => +((toDisplay(v) - dMin) / (dMax - dMin) * 100).toFixed(3)

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
        // Find nice interval: prefer even division of range, hitting endpoints, count near 5
        const range = max - min
        const mag = Math.pow(10, Math.floor(Math.log10(range)))
        let best = range, bestScore = Infinity
        for (const s of [mag / 10, mag]) {
          for (const n of [1, 2, 2.5, 5, 3, 4]) {
            const interval = +(n * s).toPrecision(10)
            const cnt = Math.floor(range / interval + 1e-9) + 1
            if (cnt < 3 || cnt > 9) continue
            const rem = Math.abs(range / interval - Math.round(range / interval))
            const even = rem < 1e-9
            const hitsMin = Math.abs(Math.round(min / interval) * interval - min) < interval * 1e-9
            const hitsMax = Math.abs(Math.round(max / interval) * interval - max) < interval * 1e-9
            const core = n <= 5 && n !== 3 && n !== 4
            const score = (even ? 0 : 20) + (hitsMin ? 0 : 5) + (hitsMax ? 0 : 5) + Math.abs(cnt - 5) + (core ? 0 : .1)
            if (score < bestScore) { best = interval; bestScore = score }
          }
        }
        for (let v = Math.ceil(min / best - 1e-9) * best; v <= max + best * 1e-9; v += best)
          markVals.push(Math.round(v * 1e10) / 1e10)
      }
    }
  } else if (marksOpt === 'ends') {
    markVals = [min, max]
  } else if (marksOpt === 'center') {
    markVals = [(min + max) / 2]
  }

  const marks = markVals.map(v => ({ pct: pct(v) }))
  const markDisplayVals = markVals.map(v => +toDisplay(v).toFixed(3))
  const labels = Object.keys(labelTexts).length
    ? markVals.map(v => ({ pct: pct(v), text: labelTexts[v] }))
    : []

  // Snap to nearest mark in display space (constant visual zone regardless of curve)
  // Always include min/max as snap targets so ends are reachable
  const snapThreshold = snapOpt === false ? 0 : typeof snapOpt === 'number' ? snapOpt : (snapOpt === true || discrete || 'step' in opts) ? 2 : 0
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
  const grab = () => { dragging = true; lastMark = -1 }
  const release = () => { dragging = false }

  // Haptic: vibrate when crossing a mark during drag
  const vibMs = haptic === true ? 10 : haptic || 0
  let lastMark = -1
  const tick = v => {
    if (!vibMs || !dragging || !snapTargets.length) return
    let nearest = 0, best = Infinity
    for (let i = 0; i < snapTargets.length; i++) {
      const d = Math.abs(v - snapTargets[i])
      if (d < best) { best = d; nearest = i }
    }
    if (nearest !== lastMark && lastMark !== -1) navigator.vibrate?.(vibMs)
    lastMark = nearest
  }

  // Quantize to step precision
  const prec = step ? (String(step).split('.')[1] || '').length : 10
  const format = fmt || (step ? (v => v.toFixed(Math.max(0, prec)) + unit) : (v => defaultFormat(v) + unit))
  const quantize = v => step ? Math.round(v / step) * step : v
  const clean = v => +quantize(v).toFixed(Math.max(0, prec))

  const set = d => {
    const raw = fromDisplay(d)
    const clamped = Math.min(max, Math.max(min, raw))
    const final = clean(dragging ? snap(clamped) : clamped)
    tick(final)
    sig.value = final
    if (final !== raw) value.value = toDisplay(final)
  }

  const setActual = e => {
    const v = parseFloat(e.target.value)
    if (Number.isFinite(v)) sig.value = clean(Math.min(max, Math.max(min, v)))
  }

  const stepKey = e => {
    const v = parseFloat(e.target.value)
    if (!Number.isFinite(v)) return
    const s = (step || (max - min) / 100) * (e.shiftKey ? 10 : e.altKey ? 0.1 : 1)
    sig.value = clean(Math.min(max, Math.max(min, e.key === 'ArrowUp' || e.key === 'ArrowRight' ? v + s : v - s)))
  }

  // Readout: true → span, 'input' → editable, fn → custom span, false → hidden
  const readoutFn = typeof readout === 'function' ? readout : null
  const showReadout = readout === true || readoutFn
  const readoutText = readoutFn || format

  const listId = `s-${Math.random().toString(36).slice(2)}`
  const nativeTicks = signal(nativeTicksOpt ?? false)

  const result = control(sig, {
    ...rest,
    type: 'slider', template, dispose, value, actual, progress, marks, markDisplayVals, labels, track, listId, nativeTicks,
    dMin, dMax, dStep, set, setActual, stepKey, grab, release,
    readout, showReadout, readoutText, format
  })

  // Auto-detect: native ticks only if theme keeps appearance:auto
  if (nativeTicksOpt == null) requestAnimationFrame(() => {
    const inp = result.el.querySelector('input[type=range]')
    if (inp) nativeTicks.value = getComputedStyle(inp).appearance !== 'none'
  })

  return result
}
