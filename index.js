/**
 * settings-panel v2
 * Controls designed for purpose that feel right.
 */

import store from 'sprae/store'
import { infer } from './infer.js'
import { injectThemes, themes, themeCatalog } from './theme/index.js'

// Controls (auto-register)
import './control/boolean.js'
import './control/number.js'
import './control/slider.js'
import './control/select.js'
import './control/color.js'
import './control/folder.js'
import './control/text.js'
import './control/textarea.js'
import './control/button.js'

// Inject theme CSS
injectThemes()

// Control type → element tag mapping (extensible)
export const controlTypes = {
  boolean: 's-boolean',
  number: 's-number',
  slider: 's-slider',
  select: 's-select',
  color: 's-color',
  text: 's-text',
  textarea: 's-textarea',
  button: 's-button',
  folder: 's-folder',
}


/**
 * Create settings panel
 * @param {Object} schema - Field definitions
 * @param {Object} [options] - Panel options
 * @returns {Object} Reactive store with values
 */
export default function settings(schema, options = {}) {
  const {
    container = document.body,
    theme = 'default',
    collapsed = false,
    //
  } = options

  // Extract values recursively
  function extractValues(schema, prefix = '') {
    const values = {}
    for (const [key, def] of Object.entries(schema)) {
      const field = infer(key, def)
      if (field.type === 'folder' && field.children) {
        Object.assign(values, extractValues(field.children, key + '.'))
      } else {
        values[prefix + key] = field.value
      }
    }
    return values
  }

  // Normalize schema recursively
  function normalizeSchema(schema) {
    const normalized = {}
    for (const [key, def] of Object.entries(schema)) {
      normalized[key] = infer(key, def)
    }
    return normalized
  }

  const normalized = normalizeSchema(schema)
  const values = extractValues(schema)

  // Create reactive store for values
  const state = store(values)

  // Create panel element
  const panel = document.createElement('settings-panel')
  panel.setAttribute('theme', theme)
  if (collapsed) panel.setAttribute('collapsed', '')

  // Expose factory for folder children
  panel._state = state
  panel._createControl = (name, field, prefix) => createControl(name, field, state, prefix)

  // Render controls
  for (const [key, field] of Object.entries(normalized)) {
    const control = createControl(key, field, state, '')
    if (control) panel.appendChild(control)
  }

  container.appendChild(panel)

  // Return reactive state
  return state
}

/**
 * Create control element for field
 */
function createControl(name, field, state, prefix = '') {
  const { type } = field
  const path = prefix + name

  const tag = controlTypes[type]
  if (!tag) {
    console.warn(`Unknown control type: ${type}`)
    return null
  }

  const el = document.createElement(tag)
  el.setAttribute('name', path)

  // Common params (handled specially)
  const reserved = ['type', 'value', 'children']

  // Pass field config as property (controls read what they need)
  el.field = field
  el.state = state

  // Set all other attributes (controls read what they need)
  for (const [k, v] of Object.entries(field)) {
    if (reserved.includes(k)) continue
    if (v == null) continue
    // Functions are set as properties, not attributes
    if (typeof v === 'function') {
      el[k] = v
    } else {
      el.setAttribute(k, typeof v === 'object' ? JSON.stringify(v) : v)
    }
  }

  return el
}

export { settings, infer, createControl }
export { themes, themeCatalog }
