/**
 * Style object → CSS string serializer
 * Object mirrors CSS nesting: string values = declarations, object values = nested rules.
 *
 *   css({ '.panel': { color: 'red', '.child': { gap: '8px' } } })
 *   → ".panel {\n  color: red;\n  .child {\n    gap: 8px;\n  }\n}\n"
 */
export function css(obj, indent = '') {
  let out = ''
  for (const k in obj) {
    const v = obj[k]
    if (v == null) continue
    if (typeof v === 'object') {
      out += `${indent}${k} {\n${css(v, indent + '  ')}${indent}}\n`
    } else {
      out += `${indent}${k}: ${v};\n`
    }
  }
  return out
}

/**
 * Deep merge style objects. b overrides a.
 *
 *   merge(baseTheme(), { '.s-panel': { color: 'blue' } })
 */
export function merge(a, b) {
  const r = { ...a }
  for (const k in b) {
    r[k] = (a[k] && typeof a[k] === 'object' && typeof b[k] === 'object')
      ? merge(a[k], b[k])
      : b[k]
  }
  return r
}
