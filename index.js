/**
 * settings-panel v2
 * Controls designed for purpose that feel right.
 */

import { store } from 'sprae'
import { infer } from './infer.js'
import { injectStyles } from './theme/default.js'

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
injectStyles()


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
function createControl(key, field, state, prefix = '') {
  const { type } = field
  const fullKey = prefix + key

  // Folder is special - contains children
  if (type === 'folder') {
    const folder = document.createElement('s-folder')
    folder.setAttribute('label', field.label || key)
    if (field.collapsed) folder.setAttribute('collapsed', '')

    // Wait for folder to initialize, then add children
    requestAnimationFrame(() => {
      const content = folder.content || folder.querySelector('.s-content')
      if (!content) return

      for (const [childKey, childDef] of Object.entries(field.children || {})) {
        const childField = infer(childKey, childDef)
        const childControl = createControl(childKey, childField, state, fullKey + '.')
        if (childControl) content.appendChild(childControl)
      }
    })
    return folder
  }

  // Map type to control element
  const tagMap = {
    boolean: 's-boolean',
    number: 's-number',
    slider: 's-slider',
    select: 's-select',
    color: 's-color',
    text: 's-text',
    textarea: 's-textarea',
    button: 's-button',
  }

  const tag = tagMap[type]
  if (!tag) {
    console.warn(`Unknown control type: ${type}`)
    return null
  }

  const el = document.createElement(tag)
  el.setAttribute('key', fullKey)
  el.setAttribute('label', field.label || key)

  // Button has special handling for action
  if (type === 'button' && field.action) {
    el.onclick = field.action
    if (field.text) el.setAttribute('text', field.text)
  }

  // Pass field options as attributes
  for (const [k, v] of Object.entries(field)) {
    if (k === 'type' || k === 'value' || k === 'label' || k === 'action') continue
    if (v === undefined || v === null) continue
    if (typeof v === 'object') {
      el.setAttribute(k, JSON.stringify(v))
    } else {
      el.setAttribute(k, v)
    }
  }

  // Bind to state
  el.state = state
  el.field = field

  return el
}

export { settings, infer }
