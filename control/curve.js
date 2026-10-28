/**
 * Curve control — a cubic Bézier easing, dragged on a pad by its two handles or typed as four numbers.
 *
 * value: [x1, y1, x2, y2], or a CSS easing ('ease-out', 'cubic-bezier(.3, 0, .2, 1)'), kept in the form given: a string
 * stays a string, a keyword while it names one, ready for `transition-timing-function`. opts: step (default .01).
 * x stays within 0–1, as CSS requires; y may overshoot (a back ease) from −1 to 2. The pad draws the unit square square and
 * fits it, overshoot included, as DialKit fits its easing graph. A press on the pad takes the nearer handle and the drag
 * moves it by the pointer's travel; a focused handle moves by the arrows (Shift ×10).
 * It is a vector of four (.s-vector.s-curve) whose pad draws the curve, so a theme's vector fields and pad dress it.
 */

import control from './control.js'
import { clamp, drag, follow, stepMul } from './util.js'
import { axesTemplate, axes } from './vector.js'
import { signal, computed, effect, untracked } from '../signals.js'

// the keywords' control points, CSS Easing Functions 1 §2.2 (https://www.w3.org/TR/css-easing-1/#cubic-bezier-easing-functions)
export const easings = { linear: [0, 0, 1, 1], ease: [.25, .1, .25, 1], 'ease-in': [.42, 0, 1, 1], 'ease-out': [0, 0, .58, 1], 'ease-in-out': [.42, 0, .58, 1] }

// four finite numbers, x held to 0–1 as CSS requires; anything else is CSS's initial easing
const valid = p => p?.length === 4 && p.every(Number.isFinite) ? p.map((n, i) => i % 2 ? n : Math.min(1, Math.max(0, n))) : null
const parse = v => valid(Array.isArray(v) ? v.map(Number)
  : easings[String(v).trim()] || /^cubic-bezier\(([^)]*)\)$/.exec(String(v).trim())?.[1].split(',').map(Number)) || easings.ease
const same = (a, b) => a.every((v, i) => v === b[i])

// the unit square, square, centred in a w × h pad 12px in from its edges, zoomed out to keep an overshooting handle
// on it (DialKit 2.0.2's fitEasingGraph)
const fit = (p, w, h) => {
  const inset = Math.min(12, w / 4, h / 4), reach = Math.max(.5, Math.abs(p[1] - .5), Math.abs(p[3] - .5))
  const u = Math.min(w - 2 * inset, (h / 2 - inset) / reach)
  return { u, at: (x, y) => [w / 2 + (x - .5) * u, h / 2 - (y - .5) * u] }
}
const dot = ([x, y], r = 2.5) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

const padTemplate = `
  <div class="s-pad" :onpointerdown="grab">
    <svg aria-hidden="true">
      <path class="s-curve-guide" :d="draw.guide" />
      <path class="s-curve-arm" :d="draw.arms" />
      <path class="s-curve-line" :d="draw.line" />
      <path class="s-curve-end" :d="draw.ends" />
    </svg>
    <span class="s-pad-dot" tabindex="0" aria-label="First handle" :style="draw.dots[0]" :onkeydown.arrow.prevent="e => key(e, 0)"></span>
    <span class="s-pad-dot" tabindex="0" aria-label="Second handle" :style="draw.dots[1]" :onkeydown.arrow.prevent="e => key(e, 1)"></span>
  </div>
`

export default (sig, opts = {}) => {
  const { step = .01, dispose, ...rest } = opts
  const round = v => +(Math.round(v / step) * step).toFixed(6)

  // the points as numbers; the store keeps the form it was given, holding what the curve shows (a value it cannot read
  // becomes ease, an x past 0–1 is held to it)
  const pts = signal(parse(sig.value))
  const form = p => {
    if (typeof untracked(() => sig.value) !== 'string') return p
    return Object.keys(easings).find(k => same(easings[k], p)) || `cubic-bezier(${p.join(', ')})`
  }
  const stops = [
    effect(() => { const p = parse(sig.value); if (!same(p, untracked(() => pts.value))) pts.value = p }),
    effect(() => { const v = form(pts.value), cur = untracked(() => sig.value); if (Array.isArray(v) ? !(Array.isArray(cur) && same(v, cur)) : v !== cur) sig.value = v }),
  ]

  // the pad's size, for the drawing: the curve is drawn in its pixels, so the unit square stays square in any theme's pad
  const size = signal([96, 96])
  const draw = computed(() => {
    const p = pts.value, [w, h] = size.value, { at } = fit(p, w, h)
    const [s, a, b, e] = [at(0, 0), at(p[0], p[1]), at(p[2], p[3]), at(1, 1)]
    return {
      guide: `M${s}L${e}`, arms: `M${s}L${a}M${e}L${b}`, line: `M${s}C${a} ${b} ${e}`, ends: dot(s) + dot(e),
      dots: [a, b].map(([x, y]) => `--x:${x / w * 100}%; --y:${y / h * 100}%`),
    }
  })

  const set = (i, x, y) => { const p = [...pts.value]; p[2 * i] = round(clamp(x, 0, 1)); p[2 * i + 1] = round(clamp(y, -1, 2)); pts.value = p }

  // a press takes the nearer handle and the drag carries it by the pointer's travel, at the scale the press saw: the
  // drawing refits as a handle overshoots, so a handle put under the pointer would chase the zoom
  let at, held, stop = () => {}
  const grab = e => {
    const pad = e.currentTarget, r = pad.getBoundingClientRect(), p0 = pts.value
    held = pad.closest('.s-control')
    const { u, at: to } = fit(p0, r.width, r.height)
    const far = i => { const [x, y] = to(p0[2 * i], p0[2 * i + 1]); return Math.hypot(r.left + x - e.clientX, r.top + y - e.clientY) }
    at = far(1) < far(0) ? 1 : 0
    const x0 = e.clientX, y0 = e.clientY
    stop = follow(ev => {
      if (!held.classList.contains('s-dragging')) drag(held, true)
      set(at, p0[2 * at] + (ev.clientX - x0) / u, p0[2 * at + 1] - (ev.clientY - y0) / u)
    }, () => drag(held, false))
    pad.querySelectorAll('.s-pad-dot')[at].focus({ preventScroll: true })
    e.preventDefault()
  }
  const key = (e, i) => {
    const s = step * stepMul(e), p = pts.value, k = e.key
    set(i, p[2 * i] + (k === 'ArrowRight' ? s : k === 'ArrowLeft' ? -s : 0), p[2 * i + 1] + (k === 'ArrowUp' ? s : k === 'ArrowDown' ? -s : 0))
  }

  const fields = axes(pts, { labels: false, min: [0, -1, 0, -1], max: [1, 2, 1, 2], step })
  const ctrl = control(sig, {
    ...rest, type: 'vector curve', template: axesTemplate + `<span class="s-vec-pad">${padTemplate}</span>`,
    ...fields, draw, grab, key,
    dispose: () => { stop(); seen?.disconnect(); stops.forEach(s => s()); dispose?.() }
  })
  const pad = ctrl.el.querySelector('.s-pad')
  const seen = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { if (pad.clientWidth) size.value = [pad.clientWidth, pad.clientHeight] }) : null
  seen?.observe(pad)
  return ctrl
}
