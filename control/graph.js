/**
 * Graph — a read-only plot of a value, as Tweakpane's and Leva's monitor graphs draw one.
 *
 * A number is drawn as a line of its recent history, sampled every `interval` ms (default 200) into the last
 * `history` samples (default 64), the newest at the right; an array of numbers is plotted as it is (a waveform,
 * a spectrum). opts: min, max (the plot's range; by default the data's own), readout (false | true | fn), format.
 * It draws on the pad's surface (.s-pad.s-plot), so a theme's pad dresses it; it carries its value as data-value.
 */

import control from './control.js'
import { signal, computed } from '../signals.js'

const template = `
  <div class="s-pad s-plot" :data-value="display">
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><polyline :points="points" /></svg>
  </div>
`

export default (sig, opts = {}) => {
  const { min, max, history = 64, interval = 200, readout = false, format = v => Array.isArray(v) ? `[${v.slice(0, 3).map(n => +(+n).toFixed(2)).join(', ')}${v.length > 3 ? ', …' : ''}]` : String(+(+v).toFixed(3)), dispose, ...rest } = opts

  // a number's history, sampled on a clock so a value that holds still still draws its time
  const past = signal([])
  const sample = () => {
    const v = sig.value
    if (Array.isArray(v) || !Number.isFinite(+v)) return
    past.value = [...past.value, +v].slice(-history)
  }
  sample()
  const clock = setInterval(sample, interval)

  const points = computed(() => {
    const v = sig.value, d = Array.isArray(v) ? v.map(Number).filter(Number.isFinite) : past.value
    const n = Array.isArray(v) ? d.length : history, off = n - d.length
    let lo = min ?? Math.min(...d), hi = max ?? Math.max(...d)
    if (!(hi > lo)) lo -= 1, hi += 1   // a flat line runs across the middle
    return d.map((y, i) => `${+((off + i) / (n - 1 || 1)).toFixed(4)},${+(1 - (y - lo) / (hi - lo)).toFixed(4)}`).join(' ')
  })
  const display = computed(() => (typeof readout === 'function' ? readout : format)(sig.value))

  return control(sig, {
    ...rest, type: 'graph', points, display,
    template: template + (readout ? `<span class="s-pad-val" :text="display"></span>` : ''),
    dispose: () => { clearInterval(clock); dispose?.() }
  })
}
