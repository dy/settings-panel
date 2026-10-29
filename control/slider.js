/**
 * Slider control - linear, log, discrete, range (interval)
 *
 * Options:
 *   min, max - range bounds
 *   step - increment: number | number[] (array = discrete values with snap)
 *   range - two thumbs on one track, value [low, high], low ≤ high: `slider:range`, `multiple: true`, or a
 *           [low, high] value
 *   scale - 'linear' | 'log'
 *   marks - visual indicators on track:
 *           false (default), true (at step positions), 'ends', 'center',
 *           [values] (ticks only), {value: 'label'} (ticks + labels)
 *   snap - snap to marks during drag: false (default), true if step provided, or number (% threshold)
 *   haptic - vibrate on mark crossings during drag: true (10ms tick) or ms duration
 *   readout - value display: true/'input' (editable, default), 'readonly' (text),
 *            'tooltip' (above thumb), (value) → string (custom text), false/null (hidden)
 *   unit - suffix appended to displayed value (e.g. 'px', '%', 'ms')
 *   format - (value) → string, overrides default auto-precision display
 *
 * Themes read `.s-track`'s --p (fill, %), --t (the same as a 0–1 number, for fills that end under a thumb) and --steps
 * (step intervals across the range, absent when stepless) and carries the value as data-value (for a theme that prints it);
 * the row is .s-over-label while a dragged thumb is over its label, and carries --s-label-end / --s-value-start (where
 * the label ends and the value begins along the track) once the pointer is on it, its marks .s-under-label /
 * .s-under-value where those cover them.
 */

import control from './control.js'
import { scrub, clamp, stepMul, decimals, drag, follow } from './util.js'
import { signal, effect, computed } from '../signals.js'

const multipleTemplate = `
  <span class="s-readout s-readout-lo" :if="showReadonly" :text="fmtLow"></span>
  <input type="text" inputmode="decimal" class="s-readout s-readout-lo" :if="showInput" :value="fmtLow" :onchange="setLowActual" :onkeydown.arrow.prevent="stepKeyLow" :onfocus="e => e.target.select()" :onpointerdown="scrubLo" />
  <span class="s-interval-track" :style="{'--low': lowPct + '%', '--high': highPct + '%'}" :onpointermove="pickThumb">
    <input type="range" class="s-interval-lo" :class="{'s-top': top === 'lo'}" :name="label ? label+'-lo' : null" :min="min" :max="max" :step="step" :value="low" :oninput="e => setLow(+e.target.value)" :onpointerdown="grab" />
    <input type="range" class="s-interval-hi" :class="{'s-top': top === 'hi'}" :name="label ? label+'-hi' : null" :min="min" :max="max" :step="step" :value="high" :oninput="e => setHigh(+e.target.value)" :onpointerdown="grab" />
  </span>
  <span class="s-readout s-readout-hi" :if="showReadonly" :text="fmtHigh"></span>
  <input type="text" inputmode="decimal" class="s-readout s-readout-hi" :if="showInput" :value="fmtHigh" :onchange="setHighActual" :onkeydown.arrow.prevent="stepKeyHigh" :onfocus="e => e.target.select()" :onpointerdown="scrubHi" />
`

const template = `
  <span class="s-track" :class="{ 's-dragging': moved }" :style="{'--p': progress + '%', '--t': progress / 100, '--steps': stepCount}" :data-value="format(actual)">
    <input type="range" :id="id" :name="label || null" :list="nativeTicks ? listId : null" :min="dMin" :max="dMax" :step="dStep" :value="value" :oninput="e => set(+e.target.value)" :onpointerdown="grab" />
    <datalist :id="listId" :if="nativeTicks"><option :each="v in markDisplayVals" :value="v"></option></datalist>
    <span class="s-marks" :if="!nativeTicks" :each="m in marks"><span class="s-mark" :class="{ 's-active': m.pct <= progress, 's-first': m.pct === 0, 's-last': m.pct === 100 }" :style="'left:' + m.pct + '%'"></span></span>
    <span class="s-mark-labels" :if="!nativeTicks" :each="l in labels"><span class="s-mark-label" :class="{ 's-active': l.pct <= progress, 's-first': l.pct === 0, 's-last': l.pct === 100 }" :style="'left:' + l.pct + '%'" :text="l.text"></span></span>
    <span class="s-tooltip" :if="showTooltip" :style="'left:' + progress + '%'" :text="readoutText(actual)"></span>
  </span>
  <span class="s-readout" :if="showReadonly" :text="readoutText(actual)"></span>
  <input type="text" inputmode="decimal" class="s-readout" :if="showInput" :value="format(actual)" :onchange="setActual" :onkeydown.arrow.prevent="stepKey" :onfocus="e => e.target.select()" :onpointerdown="scrubR" />
`

