/**
 * Type inference for settings fields
 * Maps primitives and descriptors to canonical field definitions
 */

const isColor = (v) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)
const isRgb = (v) => typeof v === 'string' && /^rgba?\(/i.test(v)
const isHsl = (v) => typeof v === 'string' && /^hsla?\(/i.test(v)

/**
 * Infer field definition from value
 * @param {string} key - Field key (used for label)
 * @param {*} def - Raw field definition or primitive
 * @returns {Object} Normalized field definition
 */
export function infer(key, def) {
  // Already a full definition with type
  if (def && typeof def === 'object' && def.type) {
    return {
      label: key,
      ...def,
    }
  }

  // Primitive inference
  if (typeof def === 'boolean') {
    return { type: 'boolean', value: def, label: key }
  }

  if (typeof def === 'number') {
    return { type: 'number', value: def, label: key }
  }

  if (typeof def === 'string') {
    if (isColor(def) || isRgb(def) || isHsl(def)) {
      return { type: 'color', value: def, label: key }
    }
    return { type: 'text', value: def, label: key }
  }

  if (typeof def === 'function') {
    return { type: 'button', action: def, label: key }
  }

  // Object with special keys
  if (def && typeof def === 'object') {
    // Array of options -> select
    if (Array.isArray(def)) {
      return { type: 'select', options: def, value: def[0], label: key }
    }

    // Has options -> select
    if (def.options) {
      return {
        type: 'select',
        value: def.value ?? (Array.isArray(def.options) ? def.options[0] : Object.values(def.options)[0]),
        label: key,
        ...def,
      }
    }

    // Has min/max -> slider
    if ('min' in def || 'max' in def) {
      return {
        type: 'slider',
        min: def.min ?? 0,
        max: def.max ?? 100,
        value: def.value ?? def.min ?? 0,
        label: key,
        ...def,
      }
    }

    // Has children -> folder
    if (def.children) {
      return {
        type: 'folder',
        label: key,
        ...def,
      }
    }

    // Nested object without explicit type -> folder
    const hasNestedControls = Object.values(def).some(
      v => typeof v === 'object' || typeof v === 'boolean' || typeof v === 'number'
    )
    if (hasNestedControls && !('value' in def)) {
      return {
        type: 'folder',
        children: def,
        label: key,
      }
    }

    // Has value -> infer from value
    if ('value' in def) {
      const inferred = infer(key, def.value)
      return { ...inferred, ...def, label: def.label || key }
    }
  }

  // Fallback
  return { type: 'text', value: String(def ?? ''), label: key }
}

export default infer
