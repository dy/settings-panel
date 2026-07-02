/**
 * settings-panel
 * Controls designed for purpose that feel right.
 */

import { effect } from 'sprae'
import store, { _signals } from 'sprae/store'
import base from './theme/default.js'
import { normalizeHex } from './theme/color.js'
import { resolveEl } from './control/util.js'

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
import info from './control/info.js'
import separator from './control/separator.js'
import vector from './control/vector.js'
import xy from './control/xy.js'
import knob from './control/knob.js'

export { boolean, number, slider, select, color, folder, text, textarea, button, info, separator, vector, xy, knob }
export * from './signals.js'

// Control registry (folder & separator excluded — structural, handled in settings())
const controls = {
  boolean,
  number,
  slider,
  select,
  color,
  text,
  textarea,
  button,
  info,
  vector,
  xy,
  knob,
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
    theme = base(),  // default soft theme (call for a static sheet; pass soft({...}) or (s)=>soft({...}) to tune)
    title,
    collapsed,
    search = false,
    persist = false,
    key,
    controls: extraControls,
  } = options
  const onchange = options.onChange ?? options.onchange
  const registry = extraControls ? { ...controls, ...extraControls } : controls

  // ── Parse flat schema: groups + fields ──
  const entries = []
  for (const [key, def] of Object.entries(schema)) {
    const dot = key.indexOf('.')
    if (dot > 0) {
      const group = key.slice(0, dot)
      const shortKey = key.slice(dot + 1)
      const field = infer(shortKey, def)
      entries.push({ shortKey, group, field, isSeparator: field.type === 'separator' })
    } else {
      const inferred = infer(key, def)
      if (inferred.type === 'folder') {
        entries.push({ shortKey: key, isGroup: true, field: inferred })
      } else if (inferred.type === 'separator') {
        entries.push({ shortKey: key, isSeparator: true, field: inferred })
      } else {
        entries.push({ shortKey: key, field: inferred })
      }
    }
  }

  // ── Flat store from all non-group entries ──
  // State is flat (state.x, not state.group.x), so a short key shared across two
  // folders collides on one signal — warn rather than corrupt silently.
  const initials = {}
  for (const e of entries) {
    if (e.isGroup || e.isSeparator) continue  // structural — no state
    if (e.shortKey in initials) console.warn(`[settings-panel] Key collision: '${e.shortKey}'${e.group ? ` in group '${e.group}'` : ''} — flat state shares one signal per key`)
    initials[e.shortKey] = e.field.value ?? null
  }

  // Merge persisted state (restore every saved key — including falsy false/0/'')
  const storeKey = persist === true ? 'settings-panel' : persist
  if (storeKey) {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey))
      if (saved) for (const k of Object.keys(initials)) {
        if (k in saved) initials[k] = saved[k]
      }
    } catch {}
  }

  const state = store(initials)

  // Inject theme CSS
  const themeIsFunc = typeof theme === 'function'
  const style = theme ? document.createElement('style') : null
  if (style) document.head.appendChild(style)

  // Create panel container. `collapsed` may be a boolean, a function of initials,
  // or a signal (two-way bound below — the universal programmatic toggle).
  const collapsedSig = collapsed && typeof collapsed === 'object' && 'value' in collapsed ? collapsed : null
  const resolved = collapsedSig ? collapsedSig.value
    : typeof collapsed === 'function' ? collapsed(initials)
    : collapsed
  const foldable = title && typeof resolved === 'boolean'
  const panel = document.createElement(foldable ? 'details' : 'div')
  panel.className = 's-panel'
  if (title) {
    if (foldable) { if (!resolved) panel.open = true }
    const heading = document.createElement(foldable ? 'summary' : 'div')
    heading.className = foldable ? '' : 's-panel-title'
    heading.textContent = title
    // Explicit disclosure indicator (themes may style it; harmless if unstyled).
    // Inner glyph lets themes paint an icon + its bevel as separate layers.
    if (foldable) heading.insertAdjacentHTML('beforeend', '<span class="s-fold-icon" aria-hidden="true"><i></i></span>')
    panel.appendChild(heading)
  }
  const body = document.createElement('div')
  body.className = 's-panel-content'
  panel.appendChild(body)

  if (search && title) initSearch(panel, body)

  // Apply theme CSS (after state resolved, before controls — so getComputedStyle works)
  if (style) style.textContent = themeIsFunc ? theme(state) : theme

  // ── Mount panel before controls (so getComputedStyle works during creation) ──
  resolveEl(container)?.appendChild(panel)

  // ── Build DOM in schema order ──
  const groupEls = {}
  const disposers = []

  for (const e of entries) {
    if (e.isGroup) {
      const f = folder({ label: e.field.label || e.shortKey, collapsed: e.field.collapsed, name: e.field.name, variant: e.field.variant, container: body })
      groupEls[e.shortKey] = f
      disposers.push(f[Symbol.dispose])
      continue
    }

    if (e.isSeparator) {
      // structural divider — render with an explicit label only (ignore the auto key-label)
      const label = e.field.label !== e.shortKey ? e.field.label : null
      const s = separator({ label, container: (e.group ? groupEls[e.group]?.content : body) || body })
      disposers.push(s[Symbol.dispose])
      continue
    }

    // Accept colon variant syntax ('select:segmented') alongside { type, variant }
    let typeStr = e.field.type, variant = e.field.variant
    if (typeStr.includes(':')) { const [b, v] = typeStr.split(':'); typeStr = b; variant ??= v }
    const factory = registry[typeStr] || registry[typeStr.split(/\s+/)[0]]
    if (!factory) { console.warn(`[settings-panel] Unknown control type: ${e.field.type}`); continue }

    const target = e.group ? groupEls[e.group]?.content : body
    const decorated = factory(state[_signals][e.shortKey], {
      ...e.field,
      type: typeStr,
      variant,
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
      try { localStorage.setItem(storeKey, json) } catch {}
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

  // ── Collapsed signal: two-way bind to <details>.open ──
  let stopCollapsed, onToggle
  if (collapsedSig && foldable) {
    stopCollapsed = effect(() => { panel.open = !collapsedSig.value })
    onToggle = () => { const c = !panel.open; if (collapsedSig.value !== c) collapsedSig.value = c }
    panel.addEventListener('toggle', onToggle)
  }

  // ── Keyboard shortcut to toggle the panel ──
  let onKey
  if (key && foldable) {
    onKey = (e) => {
      const t = e.target
      if ((t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) && !e.ctrlKey && !e.metaKey) return
      if (!matchKey(e, key)) return
      e.preventDefault()
      collapsedSig ? (collapsedSig.value = !collapsedSig.value) : (panel.open = !panel.open)
    }
    document.addEventListener('keydown', onKey)
  }

  // Dispose is a non-enumerable method so it stays out of state enumeration / JSON / the store proxy's change tracking.
  Object.defineProperty(state, Symbol.dispose, {
    configurable: true,
    value: () => {
      stopTheme?.()
      stopPersist?.()
      stopOnchange?.()
      stopCollapsed?.()
      if (onToggle) panel.removeEventListener('toggle', onToggle)
      if (onKey) document.removeEventListener('keydown', onKey)
      disposers.forEach(d => d?.())
      panel.remove()
      style?.remove()
    }
  })

  return state
}

// Search: filter controls by label (opt-in via `search` option; themes style .s-search)
function initSearch(panel, body) {
  const heading = panel.firstElementChild
  heading.insertAdjacentHTML('beforeend',
    '<span class="s-search"><button type="button" class="s-search-btn" aria-label="Filter controls"></button><input class="s-search-input" type="search" placeholder="Filter" /></span>')
  const btn = heading.querySelector('.s-search-btn')
  const inp = heading.querySelector('.s-search-input')
  const apply = q => {
    q = q.trim().toLowerCase()
    for (const el of body.querySelectorAll('.s-control')) {
      const label = el.querySelector('.s-label')?.textContent || el.dataset.key || ''
      el.hidden = !!q && !label.toLowerCase().includes(q)
    }
    // folders with no matching controls fold away entirely
    for (const f of body.querySelectorAll('.s-folder'))
      f.hidden = !!q && !f.querySelector('.s-control:not([hidden])')
  }
  btn.addEventListener('click', e => {
    e.preventDefault() // inside <summary>: don't toggle the fold
    const open = panel.classList.toggle('s-searching')
    if (open) inp.focus()
    else { inp.value = ''; apply('') }
  })
  inp.addEventListener('click', e => e.preventDefault())
  inp.addEventListener('input', () => apply(inp.value))
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') btn.click() })
}

// Match a KeyboardEvent against a combo string like 'h' or 'ctrl+shift+s'
function matchKey(e, combo) {
  const parts = combo.toLowerCase().split('+').map(s => s.trim())
  const k = parts.pop()
  const mods = new Set(parts)
  return e.ctrlKey === mods.has('ctrl') &&
    e.shiftKey === mods.has('shift') &&
    e.altKey === mods.has('alt') &&
    e.metaKey === mods.has('meta') &&
    e.key.toLowerCase() === k
}

// Type inference

const isColor = (v) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v.trim())
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
    if (!Number.isFinite(def)) return { type: 'number', value: 0, label: key }
    // Fractional 0–1 → slider; bare integers (incl. 0 and 1) stay number inputs,
    // since an integer is as likely a count as a normalized value. Override explicitly otherwise.
    if (isNormalized(def)) {
      return { type: 'slider', value: def, min: 0, max: 1, step: 0.01, label: key }
    }
    return { type: 'number', value: def, label: key }
  }

  if (typeof def === 'string') {
    if (isColor(def) || isRgb(def) || isHsl(def)) {
      return { type: 'color', value: isColor(def) ? normalizeHex(def) : def, label: key }
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
      // rgba: [r,g,b,a], 8-bit channels (one > 1) + alpha in 0–1 → color
      if (def.length === 4 && def[3] >= 0 && def[3] <= 1 &&
          def.slice(0, 3).every(v => v >= 0 && v <= 255) && def.slice(0, 3).some(v => v > 1)) {
        const [r, g, b, a] = def
        return { type: 'color', variant: 'rgba', value: `rgba(${r}, ${g}, ${b}, ${a})`, label: key }
      }
      // Numeric arrays → vector (N labeled axis inputs)
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