const defaultFormat = v => v >= 1000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3)

// Resolve `readout` option → display-mode flags (shared by single + interval paths)
// readout: true/'input' → editable, 'readonly' → text, 'tooltip' → above thumb, fn → custom, false/null → hidden
const resolveReadout = (readout, format) => {
  const fn = typeof readout === 'function' ? readout : null
  return {
    showInput: readout === true || readout === 'input',
    showReadonly: readout === 'readonly' || !!fn,
    showTooltip: readout === 'tooltip',
    readoutText: fn || format,
  }
}

// While a thumb in hand passes over its row's label, the row is .s-over-label, for themes whose label rides on the
// track (it may step aside there, and only there)
const overLabel = (row, x) => {
  const r = row?.querySelector('.s-label')?.getBoundingClientRect()
  row?.classList.toggle('s-over-label', !!r && x >= r.left - 6 && x <= r.right + 6)
}

// Where, from the track's start, the label ends and the value begins: --s-label-end and --s-value-start (px) on the
// row, and each mark .s-under-label / .s-under-value where one covers it (with overLabel's slack), for themes that
// ride both on the track and keep its marks clear of them (studio). Measured as the pointer comes onto the row and
// while a thumb in hand moves, as the value's width changes with it.
const clearance = row => {
  const t = row?.querySelector('.s-track')?.getBoundingClientRect()
  if (!t?.width) return
  const l = row.querySelector('.s-label')?.getBoundingClientRect(), v = row.querySelector('.s-readout')?.getBoundingClientRect()
  // every rect read before anything is written: one layout per call, however many marks
  const marks = [...row.querySelectorAll('.s-mark')].map(m => { const r = m.getBoundingClientRect(); return [m, r.left + r.width / 2] })
  row.style.setProperty('--s-label-end', `${l?.width ? l.right - t.left : 0}px`)
  row.style.setProperty('--s-value-start', `${v?.width ? v.left - t.left : t.width}px`)
  for (const [m, x] of marks) {
    m.classList.toggle('s-under-label', !!l?.width && x >= l.left - 6 && x <= l.right + 6)
    m.classList.toggle('s-under-value', !!v?.width && x >= v.left - 6 && x <= v.right + 6)
  }
}

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
  if (opts.multiple || opts.variant === 'range' || Array.isArray(sig.value)) {
    const { min = 0, max = 100, step = 1, readout = true, format: fmt, unit = '', ...rest } = opts

    const low = signal(Array.isArray(sig.value) ? sig.value[0] : min)
    const high = signal(Array.isArray(sig.value) ? sig.value[1] : max)

    const dispose = effect(() => {
      const v = sig.value
      if (Array.isArray(v)) { low.value = v[0]; high.value = v[1] }
    })

    const range = max - min
    const lowPct = computed(() => +((low.value - min) / range * 100).toFixed(1))
    const highPct = computed(() => +((high.value - min) / range * 100).toFixed(1))

    const setLow = v => { sig.value = [Math.min(v, high.value), high.value] }
    const setHigh = v => { sig.value = [low.value, Math.max(v, low.value)] }

    // String(+…) strips zero-padding: 0.6 not "0.60" (explicit `format` opts in to padding)
    const format = fmt || (v => String(+v.toFixed(decimals(step))) + unit)

    // Same readout options as single slider
    const { showInput, showReadonly, readoutText } = resolveReadout(readout, format)
    const fmtLow = computed(() => readoutText(low.value))
    const fmtHigh = computed(() => readoutText(high.value))

    const clampVal = v => clamp(v, min, max)
    const onStep = v => step ? +(min + Math.round((v - min) / step) * step).toFixed(decimals(step)) : v
    const perPx = e => (max - min) / (e.currentTarget.closest('.s-input').querySelector('.s-interval-track').getBoundingClientRect().width || 100)
    const stepSize = e => step * stepMul(e)
    const isUp = e => e.key === 'ArrowUp' || e.key === 'ArrowRight'
    const makeActual = fn => e => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) fn(clampVal(v)) }
    const makeStepKey = fn => e => { const v = parseFloat(e.target.value); if (!Number.isFinite(v)) return; fn(clampVal(v + (isUp(e) ? 1 : -1) * stepSize(e))) }

    const setLowActual = makeActual(setLow)
    const setHighActual = makeActual(setHigh)
    const stepKeyLow = makeStepKey(setLow)
    const stepKeyHigh = makeStepKey(setHigh)

    // Both range inputs overlap full-width; hit-testing precedes event dispatch, so the
    // thumb nearest the pointer must already be on top before the press — track hover.
    const top = signal(null)
    const pickThumb = e => {
      const r = e.currentTarget.getBoundingClientRect()
      const v = min + (e.clientX - r.left) / r.width * range
      const dLo = Math.abs(v - low.value), dHi = Math.abs(v - high.value)
      top.value = dLo < dHi ? 'lo' : dHi < dLo ? 'hi'
        // exact tie (stacked thumbs): grab the one with room to move
        : low.value - min > max - high.value ? 'lo' : 'hi'
    }

    // a press anywhere moves the nearer thumb (pickThumb put it on top); in hand it hides the pointer and tells the
    // row when it passes over the label
    const grab = e => {
      if (e.button) return
      const row = e.currentTarget.closest('.s-control'), x0 = e.clientX
      let moved = false
      overLabel(row, x0)
      follow(ev => { if (!moved && Math.abs(ev.clientX - x0) >= 3) { moved = true; drag(row?.querySelector('.s-interval-track'), true) } overLabel(row, ev.clientX) },
        () => { if (moved) drag(row?.querySelector('.s-interval-track'), false); row?.classList.remove('s-over-label') })
    }

    return control(sig, {
      ...rest,
      type: 'slider multiple',
      template: multipleTemplate, dispose,
      low, high, lowPct, highPct, min, max, step,
      setLow, setHigh, setLowActual, setHighActual, stepKeyLow, stepKeyHigh,
      showInput, showReadonly, fmtLow, fmtHigh, top, pickThumb, grab,
      // a readout drags its thumb: the track's value per pixel
      scrubLo: scrub(() => low.value, v => setLow(clampVal(onStep(v))), perPx),
      scrubHi: scrub(() => high.value, v => setHigh(clampVal(onStep(v))), perPx)
    })
  }

  const { min = 0, max = 1, step: stepOpt = 0.01, scale = 'linear', curve: curveOpt, marks: marksOpt, snap: snapOpt, haptic = true, readout = true, unit = '', format: fmt, nativeTicks: nativeTicksOpt, ...rest } = opts

  // Curve (maps normalized [0,1] non-linearly)
  const curve = makeCurve(curveOpt)

  // Step: number (continuous) or array (discrete with snap)
  const discrete = Array.isArray(stepOpt)
  const steps = discrete ? stepOpt.slice().sort((a, b) => a - b) : null
  const step = discrete ? null : stepOpt

  const isLog = scale === 'log'
  if (isLog && curveOpt != null && curveOpt !== 1) console.warn('[settings-panel] slider: `curve` is ignored when scale="log"')
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
    // object keys enumerate integers first (0, 1, then .5), so marks are put in position order
    markVals = Object.keys(marksOpt).map(Number).sort((a, b) => a - b)
    labelTexts = marksOpt
  } else if (Array.isArray(marksOpt)) {
    markVals = [...marksOpt].sort((a, b) => a - b)
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
  // a press that moves is a drag: .s-dragging on the track turns its transitions off (base), so the fill follows at
  // once while a click's jump may still animate, and the pointer hides, the thumb standing in for it
  let dragging = false
  const moved = signal(false)
  let x0 = 0, row = null
  const sweep = e => { if (!moved.value && Math.abs(e.clientX - x0) >= 3) { moved.value = true; drag(null, true) } overLabel(row, e.clientX); clearance(row) }
  const release = () => { dragging = false; if (moved.value) drag(null, false); moved.value = false; row?.classList.remove('s-over-label') }
  const grab = e => {
    if (e.button) return
    dragging = true; lastMark = -1; x0 = e.clientX; row = e.currentTarget.closest('.s-control')
    overLabel(row, e.clientX); follow(sweep, release)
  }

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
  const prec = decimals(step, 10)
  const format = fmt || (step ? (v => String(+v.toFixed(Math.max(0, prec))) + unit) : (v => String(+defaultFormat(v)) + unit))
  const quantize = v => step ? Math.round(v / step) * step : v
  const clean = v => +quantize(v).toFixed(Math.max(0, prec))

  const set = d => {
    const raw = fromDisplay(d)
    const clamped = clamp(raw, min, max)
    const final = clean(dragging ? snap(clamped) : clamped)
    tick(final)
    sig.value = final
    if (final !== raw) value.value = toDisplay(final)
  }

  const setActual = e => {
    const v = parseFloat(e.target.value)
    if (Number.isFinite(v)) sig.value = clean(clamp(v, min, max))
  }

  const stepKey = e => {
    const v = parseFloat(e.target.value)
    if (!Number.isFinite(v)) return
    const up = e.key === 'ArrowUp' || e.key === 'ArrowRight'
    if (discrete) {
      // step to the neighbouring discrete value
      let idx = steps.findIndex(t => t >= v)
      if (idx < 0) idx = steps.length - 1
      if (steps[idx] === v) idx += up ? 1 : -1
      else if (!up) idx -= 1
      sig.value = steps[Math.max(0, Math.min(steps.length - 1, idx))]
      return
    }
    const s = (step || (max - min) / 100) * stepMul(e)
    sig.value = clean(clamp(up ? v + s : v - s, min, max))
  }

  const { showInput, showReadonly, showTooltip, readoutText } = resolveReadout(readout, format)

  // step intervals across the range, for themes that draw step ticks without marks
  const stepCount = discrete ? steps.length - 1 : step ? Math.round((max - min) / step) : null

  const listId = `s-${Math.random().toString(36).slice(2)}`
  const nativeTicks = signal(nativeTicksOpt ?? false)

  const result = control(sig, {
    ...rest,
    type: 'slider', template, dispose, value, actual, progress, stepCount, moved, marks, markDisplayVals, labels, listId, nativeTicks,
    dMin, dMax, dStep, set, setActual, stepKey, grab,
    readout, showInput, showReadonly, showTooltip, readoutText, format,
    // dragging the number drags the slider: display space, the track's value per pixel, the drag's snapping
    scrubR: scrub(() => value.value, d => { dragging = true; set(clamp(d, dMin, dMax)); dragging = false },
      e => (dMax - dMin) / (e.currentTarget.closest('.s-input').querySelector('input[type=range]').getBoundingClientRect().width || 100))
  })

  result.el.addEventListener('pointerenter', () => clearance(result.el))

  // el is now in live DOM (panel mounted before controls) — detect sync
  if (nativeTicksOpt == null) {
    const inp = result.el.querySelector('input[type=range]')
    if (inp) nativeTicks.value = getComputedStyle(inp).appearance !== 'none'
  }

  // A theme may declare `--s-readout-dwell: <time>` (DialKit: .8s): the number is then part of the track, a click
  // on it setting the slider like any other point, until the pointer rests on it that long; then it is .s-editable
  const ro = result.el.querySelector('input.s-readout')
  const dwell = (t => t ? parseFloat(t) * (t.endsWith('ms') ? 1 : 1000) : 0)(getComputedStyle(result.el).getPropertyValue('--s-readout-dwell').trim())
  if (dwell && ro) {
    let timer = 0, editable = false
    const edit = on => { clearTimeout(timer); timer = 0; editable = on; ro.classList.toggle('s-editable', on); ro.style.pointerEvents = on ? '' : 'none' }
    const over = e => { const r = ro.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom }
    edit(false)
    result.el.addEventListener('pointermove', e => {
      if (e.buttons || ro === document.activeElement) return
      if (!over(e)) { if (editable || timer) edit(false); return }
      if (!editable && !timer) timer = setTimeout(() => edit(true), dwell)
    })
    result.el.addEventListener('pointerleave', () => { if (ro !== document.activeElement) edit(false) })
    ro.addEventListener('focus', () => edit(true))
    ro.addEventListener('blur', () => edit(false))
  }

  // Labelled marks on a track too short for all of them: a label that would touch the one before it (or the last)
  // is .s-crowded, which base hides; the two ends always show. Refit when the track resizes or the fonts arrive.
  // (each label renders in a .s-mark-labels of its own: the track holds them all)
  const box = result.el.querySelector('.s-track')
  if (box && labels) {
    const fit = () => {
      const ls = [...result.el.querySelectorAll('.s-mark-label')].sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
      for (const l of ls) l.classList.remove('s-crowded')
      const r = ls.map(l => l.getBoundingClientRect())
      if (r.length < 2 || !r[0].width) return
      const gap = 4, last = r.at(-1)
      let prev = r[0]
      for (let i = 1; i < r.length - 1; i++) {
        if (r[i].left < prev.right + gap || r[i].right > last.left - gap) ls[i].classList.add('s-crowded')
        else prev = r[i]
      }
      if (last.left < r[0].right + gap) ls.at(-1).classList.add('s-crowded')
    }
    const watch = new ResizeObserver(fit)
    watch.observe(box)
    document.fonts?.ready.then(fit)
    // a folded folder lays nothing out: fit again when one holding the slider opens
    const panel = result.el.closest('.s-panel')
    const opened = e => { if (e.target.contains?.(box)) requestAnimationFrame(fit) }
    panel?.addEventListener('toggle', opened, true)
    const done = result[Symbol.dispose]
    result[Symbol.dispose] = () => { watch.disconnect(); panel?.removeEventListener('toggle', opened, true); done?.() }
  }

  return result
}
