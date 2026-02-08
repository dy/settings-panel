/**
 * Soft theme — monotone, diffuse, tactile
 *
 * soft(axes?) → CSS string
 */

const { min, max, round } = Math
const clamp = (v, lo, hi) => min(hi, max(lo, v))
const lerp = (a, b, t) => a + (b - a) * t
const px = v => v + 'px'

const TEX = {
  flat: 'none',
  dots: (c, a) => `url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='6' cy='6' r='.6' fill='rgba(${c},${a})'/%3E%3C/svg%3E")`,
  crosses: (c, a) => `url("data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 4v8M4 8h8' stroke='rgba(${c},${a})' stroke-width='.6'/%3E%3C/svg%3E")`,
}

// oklch shorthand — monotone: chroma always 0, lerp L to sRGB visible range
const L_MIN = 0.16, L_MAX = 0.99
const lch = (l, a) => {
  // l = lerp(L_MIN, L_MAX, l) // 0→0.16, 1→0.99
  return a != null ? `oklch(${l} 0 0 / ${a})` : `oklch(${l} 0 0)`
}

export default function soft({
  lightness = .97,
  contrast = .5,
  texture = 'flat',
  spacing = .5,
  size = .5,
  weight = .5,
  depth = .4,
  roundness = .5,
} = {}) {

  const L = lightness
  const dark = L < .5
  const hi = (d, l=L) => clamp(l + d, .27, 1)
  const lo = (d, l=L) => clamp(l - d, 0, 1)

  // ── Palette ──
  const surface = lch(L)
  const text    = lch(dark ? lerp(.78, .97, contrast) : lerp(.32, .12, contrast))
  const dim     = lch(dark ? max(L + .25, lerp(.48, .65, contrast)) : min(L - .25, lerp(.58, .42, contrast)))
  const input   = lch(lo(.1))
  const track   = lch(lo(dark ? .01 : .06))
  const accent  = lch(dark ? .72 : .58)
  const accentK = lch(dark ? .15 : .98)
  const focus   = lch(dark ? .72 : .58, .35)
  const edge    = 'color-mix(in oklch, currentColor 20%, transparent)'
  const divider = 'color-mix(in oklch, currentColor 10%, transparent)'
  const inlay   = lch(dark ? 1 : 0, .04)

  // ── Weight ──
  const bw  = lerp(1, 2.5, weight)
  const fw  = round(lerp(400, 600, weight))
  const fwB = round(lerp(500, 800, weight))

  // ── Size ──
  const fs      = px(lerp(11, 15, size))
  const ctrlH   = px(lerp(20, 42, size))
  const thumbSz = px(lerp(12, 18, size))

  // ── Spacing ──
  const u    = lerp(3, 10, spacing)
  const sp1  = px(u)
  const sp2  = px(u * 1.5)
  const sp3  = px(u * 2.5)
  const minW = px(lerp(240, 380, spacing))

  // ── Depth — diffuse shadows ──
  const sh = (y, bl, a) => `0 ${px(y)} ${px(bl)} ${lch(0, a)}`
  const panelSh = sh(lerp(0, 10, depth), lerp(0, 24, depth), lerp(0, dark ? .35 : .15, depth))
  const thumbSh = sh(lerp(0, 2, depth), lerp(2, 8, depth), lerp(.1, .35, depth))
  const knobSh  = sh(lerp(0, 1, depth), lerp(1, 5, depth), lerp(.05, .25, depth))
  const btnSh   = sh(lerp(0, 2, depth), lerp(0, 8, depth), lerp(0, .15, depth))

  // ── Roundness ──
  const rad   = px(roundness * 24)
  const radSm = roundness > .6 ? '999px' : px(roundness * 12)

  // ── Texture ──
  const texFn = TEX[texture]
  const tex = !texFn || texFn === 'none' ? 'none'
    : texFn(dark ? '255,255,255' : '0,0,0', dark ? '.04' : '.05')

  const mono = "ui-monospace, 'SF Mono', monospace"

  // ── Shared fragments ──
  const inputBase = `
    background: ${input};
    border: ${bw}px solid ${lch(hi(.03))};
    border-bottom-color: ${lch(hi(.05))};
    border-radius: ${radSm};
    box-shadow: inset 0 ${bw}px 0 ${lch(lo(.14))};
    color: ${text};
    padding: 6px 8px;
    font: inherit;
    font-size: .95em;
    transition: border-color 140ms, box-shadow 140ms;
    &::placeholder { color: ${dim}; opacity: .6; }
    &:focus-visible {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--focus);
    }`

  const thumb = `
      width: ${thumbSz}; height: ${thumbSz};
      background: ${lch(.99)};
      border: none;
      border-radius: 50%;
      box-shadow: inset 0 0 0 2px var(--accent), ${thumbSh};
      cursor: grab;
      z-index: 1;
      position: relative;
      `

  return `.s-panel {
  --accent: ${accent};
  --accent-c: ${accentK};
  --focus: ${focus};
  --thumb: ${thumbSz};

  color: ${text};
  background: ${surface};
  background-image: ${tex};
  border: ${bw}px solid ${lch(lo(.1))};
  border-radius: ${rad};
  box-shadow: inset 0 0 0 ${bw}px ${lch(hi(.05))}, ${panelSh};
  padding: ${sp3};
  font: ${fw} ${fs}/1.35 system-ui, -apple-system, sans-serif;
  min-width: ${minW};
  position: relative;
  isolation: isolate;
  -webkit-font-smoothing: antialiased;

  *, *::before, *::after { box-sizing: border-box; }

  /* ── Control row ── */
  .s-control {
    display: flex;
    align-items: baseline;
    gap: ${sp2};
    padding: calc(${sp1} * .75) 0;
    min-height: ${ctrlH};
    margin: 0;
    border: 0;
    & + .s-control { border-top: 1px solid ${divider}; }
  }
  .s-label { flex: 0 0 auto; min-width: 80px; font-weight: ${fwB}; color: ${text}; }
  .s-hint { font-size: 11px; color: ${dim}; }
  .s-input { flex: 1; display: flex; align-items: baseline; gap: calc(${sp1} * .6); }

  /* ── Inputs ── */
  input[type="text"], input[type="number"], textarea, select { ${inputBase} }
  button:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--focus); }

  /* ── Boolean ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; pointer-events: none; }
    .s-track {
      width: 36px; height: 20px;
      background: ${track};
      border-radius: 999px;
      position: relative;
      cursor: pointer;
      transition: background 140ms;
      box-shadow: inset 0 0 0 ${bw}px ${lch(lo(.1))};
      &::after {
        content: '';
        position: absolute;
        width: 14px; height: 14px;
        background: ${lch(.99)};
        border-radius: 50%;
        top: 3px; left: 3px;
        transition: transform 140ms;
        box-shadow: ${knobSh};
      }
    }
    &:has(input:checked) .s-track {
      background: var(--accent);
      &::after { transform: translateX(16px); box-shadow: 0 0 0 2px ${lch(1, .15)}; }
    }
  }

  /* ── Number ── */
  .s-number input[type="number"] {
    width: 76px; font-family: ${mono}; text-align: right;
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
  }
  .s-step {
    width: 26px; height: 26px;
    background: ${input}; border: 1px solid ${edge}; border-radius: ${radSm};
    color: ${text}; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; line-height: 1;
    transition: background 140ms, color 140ms, border-color 140ms;
    &:hover:not(:disabled) { background: var(--accent); color: var(--accent-c); border-color: transparent; }
    &:disabled { opacity: .35; cursor: not-allowed; }
  }

  /* ── Slider ── */
  .s-slider {
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 16px; }
    .s-track {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    input[type="range"] {
      width: 100%; height: 0.6em;
      margin: 0;
      background: var(--track, linear-gradient(to right, var(--accent) var(--p, 0%), ${input} var(--p, 0%)));
      border-radius: 999px;
      -webkit-appearance: none;
      cursor: pointer;
      box-shadow: inset 0 ${bw}px ${bw}px 0 ${lch(0, .05)};
      &::-webkit-slider-thumb { -webkit-appearance: none; ${thumb}; }
      &::-moz-range-thumb { ${thumb} }
    }
    .s-marks, .s-mark-labels {
      position: absolute;
      left: calc(var(--thumb) / 2);
      right: calc(var(--thumb) / 2);
      top: 0; bottom: 0;
      pointer-events: none;
    }
    .s-mark {
      position: absolute;
      width: 1px; height: 10px;
      top: 50%;
      background: ${surface};
      transform: translate(-50%, -50%);
      &.active { background: ${surface}; }
    }
    .s-mark-label {
      position: absolute;
      top: 100%;
      transform: translate(-50%, 4px);
      font-size: 9px;
      text-align: center;
      white-space: nowrap;
      color: ${dim};
      &.active { color: var(--accent); }
    }
    .s-value {
      min-width: 48px; text-align: right; font-family: ${mono}; font-size: 11px;
      color: ${dim};
    }
  }

  /* ── Select ── */
  .s-select select {
    flex: 1; cursor: pointer; appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, ${dim} 50%), linear-gradient(135deg, ${dim} 50%, transparent 50%);
    background-position: calc(100% - 14px) 50%, calc(100% - 10px) 50%;
    background-size: 4px 4px, 4px 4px;
    background-repeat: no-repeat;
    padding-right: 26px;
  }
  .s-buttons {
    flex-wrap: wrap;
    .s-input { gap: calc(${sp1} * .4); }
    button {
      background: ${input}; border: 1px solid ${edge}; border-radius: 999px;
      color: ${dim}; padding: 4px 10px; cursor: pointer;
      font-size: 11px; font-weight: ${fw};
      transition: background 140ms, color 140ms, border-color 140ms;
      &:hover { border-color: var(--accent); color: ${text}; }
      &.selected { background: var(--accent); color: var(--accent-c); border-color: transparent; }
    }
  }
  .s-radio {
    .s-input { flex-direction: column; align-items: flex-start; gap: calc(${sp1} * .4); }
    label { display: flex; align-items: center; gap: 6px; cursor: pointer; color: ${dim}; &.selected { color: ${text}; } }
  }

  /* ── Color ── */
  .s-color input[type="color"] { width: 0; height: 0; opacity: 0; position: absolute; }
  .s-preview { width: 26px; height: 26px; border-radius: ${radSm}; cursor: pointer; border: 1px solid ${edge}; box-shadow: inset 0 0 0 1px ${inlay}; }
  .s-hex { font-family: ${mono}; font-size: 11px; color: ${dim}; }
  .s-swatches {
    .s-input { flex-wrap: wrap; gap: 4px; }
    button {
      width: 22px; height: 22px; border: 1px solid transparent; border-radius: ${radSm};
      cursor: pointer; padding: 0; box-shadow: inset 0 0 0 1px ${inlay};
      &.selected { border-color: ${text}; box-shadow: 0 0 0 2px ${surface}; }
    }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Textarea ── */
  .s-textarea {
    align-items: flex-start;
    textarea { flex: 1; font-family: ${mono}; font-size: 11px; resize: vertical; min-height: 64px; }
  }

  /* ── Button ── */
  .s-button button {
    background: var(--accent); border: 1px solid transparent; border-radius: ${radSm};
    color: var(--accent-c); padding: 7px 14px; cursor: pointer;
    font-weight: ${fwB}; font-size: 11px; box-shadow: ${btnSh};
    transition: filter 140ms, transform 100ms, box-shadow 140ms;
    &:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: ${sh(lerp(1, 4, depth), lerp(2, 12, depth), lerp(.05, .2, depth))}; }
    &:active { transform: translateY(0); filter: brightness(.95); box-shadow: none; }
  }

  /* ── Folder ── */
  .s-folder {
    display: block; border: 0; padding: 0; margin: 4px 0;
    > summary {
      cursor: pointer; padding: 6px 0; font-weight: ${fwB};
      list-style: none; display: flex; align-items: center; gap: 8px; color: ${text};
      &::-webkit-details-marker { display: none; }
      &::before {
        content: ''; width: 7px; height: 7px;
        border-right: ${bw}px solid ${dim}; border-bottom: ${bw}px solid ${dim};
        transform: rotate(-45deg); transition: transform 140ms;
      }
    }
    &[open] > summary::before { transform: rotate(45deg); }
  }
  .s-content { padding: 4px 0 4px 14px; border-left: 1px solid ${divider}; margin: 2px 0 2px 5px; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0ms !important; }
  }
}`
}
