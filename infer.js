/**
 * Type inference for settings fields
 * Maps primitives and descriptors to canonical field definitions
 */

const isColor = (v) => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)
const isRgb = (v) => typeof v === 'string' && /^rgba?\(/i.test(v)
const isHsl = (v) => typeof v === 'string' && /^hsla?\(/i.test(v)
const isMultiline = (v) => typeof v === 'string' && v.includes('\n')
const isNormalized = (v) => typeof v === 'number' && v >= 0 && v <= 1 && v % 1 !== 0

/**
 * Infer field definition from value
 * @param {string} key - Field key (used for label)
 * @param {*} def - Raw field definition or primitive
 * @returns {Object} Normalized field definition
 */
export function infer(key, def) {
  // Already a full definition with type
  if (def && typeof def === 'object' && def.type) {
    return { label: key, ...def }
  }

  // Primitive inference
  if (typeof def === 'boolean') {
    return { type: 'boolean', value: def, label: key }
  }

  if (typeof def === 'number') {
    // 0-1 float → slider (normalized range)
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

  // Object/Array inference
  if (def && typeof def === 'object') {
    if (Array.isArray(def)) {
      // Empty array → ambiguous, fallback
      if (def.length === 0) {
        return { type: 'text', value: '', label: key }
      }
      // Array of 2-4 numbers → vector
      if (def.length >= 2 && def.length <= 4 && def.every(v => typeof v === 'number')) {
        return { type: 'vector', value: def, dimensions: def.length, label: key }
      }
      // Array of strings or option objects → select
      if (def.every(v => typeof v === 'string' || (v && typeof v === 'object' && 'value' in v))) {
        return { type: 'select', options: def, value: typeof def[0] === 'string' ? def[0] : def[0]?.value, label: key }
      }
      // Mixed/unsupported array → text fallback
      return { type: 'text', value: JSON.stringify(def), label: key }
    }

    // Has options → select
    if (def.options) {
      const firstOpt = Array.isArray(def.options) ? def.options[0] : Object.values(def.options)[0]
      const firstVal = typeof firstOpt === 'string' ? firstOpt : firstOpt?.value
      return {
        type: 'select',
        value: def.value ?? firstVal,
        label: key,
        ...def,
      }
    }

    // Has min/max → slider
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

    // Has children → folder
    if (def.children) {
      return { type: 'folder', label: key, ...def }
    }

    // Has value → infer from value, merge other props
    if ('value' in def) {
      const inferred = infer(key, def.value)
      return { ...inferred, ...def, label: def.label || key }
    }

    // Nested object without explicit type → folder
    const hasNestedControls = Object.values(def).some(
      v => v != null && (typeof v === 'object' || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'function')
    )
    if (hasNestedControls) {
      return { type: 'folder', children: def, label: key }
    }
  }

  // Fallback
  return { type: 'text', value: String(def ?? ''), label: key }
}

export default infer
