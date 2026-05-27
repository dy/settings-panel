/**
 * Color control - picker, swatches
 */

import control from './control.js'
import { effect } from 'sprae'
import { normalizeHex } from '../theme/color.js'

const templates = {
  picker: `
    <span class="s-color-input">
      <input type="color" :id="label || null" :name="label || null" :value="value" :oninput="e => set(e.target.value)" />
      <input type="text" :value="value" :oninput="e => set(e.target.value)" spellcheck="false" />
    </span>
  `,
  swatches: `
    <button
      :each="c in colors"
      :class="{ 's-selected': c == value }"
      :style="'background:' + c"
      :onclick="() => set(c)"
      :title="c"
    ></button>
  `
}

const defaultColors = [
  '#ff0000', '#ff8000', '#ffff00', '#80ff00',
  '#00ff00', '#00ff80', '#00ffff', '#0080ff',
  '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
  '#ffffff', '#c0c0c0', '#808080', '#000000'
]

export default (sig, opts = {}) => {
  const { variant = 'picker', colors = defaultColors, dispose, ...rest } = opts
  const set = v => { sig.value = normalizeHex(v) }
  const stop = effect(() => {
    if (typeof sig.value !== 'string') return
    const normalized = normalizeHex(sig.value)
    if (normalized !== sig.value) sig.value = normalized
  })
  return control(sig, {
    ...rest,
    type: `color ${variant}`,
    template: templates[variant] || templates.picker,
    value: sig, set,
    colors,
    dispose: () => {
      stop()
      dispose?.()
    }
  })
}
