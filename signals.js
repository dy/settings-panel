/**
 * Signal decorators and utilities
 * Based on Preact-style signals (.value + effect)
 * Uses sprae/signal internally, will port to nadi later
 */

import { signal, effect, untracked, computed, batch, use } from 'sprae'

// Re-export core
export { signal, effect, untracked, computed, batch, use }

/**
 * Create signal from various sources
 * Adapts: preact, solid, TC39 proposal, plain values
 */
export function from(source) {
  // Already a signal with .value
  if (source && typeof source === 'object' && 'value' in source) {
    return source
  }

  // TC39 proposal style (.get/.set)
  if (source && typeof source.get === 'function' && typeof source.set === 'function') {
    const sig = signal(source.get())
    effect(() => { sig.value = source.get() })
    effect(() => { source.set(sig.value) })
    return sig
  }

  // Solid-style [getter, setter]
  if (Array.isArray(source) && source.length === 2 && typeof source[0] === 'function') {
    const [get, set] = source
    const sig = signal(get())
    effect(() => { sig.value = get() })
    effect(() => { set(sig.value) })
    return sig
  }

  // Plain value - create signal
  return signal(source)
}

/**
 * Derive signal from source with transform
 */
export function map(sig, fn) {
  const s = from(sig)
  const derived = signal(fn(s.value))
  const dispose = effect(() => { derived.value = fn(s.value) })
  return Object.assign(derived, {
    [Symbol.dispose]() { dispose() }
  })
}

/**
 * Persist signal to localStorage
 */
export function persist(sig, key) {
  const s = from(sig)

  // Restore
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      s.value = JSON.parse(stored)
    }
  } catch (e) { /* ignore */ }

  // Save on change
  let dispose = null
  dispose = effect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(s.value))
    } catch (e) { /* ignore */ }
  })

  return Object.assign(s, {
    [Symbol.dispose]() {
      dispose?.()
    }
  })
}

/**
 * Throttle signal updates
 */
export function throttle(sig, ms = 16) {
  const s = from(sig)
  const throttled = signal(s.value)

  let last = 0
  let pending = null
  let prev = s.value

  const dispose = effect(() => {
    const v = s.value
    if (v === prev) return
    prev = v

    const now = Date.now()
    if (now - last >= ms) {
      last = now
      throttled.value = v
    } else if (!pending) {
      pending = setTimeout(() => {
        pending = null
        last = Date.now()
        throttled.value = s.value
      }, ms - (now - last))
    }
  })

  return Object.assign(throttled, {
    [Symbol.dispose]() {
      dispose?.()
      if (pending) clearTimeout(pending)
    }
  })
}

/**
 * Debounce signal updates
 */
export function debounce(sig, ms = 100) {
  const s = from(sig)
  const debounced = signal(s.value)

  let timeout = null

  const dispose = effect(() => {
    const v = s.value
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      debounced.value = v
    }, ms)
  })

  return Object.assign(debounced, {
    [Symbol.dispose]() {
      dispose?.()
      if (timeout) clearTimeout(timeout)
    }
  })
}

/**
 * Delay signal by ms
 */
export function delay(sig, ms = 100) {
  const s = from(sig)
  const delayed = signal(s.value)

  const dispose = effect(() => {
    const v = s.value
    setTimeout(() => { delayed.value = v }, ms)
  })

  return Object.assign(delayed, {
    [Symbol.dispose]() { dispose?.() }
  })
}

/**
 * Read-only view of signal
 */
export function readonly(sig) {
  const s = from(sig)

  return {
    get value() { return s.value },
    peek: () => s.value
  }
}

/**
 * Media query signal
 */
export function media(query) {
  const mq = window.matchMedia(query)
  const sig = signal(mq.matches)

  const handler = (e) => { sig.value = e.matches }
  mq.addEventListener('change', handler)

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      mq.removeEventListener('change', handler)
    }
  })
}

/**
 * Online status signal
 */
export function online() {
  const sig = signal(navigator.onLine)

  const onOnline = () => { sig.value = true }
  const onOffline = () => { sig.value = false }

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  })
}

/**
 * Visibility state signal
 */
export function visibility() {
  const sig = signal(document.visibilityState)

  const handler = () => { sig.value = document.visibilityState }
  document.addEventListener('visibilitychange', handler)

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      document.removeEventListener('visibilitychange', handler)
    }
  })
}

/**
 * Idle detection signal
 */
export function idle(timeout = 5000) {
  const sig = signal(false)
  let timer = null

  const reset = () => {
    sig.value = false
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { sig.value = true }, timeout)
  }

  const events = ['mousemove', 'keydown', 'scroll', 'touchstart']
  events.forEach(e => window.addEventListener(e, reset, { passive: true }))
  reset()

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      events.forEach(e => window.removeEventListener(e, reset))
      if (timer) clearTimeout(timer)
    }
  })
}

/**
 * Intersection observer signal (0-1 ratio)
 */
export function intersect(el, opts = {}) {
  const sig = signal(0)

  const observer = new IntersectionObserver(([entry]) => {
    sig.value = entry.intersectionRatio
  }, { threshold: [0, 0.25, 0.5, 0.75, 1], ...opts })

  observer.observe(el)

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      observer.disconnect()
    }
  })
}

/**
 * Element visibility signal (boolean)
 */
export function visible(el, opts = {}) {
  const ratio = intersect(el, opts)
  const sig = signal(ratio.value > 0)

  const dispose = effect(() => {
    sig.value = ratio.value > 0
  })

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      dispose?.()
      ratio[Symbol.dispose]?.()
    }
  })
}

/**
 * Animation frame ticker
 */
export function raf(fn) {
  const sig = signal(0)
  let id = null
  let running = true

  const tick = (t) => {
    if (!running) return
    sig.value = t
    fn?.(t)
    id = requestAnimationFrame(tick)
  }
  id = requestAnimationFrame(tick)

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      running = false
      if (id) cancelAnimationFrame(id)
    }
  })
}

/**
 * Interval ticker
 */
export function interval(ms = 1000) {
  const sig = signal(0)
  let count = 0

  const id = setInterval(() => {
    sig.value = ++count
  }, ms)

  return Object.assign(readonly(sig), {
    [Symbol.dispose]() {
      clearInterval(id)
    }
  })
}

/**
 * Countdown timer
 */
export function countdown(initial, ms = 1000) {
  const sig = signal(initial)

  const id = setInterval(() => {
    if (sig.value <= 0) {
      clearInterval(id)
      return
    }
    sig.value--
  }, ms)

  return Object.assign(sig, {
    [Symbol.dispose]() {
      clearInterval(id)
    }
  })
}

/**
 * Read signal value without tracking
 */
export function peek(sig) {
  return sig.peek?.() ?? sig.value
}
