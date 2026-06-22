/**
 * Color control - picker, swatches
 */

import control from './control.js'
import { signal, effect, computed } from '../signals.js'
import { normalizeHex } from '../theme/color.js'

const templates = {
  picker: `
    <span class="s-color-input">
      <input type="color" :id="label || null" :name="label || null" :value="value" :oninput="e => commit(e.target.value)" />
      <input type="text" :value="text" :oninput="e => input(e.target.value)" :onchange="e => commit(e.target.value)" spellcheck="false" />
    </span>
  `,
  rgba: `
    <span class="s-color-input s-rgba">
      <input type="color" :id="label || null" :name="label || null" :value="hex6" :oninput="e => setRgb(e.target.value)" />
      <input type="range" class="s-alpha" min="0" max="1" step="0.01" :value="alpha" :oninput="e => setAlpha(+e.target.value)" :style="{'--c': hex6}" />
      <input type="text" :value="text" :oninput="e => input(e.target.value)" :onchange="e => commit(e.target.value)" spellcheck="false" />
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

// ── rgba parse/serialize (handles 'rgba(...)', '#rgb', '#rgba', '#rrggbb', '#rrggbbaa') ──
const hx = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
const toHex8 = ({ r, g, b, a }) => '#' + hx(r) + hx(g) + hx(b) + (a >= 1 ? '' : hx(a * 255))
const parseRGBA = v => {
  if (typeof v !== 'string') return { r: 0, g: 0, b: 0, a: 1 }
  const m = v.trim().match(/rgba?\(([^)]+)\)/i)
  if (m) { const p = m[1].split(',').map(x => parseFloat(x)); return { r: p[0] | 0, g: p[1] | 0, b: p[2] | 0, a: p[3] == null ? 1 : p[3] } }
  const h = normalizeHex(v).replace('#', '')
  if (/^[0-9a-f]{6,8}$/i.test(h)) return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }
  return { r: 0, g: 0, b: 0, a: 1 }
}
const isColorish = v => /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v.trim()) || /^rgba?\(/i.test(v.trim())

const defaultColors = [
  '#ff0000', '#ff8000', '#ffff00', '#80ff00',
  '#00ff00', '#00ff80', '#00ffff', '#0080ff',
  '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
  '#ffffff', '#c0c0c0', '#808080', '#000000'
]

const isFullHex = v => /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v)

export default (sig, opts = {}) => {
  const { variant = 'picker', colors = defaultColors, dispose, ...rest } = opts

  // ── rgba variant: rgb swatch + alpha slider + text, value stored as #rrggbb[aa] ──
  if (variant === 'rgba') {
    const hex6 = computed(() => { const { r, g, b } = parseRGBA(sig.value); return '#' + hx(r) + hx(g) + hx(b) })
    const alpha = computed(() => +parseRGBA(sig.value).a.toFixed(2))
    const text = signal(typeof sig.value === 'string' ? sig.value : toHex8(parseRGBA(sig.value)))
    let editing = false
    const stop = effect(() => {
      const v = sig.value
      if (editing || typeof v !== 'string') return
      const n = toHex8(parseRGBA(v))          // canonicalize initial/external value to compact #rrggbb[aa]
      if (n !== v && isColorish(v)) { sig.value = n; return }
      text.value = v
    })
    const setRgb = h => { const { a } = parseRGBA(sig.value); const { r, g, b } = parseRGBA(h); sig.value = toHex8({ r, g, b, a }) }
    const setAlpha = a => { const { r, g, b } = parseRGBA(sig.value); sig.value = toHex8({ r, g, b, a }) }
    const input = v => { editing = true; text.value = v; if (isColorish(v)) sig.value = toHex8(parseRGBA(v)); editing = false }
    const commit = v => { sig.value = toHex8(parseRGBA(v)) }
    return control(sig, {
      ...rest,
      type: 'color rgba',
      template: templates.rgba,
      value: sig, hex6, alpha, text, setRgb, setAlpha, input, commit, set: commit,
      dispose: () => { stop(); dispose?.() }
    })
  }

  // `text` mirrors the text field; `sig` holds the canonical color. Normalizing only on
  // commit (blur/change/pick/external) keeps typing '#fff' from being rewritten to
  // '#ffffff' mid-keystroke — which would jump the caret to the end.
  const text = signal(typeof sig.value === 'string' ? sig.value : '')
  let editing = false
  const stop = effect(() => {
    const v = sig.value
    if (editing || typeof v !== 'string') return
    const n = normalizeHex(v)
    if (n !== v) { sig.value = n; return }  // normalize initial/external value, then re-sync text
    text.value = v
  })

  const input = v => {                 // live typing — keep the field raw, push only full colors
    editing = true
    text.value = v
    const n = normalizeHex(v)
    if (isFullHex(n)) sig.value = n
    editing = false
  }
  const commit = v => { sig.value = normalizeHex(v) }   // blur / enter / swatch / picker pick

  return control(sig, {
    ...rest,
    type: `color ${variant}`,
    template: templates[variant] || templates.picker,
    value: sig, text, input, commit, set: commit,
    colors,
    dispose: () => {
      stop()
      dispose?.()
    }
  })
}
