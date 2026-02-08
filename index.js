/**
 * settings-panel
 * Controls designed for purpose that feel right.
 */

import { signal, effect } from 'sprae'
import soft from './theme/soft.js'

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

// Control registry
const controls = {
  boolean,
  number,
  slider,
  select,
  color,
  folder,
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
    theme = soft,
    collapsed = false,
    onchange = options.onChange
  } = options

  // Inject theme CSS
  const style = document.createElement('style')
  const stopTheme = effect(() => {
    style.textContent = theme.valueOf()()
  })
  document.head.appendChild(style)

  // Create panel container
  const panel = document.createElement('div')
  panel.className = 's-panel'
  if (collapsed) panel.classList.add('s-collapsed')

  // Root folder builds all controls
  const sig = signal(null)
  const root = folder(sig, {
    children: schema,
    controls,
    container: panel,
    collapsed: false,
    label: ''
  })

  // Mount panel
  const target = typeof container === 'string'
    ? document.querySelector(container)
    : container
  target?.appendChild(panel)

  const state = root.value

  // Wire onchange via single effect on all state keys (recursive into folders)
  let stopOnchange
  if (onchange) {
    const touch = (obj) => {
      for (const k of Object.keys(obj)) {
        const v = obj[k]
        if (v && typeof v === 'object' && !Array.isArray(v)) touch(v)
      }
    }
    let ready = false
    queueMicrotask(() => { ready = true })
    stopOnchange = effect(() => {
      touch(state)
      if (!ready) return
      onchange(state)
    })
  }

  state[Symbol.dispose] = () => {
    stopOnchange?.()
    root[Symbol.dispose]()
    panel.remove()
    style.remove()
    stopTheme()
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

    if (def.children) {
      return { type: 'folder', label: key, ...def }
    }

    if ('value' in def) {
      const inferred = infer(key, def.value)
      return { ...inferred, ...def, label: def.label || key }
    }

    const hasNestedControls = Object.values(def).some(
      v => v != null && (typeof v === 'object' || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'function')
    )
    if (hasNestedControls) {
      return { type: 'folder', children: def, label: key }
    }
  }

  return { type: 'text', value: String(def ?? ''), label: key }
}
