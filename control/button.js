/**
 * Button control - action trigger
 */

import control from './control.js'
import { signal } from 'sprae'

const template = `<button :onclick="click" :disabled="_disabled" :text="text"></button>`

export default (sig, opts = {}) => {
  const { text = 'Action', onClick, disabled = false, ...rest } = opts

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

  return control(sig, {
    ...rest,
    type: 'button',
    template,
    text,
    click,
    _disabled,
    _loading
  })
}
