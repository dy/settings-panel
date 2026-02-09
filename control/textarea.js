/**
 * Textarea control - multiline text input, auto-grows from rows
 */

import control from './control.js'

const tpl = `<textarea :value="value" :placeholder="placeholder" :readonly="readonly"></textarea>`

function autoHeight(el, minH) {
  el.style.height = '0'
  el.style.height = Math.max(el.scrollHeight, minH) + 'px'
}

export default (sig, opts = {}) => {
  const { placeholder = '', readonly = false, rows = 3, ...rest } = opts

  const result = control(sig, { ...rest, type: 'textarea', template: tpl, value: sig, placeholder, readonly })
  const ta = result.el.querySelector('textarea')
  ta.rows = rows

  // Compute min height from rows, then auto-grow beyond
  let minH = 0
  const grow = () => autoHeight(ta, minH)

  ta.addEventListener('input', grow)
  const obs = new MutationObserver(grow)
  obs.observe(ta, { attributes: true, attributeFilter: ['value'] })
  requestAnimationFrame(() => { minH = ta.scrollHeight; grow() })

  const origDispose = result[Symbol.dispose]
  result[Symbol.dispose] = () => { obs.disconnect(); origDispose() }

  return result
}
