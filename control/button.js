/**
 * Button control - action trigger
 *
 * Single:  { type: 'button', text: 'Save', onClick: fn }
 * Group:   { type: 'button', buttons: [{ text, onClick }, ...] }
 *          { type: 'button', buttons: { Save: fn, Reset: fn } }
 *          { type: 'button', buttons: { Save: { variant: 'secondary', onclick: fn }, Reset: fn } }
 * Inferred: { Save: fn, Reset: fn } → button group (via infer)
 * Icon:    { type: 'button', icon: '<svg …/>', text: 'Search' } – an inline SVG before the text (inked with
 *          currentColor); with no text the button is the icon alone, named by `title` for assistive tech.
 */

import control from './control.js'
import { signal } from '../signals.js'

const face = b => `<i class="s-icon" :if="${b}icon" :html="${b}icon" aria-hidden="true"></i><span class="s-button-text" :if="${b}text" :text="${b}text"></span>`
const singleTmpl = `<button :onclick="click" :disabled="_disabled || _loading" :aria-busy="_loading || null" :aria-label="!text && name || null" :class="{ 's-icon-only': icon && !text }">${face('')}</button>`
const groupTmpl = `<button :each="b in _buttons" :onclick="b.click" :disabled="b._disabled.value" :aria-label="!b.text && b.name || null" :class="[b.cls, b.icon && !b.text && 's-icon-only']">${face('b.')}</button>`

export default (sig, opts = {}) => {
  let { text, icon = null, name = null, onClick, disabled = false, variant, buttons, label, ...rest } = opts

  // Normalize buttons dict → array (value can be fn or { onclick, variant, ... })
  if (buttons && !Array.isArray(buttons)) {
    buttons = Object.entries(buttons).map(([text, v]) =>
      typeof v === 'function' ? { text, onClick: v } : { text, ...v, onClick: v.onClick || v.onclick }
    )
  }

  const type = variant ? `button ${variant}` : 'button'

  // Run handler; while its promise is pending, `busy` is set (and blocks re-entry)
  const asyncClick = (handler, busy, blocked = () => false) => async () => {
    if (busy.value || blocked() || !handler) return
    const r = handler()
    if (r instanceof Promise) { busy.value = true; try { await r } finally { busy.value = false } }
  }

  if (buttons) {
    const _buttons = buttons.map(b => {
      const _disabled = signal(b.disabled ?? false)
      return {
        text: b.text ?? b.label ?? '',
        icon: b.icon || null,
        name: b.name || b.title || null,
        cls: b.variant ? `s-${b.variant}` : '',
        _disabled,
        click: asyncClick(b.onClick || b.onclick, _disabled)
      }
    })
    return control(sig, { ...rest, label, type, template: groupTmpl, _buttons })
  }

  // Single button: the label IS the button text — no separate left descriptor.
  text = text ?? (icon ? '' : typeof label === 'string' && label ? label : 'Action')
  name = name ?? (typeof label === 'string' && label ? label : rest.title || null)

  const _disabled = signal(disabled)
  const _loading = signal(false)
  const click = asyncClick(onClick, _loading, () => _disabled.value)

  return control(sig, { ...rest, label: false, type, template: singleTmpl, text, icon, name, click, _disabled, _loading })
}
