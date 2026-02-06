/**
 * Button control - action trigger
 */

import sprae, { signal } from 'sprae'

const template = `
  <div class="s-control s-button" :class="{ disabled: _disabled, loading: _loading }">
    <span class="s-label" :text="label" :hidden="!label"></span>
    <span class="s-input">
      <button :onclick="click" :disabled="_disabled" :text="text"></button>
    </span>
  </div>
`

export default (sig, opts = {}) => {
  const { label = '', text = 'Action', onClick, disabled = false } = opts

  const el = document.createElement('div')
  el.innerHTML = template

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

  sprae(el, { label, text, click, _disabled, _loading })

  return Object.assign(sig, {
    el: el.firstElementChild,
    [Symbol.dispose]() { el.firstElementChild?.remove() }
  })
}
