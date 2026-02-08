/**
 * Color control - picker, swatches
 */

import control from './control.js'

const templates = {
  picker: `
    <input type="color" :value="value" />
    <span class="s-preview" :style="'background:' + value"></span>
    <span class="s-hex" :text="value"></span>
  `,
  swatches: `
    <button
      :each="c in colors"
      :class="{ selected: c == value }"
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
  const { variant = 'picker', colors = defaultColors, ...rest } = opts
  return control(sig, {
    ...rest,
    type: `color ${variant}`,
    template: templates[variant] || templates.picker,
    value: sig, set: v => { sig.value = v },
    colors
  })
}
