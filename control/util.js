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
 * A drag under way: its control follows the pointer at once (.s-dragging: base turns its transitions off),
 * and where the value is not under the pointer (a scrub, a pad, a knob) the pointer hides, as Figma's does.
 */
export const drag = (el, on, hide = true) => {
  el?.classList.toggle('s-dragging', on)
  if (hide) document.documentElement.classList.toggle('s-cursorless', on)
}

/**
 * Follows a press to its end however it ends (a release, a cancel, the window losing focus), so no drag is left
 * half-finished: move(event) on every move, end(event) once.
 */
export const follow = (move, end) => {
  const events = ['pointerup', 'pointercancel', 'blur']
  const stop = ev => { removeEventListener('pointermove', move); events.forEach(t => removeEventListener(t, stop)); end?.(ev) }
  addEventListener('pointermove', move)
  events.forEach(t => addEventListener(t, stop))
  return stop
}

/**
 * Drag-to-scrub for numeric inputs (dat.gui / tweakpane / figma convention):
 * horizontal drag steps the value (1px = 1 step; shift ×10, alt ×0.1),
 * a sub-3px press falls through to normal click-to-edit.
 * `step` may be a function of the pointerdown event, read once per drag (a slider's
 * readout passes its track's value per pixel, so the number drags as the slider does).
 * Returns a pointerdown handler; a focused input keeps native text editing.
 * On a label it drags its field's value and a click focuses that field (Figma, Blender).
 * While it drags, an .s-scrub-trail runs from the press to the pointer over the page, in the panel's ink haloed by its
 * ground, so it reads past the panel's edge.
 */
export const scrub = (get, set, step = 1) => {
  return e => {
    const el = e.currentTarget, field = el.control || el.querySelector('input') || el
    if (e.button !== 0 || document.activeElement === el || e.target.closest('[data-tip]')) return
    e.preventDefault() // no focus/selection yet — granted on clean click in `up`
    const v0 = +get(), rate = typeof step === 'function' ? step(e) : step
    const row = el.closest('.s-control'), panel = el.closest('.s-panel')
    // the drag runs past the screen's edge: once it moves, the pointer is locked and its movement summed, so the
    // value keeps changing however far the hand goes (where the lock is refused, the pointer's place is the drag)
    let x0 = e.clientX, dx = 0, moved = false, locked = false, trail
    // the change drawn while it is made: a trail over the page from where the press began toward the pointer, past
    // the panel's edge if the hand goes there (held to the window, where a locked pointer runs on)
    const draw = () => {
      const y = el.getBoundingClientRect(), x = Math.min(Math.max(x0 + dx, 0), innerWidth)
      Object.assign(trail.style, { left: `${Math.min(x0, x)}px`, width: `${Math.abs(x - x0)}px`, top: `${y.top + y.height / 2}px` })
      trail.dataset.dir = dx < 0 ? 'left' : 'right'
    }
    const move = ev => {
      const lock = document.pointerLockElement === el
      if (lock) dx += ev.movementX
      else { if (locked) x0 = ev.clientX - dx; dx = ev.clientX - x0 }   // unlocked mid-drag (Esc): carry on from here
      locked = lock
      if (!moved && Math.abs(dx) < 3) return
      if (!moved) {
        moved = true; el.setPointerCapture(e.pointerId); el.classList.add('s-scrubbing'); drag(row, true)
        trail = document.createElement('i'); trail.className = 's-scrub-trail'; trail.ariaHidden = 'true'
        const ink = getComputedStyle(field), ground = panel && getComputedStyle(panel)
        trail.style.color = ink.color
        trail.style.setProperty('--halo', ground?.getPropertyValue('--bg').trim() || ground?.backgroundColor || 'transparent')
        document.body.append(trail)
        el.requestPointerLock?.()?.catch?.(() => {})
      }
      draw()
      // toFixed(10) kills float noise without quantizing away the value's own precision
      set(+(v0 + Math.round(dx) * rate * stepMul(ev)).toFixed(10))
    }
    follow(move, () => {
      if (document.pointerLockElement === el) document.exitPointerLock()
      trail?.remove()
      el.classList.remove('s-scrubbing')
      if (!moved) { field.focus(); field.select?.(); return }
      drag(row, false)
      // a drag ends in a click; on a label that click would focus its field, so the drag swallows it
      const eat = ev => ev.preventDefault()
      el.addEventListener('click', eat, { capture: true, once: true })
      setTimeout(() => el.removeEventListener('click', eat, { capture: true }))
    })
  }
}
