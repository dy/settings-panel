/**
 * Shared control utilities
 */

/** Resolve a container option (selector string or element) to an element. */
export const resolveEl = (c) => typeof c === 'string' ? document.querySelector(c) : c

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/** Keyboard/pointer step multiplier: shift ×10, alt ×0.1. */
export const stepMul = e => e.shiftKey ? 10 : e.altKey ? 0.1 : 1

/** Per-axis option accessor: scalar applies to every axis, array per axis. */
export const axis = (v, i, d = null) => Array.isArray(v) ? (v[i] ?? d) : (v ?? d)

/** Decimal places implied by a step ('any'/null → fallback). */
export const decimals = (step, fallback = 0) =>
  typeof step === 'number' ? (String(step).split('.')[1] || '').length : fallback

/**
 * Drag-to-scrub for numeric inputs (dat.gui / tweakpane / figma convention):
 * horizontal drag steps the value (1px = 1 step; shift ×10, alt ×0.1),
 * a sub-3px press falls through to normal click-to-edit.
 * Returns a pointerdown handler; a focused input keeps native text editing.
 */
export const scrub = (get, set, step = 1) => {
  return e => {
    const el = e.currentTarget
    if (e.button !== 0 || document.activeElement === el) return
    e.preventDefault() // no focus/selection yet — granted on clean click in `up`
    const x0 = e.clientX, v0 = get()
    let moved = false
    const move = ev => {
      if (!moved && Math.abs(ev.clientX - x0) < 3) return
      if (!moved) { moved = true; el.setPointerCapture(e.pointerId); el.classList.add('s-scrubbing') }
      // toFixed(10) kills float noise without quantizing away the value's own precision
      set(+(v0 + Math.round(ev.clientX - x0) * step * stepMul(ev)).toFixed(10))
    }
    const up = () => {
      el.removeEventListener('pointermove', move)
      el.classList.remove('s-scrubbing')
      if (!moved) { el.focus(); el.select?.() }
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up, { once: true })
  }
}
