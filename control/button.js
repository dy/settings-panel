/**
 * Button control - action trigger
 *
 * Single:  { type: 'button', text: 'Save', onClick: fn }
 * Group:   { type: 'button', buttons: [{ text, onClick }, ...] }
 *          { type: 'button', buttons: { Save: fn, Reset: fn } }
 * Inferred: { Save: fn, Reset: fn } → button group (via infer)
 */

import control from './control.js'
import { signal } from 'sprae'

const singleTmpl = `<button :onclick="click" :disabled="_disabled" :text="text"></button>`
const groupTmpl = `<button :each="b in _buttons" :onclick="b.click" :disabled="b._disabled.value" :text="b.text"></button>`

export default (sig, opts = {}) => {
  let { text = 'Action', onClick, disabled = false, variant, buttons, ...rest } = opts

  // Normalize buttons dict → array
  if (buttons && !Array.isArray(buttons)) {
    buttons = Object.entries(buttons).map(([text, onClick]) => ({ text, onClick }))
  }

  const type = variant ? `button ${variant}` : 'button'

  if (buttons) {
    const _buttons = buttons.map(b => {
      const _disabled = signal(b.disabled ?? false)
      return {
        text: b.text || b.label || '',
        _disabled,
        click: async () => {
          if (_disabled.value || !b.onClick) return
          const r = b.onClick()
          if (r instanceof Promise) { _disabled.value = true; try { await r } finally { _disabled.value = false } }
        }
      }
    })
    return control(sig, { ...rest, type, template: groupTmpl, _buttons })
  }

  const _disabled = signal(disabled)
  const _loading = signal(false)

  const click = async () => {
    if (_disabled.value || _loading.value || !onClick) return
    const result = onClick()
    if (result instanceof Promise) {
      _loading.value = true
      try { await result } finally { _loading.value = false }
    }
  }

  return control(sig, { ...rest, type, template: singleTmpl, text, click, _disabled, _loading })
}
