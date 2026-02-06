/**
 * Slider control - linear, log, range
 */

import control from './control.js'
import { signal, effect } from '../signals.js'

const template = `
  <input type="range" :value="_display" :min="displayMin" :max="displayMax" :step="displayStep" :oninput="e => set(+e.target.value)" />
  <span class="s-value" :text="formatted"></span>
`

const defaultFormat = v => v >= 1000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3)

export default (sig, opts = {}) => {
  const { min = 0, max = 1, step = 0.01, scale = 'linear', format = defaultFormat, ...rest } = opts

  const isLog = scale === 'log'
  const logMin = isLog ? Math.log(Math.max(min, 1e-10)) : min
  const logMax = isLog ? Math.log(max) : max

  const toDisplay = v => isLog ? ((Math.log(Math.max(v, 1e-10)) - logMin) / (logMax - logMin)) * 1000 : v
  const fromDisplay = d => isLog ? Math.exp(logMin + (d / 1000) * (logMax - logMin)) : d

  const _display = signal(toDisplay(sig.value))
  const dispose = effect(() => { _display.value = toDisplay(sig.value) })

  return control(sig, {
    ...rest,
    type: 'slider', template, dispose, _display,
    displayMin: isLog ? 0 : min,
    displayMax: isLog ? 1000 : max,
    displayStep: isLog ? 1 : step,
    set: d => { sig.value = Math.min(max, Math.max(min, fromDisplay(d))) },
    get formatted() { return format(sig.value) }
  })
}
