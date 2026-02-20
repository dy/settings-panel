/**
 * settings-panel
 * Controls designed for purpose that feel right.
 */

import { effect } from 'sprae'
import store, { _signals } from 'sprae/store'
import base from './theme/default.js'

// Import control factories
import boolean from './control/boolean.js'
import number from './control/number.js'
import slider from './control/slider.js'
import select from './control/select.js'
import color from './control/color.js'
import folder from './control/folder.js'
import text from './control/text.js'
import textarea from './control/textarea.js'
import button from './control/button.js'

export { boolean, number, slider, select, color, folder, text, textarea, button }
export * from './signals.js'

// Control registry (folder excluded — it's a visual container, not a control)
const controls = {
  boolean,
  number,
  slider,
  select,
  color,
  text,
  textarea,
  button,
}

/**
 * Register a control type
 */
export function register(type, factory) {
  controls[type] = factory
  return factory
}

/**
 * Create settings panel
 */
export default function settings(schema, options = {}) {
  const {
    container = document.body,
    theme = base,
    title,
    collapsed,
    persist = false,
    onchange = options.onChange || options.onchange
  } = options

  // Inject theme CSS
  const themeIsFunc = typeof theme === 'function'
  const style = theme ? document.createElement('style') : null
  if (style) document.head.appendChild(style)

  // Create panel container (foldable <details> when collapsed is boolean)
  const foldable = title && typeof collapsed === 'boolean'
  const panel = document.createElement(foldable ? 'details' : 'div')
  panel.className = 's-panel'
  if (title) {
    if (foldable) { if (!collapsed) panel.open = true }
    const heading = document.createElement(foldable ? 'summary' : 'div')
    heading.className = foldable ? '' : 's-panel-title'
    heading.textContent = title
    panel.appendChild(heading)
  }
  const body = document.createElement('div')
  body.className = 's-panel-content'
  panel.appendChild(body)

  // ── Parse flat schema: groups + fields ──
  const entries = []
  for (const [key, def] of Object.entries(schema)) {
    const dot = key.indexOf('.')
    if (dot > 0) {
      // Grouped field: 'params.shade' → group 'params', key 'shade'
      const group = key.slice(0, dot)
      const shortKey = key.slice(dot + 1)
      entries.push({ shortKey, group, field: infer(shortKey, def) })
    } else {
      const inferred = infer(key, def)
      if (inferred.type === 'folder') {
        entries.push({ shortKey: key, isGroup: true, field: inferred })
      } else {
        entries.push({ shortKey: key, field: inferred })
      }
    }
  }

  // ── Flat store from all non-group entries ──
  const initials = {}
  for (const e of entries) {
    if (!e.isGroup) initials[e.shortKey] = e.field.value ?? null
  }

  // Merge persisted state
  const storeKey = persist === true ? 'settings-panel' : persist
  if (storeKey) {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey))
      if (saved) for (const k of Object.keys(initials)) {
        if (k in saved && saved[k] != null) initials[k] = saved[k]
      }
    } catch {}
  }

  const state = store(initials)

  // Apply theme CSS (after state resolved, before controls — so getComputedStyle works)
  if (style) style.textContent = themeIsFunc ? theme(state) : theme

  // ── Mount panel before controls (so getComputedStyle works during creation) ──
  const target = typeof container === 'string'
    ? document.querySelector(container)
    : container
  target?.appendChild(panel)

  // ── Build DOM in schema order ──
  const groupEls = {}
  const disposers = []

  for (const e of entries) {
    if (e.isGroup) {
      const f = folder({ label: e.field.label || e.shortKey, collapsed: e.field.collapsed, container: body })
      groupEls[e.shortKey] = f
      disposers.push(f[Symbol.dispose])
      continue
    }

    const factory = controls[e.field.type] || controls[e.field.type.split(/\s+/)[0]]
    if (!factory) { console.warn(`Unknown control type: ${e.field.type}`); continue }

    const target = e.group ? groupEls[e.group]?.content : body
    const decorated = factory(state[_signals][e.shortKey], {
      ...e.field,
      container: target || body
    })
    if (decorated.el) decorated.el.dataset.key = e.shortKey
    disposers.push(decorated[Symbol.dispose])
  }

  // ── Reactive theme update ──
  let stopTheme
  if (style && themeIsFunc) {
    stopTheme = effect(() => { style.textContent = theme(state) })
  }

  // ── Persistence ──
  let stopPersist
  if (storeKey) {
    let ready = false
    queueMicrotask(() => { ready = true })
    stopPersist = effect(() => {
      const json = JSON.stringify(state)
      if (!ready) return
      localStorage.setItem(storeKey, json)
    })
  }

  // ── Onchange ──
  let stopOnchange
  if (onchange) {
    let ready = false
    queueMicrotask(() => { ready = true })
    stopOnchange = effect(() => {
      // Touch all keys to subscribe
      for (const k of Object.keys(state)) state[k]
      if (!ready) return
      onchange(state)
    })
  }

  state[Symbol.dispose] = () => {
    stopTheme?.()
    stopPersist?.()
    stopOnchange?.()
    disposers.forEach(d => d?.())
    panel.remove()
    style?.remove()
  }

  return state
}

// Type inference

const isColor = (v) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)
const isRgb = (v) => typeof v === 'string' && /^rgba?\(/i.test(v)
const isHsl = (v) => typeof v === 'string' && /^hsla?\(/i.test(v)
const isMultiline = (v) => typeof v === 'string' && v.includes('\n')
const isNormalized = (v) => typeof v === 'number' && v >= 0 && v <= 1 && v % 1 !== 0

export function infer(key, def) {
  if (def && typeof def === 'object' && def.type) {
    return { label: key, ...def }
  }

  if (typeof def === 'boolean') {
    return { type: 'boolean', value: def, label: key }
  }

  if (typeof def === 'number') {
    if (isNormalized(def)) {
      return { type: 'slider', value: def, min: 0, max: 1, step: 0.01, label: key }
    }
    return { type: 'number', value: def, label: key }
  }

  if (typeof def === 'string') {
    if (isColor(def) || isRgb(def) || isHsl(def)) {
      return { type: 'color', value: def, label: key }
    }
    if (isMultiline(def)) {
      return { type: 'textarea', value: def, label: key }
    }
    return { type: 'text', value: def, label: key }
  }

  if (typeof def === 'function') {
    return { type: 'button', onClick: def, label: key }
  }

  if (def && typeof def === 'object') {
    if (Array.isArray(def)) {
      if (def.length === 0) {
        return { type: 'text', value: '', label: key }
      }
      if (def.length >= 2 && def.length <= 4 && def.every(v => typeof v === 'number')) {
        return { type: 'vector', value: def, dimensions: def.length, label: key }
      }
      if (def.every(v => typeof v === 'string' || (v && typeof v === 'object' && 'value' in v))) {
        return { type: 'select', options: def, value: typeof def[0] === 'string' ? def[0] : def[0]?.value, label: key }
      }
      return { type: 'text', value: JSON.stringify(def), label: key }
    }

    if (def.options) {
      const firstOpt = Array.isArray(def.options) ? def.options[0] : Object.values(def.options)[0]
      const firstVal = typeof firstOpt === 'string' ? firstOpt : firstOpt?.value
      return { type: 'select', value: def.value ?? firstVal, label: key, ...def }
    }

    if ('min' in def || 'max' in def) {
      return { type: 'slider', min: def.min ?? 0, max: def.max ?? 100, value: def.value ?? def.min ?? 0, label: key, ...def }
    }

    if ('value' in def) {
      const inferred = infer(key, def.value)
      return { ...inferred, ...def, label: def.label || key }
    }

    // Dict of functions → button group: { Save: fn, Reset: fn }
    const vals = Object.values(def)
    if (vals.length && vals.every(v => typeof v === 'function')) {
      return { type: 'button', buttons: def, label: key }
    }
  }

  return { type: 'text', value: String(def ?? ''), label: key }
}
