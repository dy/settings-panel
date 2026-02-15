/**
 * Default theme — browser baseline
 *
 * default(axes?) → CSS string
 * Also exports shared utilities for other themes.
 */

const { round, min, max } = Math
export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, lo, hi) => min(hi, max(lo, v))

export function parseColor(color) {
  if (!color) return { L: 0.97, C: 0.01, H: 60 }
  const oklch = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (oklch) return { L: +oklch[1], C: +oklch[2], H: +oklch[3] }
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    const rl = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4
    const gl = g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4
    const bl = b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4
    const l_ = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl)
    const m_ = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl)
    const s_ = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl)
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    const ob = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    const C = Math.sqrt(a * a + ob * ob)
    let H = Math.atan2(ob, a) * 180 / Math.PI
    if (H < 0) H += 360
    return { L, C, H }
  }
  return { L: 0.97, C: 0.01, H: 60 }
}

export default function base({
  shade = '#f5f4f2',
  spacing = 1,
  size = 1,
  weight = 400,
  accent = '#2563eb',
  roundness = 0.5,
  unit = 4,
  ...rest
} = {}) {
  const u = unit
  const fontSize = lerp(11, 15, size)
  const lh = 4 * u
  const r = round(lerp(0, 3, roundness) * u)
  const { L } = parseColor(shade)
  const dark = L < .6
  const fg = dark ? 'white' : 'black'
  const border = dark ? 'white' : 'black'
  const inputH = lh + 2 * round(u * 1.5) + 2 // line-height + 2*padding + 2*border

  return `.s-panel {
  --bg: ${shade};
  --accent: ${accent};
  --u: ${u}px;
  --sp: ${spacing};
  --r: ${r}px;

  display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--sp));
  background-color: var(--bg);
  color-scheme: ${dark ? 'dark' : 'light'};
  color: color-mix(in oklch, var(--bg), ${fg} 85%);
  accent-color: var(--accent);
  padding: calc(var(--u) * 3 * var(--sp));
  border-radius: var(--r);
  font: ${round(weight)} ${fontSize}px system-ui, -apple-system, sans-serif;
  line-height: ${lh}px;
  min-width: calc(var(--u) * 60);
  -webkit-text-size-adjust: none;${dark ? `
  -webkit-font-smoothing: antialiased;` : ''}

  &, *, *::before, *::after { box-sizing: border-box; }

  /* ── Control row ── */
  .s-control {
    display: flex; align-items: baseline;
    gap: calc(var(--u) * 2 * var(--sp));
    margin: 0; padding: 0; border: 0;
    &[hidden] { display: none; }
  }
  .s-label-group { flex: 0 0 auto; width: calc(var(--u) * 20); display: flex; flex-direction: column; gap: 2px; }
  .s-hint { font-size: smaller; opacity: .6; line-height: ${lh}px; }
  .s-input { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: calc(var(--u) * var(--sp)); }

  /* ── Input base ── */
  input[type="text"], input[type="number"], textarea, select {
    width: 0; min-width: 0;
    height: ${inputH}px;
    padding: calc(var(--u) * 1.5) calc(var(--u) * 2);
    font: inherit;
    color: inherit;
  }
  select {
    padding-right: calc(var(--u) * 6);
    cursor: pointer;
    option { font-family: system-ui, -apple-system, sans-serif; }
  }
  button { font: inherit; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { width: ${lh}px; height: ${lh}px; margin: 0; cursor: pointer; }
  }

  /* ── Number ── */
  .s-number input[type="number"] { width: calc(var(--u) * 20); text-align: right; }

  /* ── Step buttons ── */
  .s-step {
    width: calc(var(--u) * 7); height: calc(var(--u) * 7);
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
    border: 1px solid color-mix(in oklch, var(--bg), ${border} 20%); border-radius: var(--r);
    background: color-mix(in oklch, var(--bg), ${fg} 5%);
    &:active { background: color-mix(in oklch, var(--bg), ${fg} 10%); }
  }

  /* ── Slider ── */
  .s-slider {
    padding: calc(1.25*var(--u)) 0;
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: ${lh}px; }
    .s-track { flex: 1; position: relative; display: flex; align-items: center; }
    input[type="range"] {
      width: 100%; margin: 0;
      cursor: pointer;
    }
    .s-marks, .s-mark-labels {
      position: absolute;
      left: 0; right: 0; top: 0; bottom: 0;
      pointer-events: none;
    }
    .s-marks { display: none; }
    .s-mark-label {
      position: absolute; top: 100%;
      transform: translate(-50%, 4px);
      font-size: smaller; text-align: center; white-space: nowrap;
      opacity: .5;
      &.active { opacity: 1; color: var(--accent); }
    }
    .s-value {
      min-width: calc(var(--u) * 10);
      font-size: smaller; text-align: right;
      opacity: .6;
    }
  }

  /* ── Select ── */
  .s-select select { flex: 1; cursor: pointer; }
  .s-buttons {
    flex-wrap: wrap;
    .s-input { gap: calc(var(--u) * .5 * var(--sp)); }
    button {
      padding: var(--u) calc(var(--u) * 2.5);
      border: 1px solid color-mix(in oklch, var(--bg), ${border} 20%); border-radius: var(--r);
      background: color-mix(in oklch, var(--bg), ${fg} 5%);
      &.selected { background: var(--accent); color: white; border-color: transparent; }
    }
  }
  .s-radio {
    .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * .5 * var(--sp)); }
    label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; opacity: .6; &.selected { opacity: 1; } }
  }

  /* ── Color ── */
  .s-color-input {
    flex: 1; position: relative; display: flex; align-items: center;
    input[type="color"] { position: absolute; left: var(--u); width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0; border: none; border-radius: var(--r); cursor: pointer; }
    input[type="text"] { flex: 1; padding-left: calc(var(--u) * 7); }
  }
  .s-swatches {
    .s-input { flex-wrap: wrap; gap: var(--u); }
    button {
      width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0;
      border: 1px solid color-mix(in oklch, var(--bg), ${border} 15%); border-radius: var(--r);
      &.selected { outline: 2px solid var(--accent); outline-offset: 1px; }
    }
  }

  /* ── Text ── */
  .s-text input[type="text"] { flex: 1; }

  /* ── Textarea ── */
  .s-textarea {
    align-items: flex-start;
    textarea { flex: 1; resize: none; overflow: hidden; }
  }

  /* ── Button (action) ── */
  .s-button button {
    padding: calc(var(--u) * 2.5) calc(var(--u) * 4);
    background: var(--accent); color: white; border: none; font-weight: bolder;
    border-radius: var(--r);
    &:hover { filter: brightness(1.1); }
    &:active { filter: brightness(.9); }
    &:disabled { opacity: .35; cursor: not-allowed; }
  }
  .s-button.secondary button {
    background: transparent; border: 1px solid color-mix(in oklch, var(--bg), ${border} 20%); color: inherit;
    border-radius: var(--r);
    &:hover { color: var(--accent); border-color: var(--accent); filter: none; }
  }

  /* ── Folder ── */
  .s-folder {
    display: block; border: 0; padding: 0;
    > summary {
      cursor: pointer; padding: calc(var(--u) * 1.5) 0;
      list-style: none; display: flex; align-items: center;
      border-bottom: 1px solid; opacity: .8;
      &::-webkit-details-marker { display: none; }
      &::after {
        content: ''; width: 7px; height: 7px; margin-left: auto; flex-shrink: 0;
        border-right: 1px solid; border-bottom: 1px solid;
        transform: rotate(45deg); transition: transform 140ms;
      }
    }
    &[open] > summary { border-bottom: none; }
    &[open] > summary::after { transform: rotate(-135deg); }
  }
  .s-content {
    padding: calc(var(--u) * 2 * var(--sp)) 0;
    display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--sp));
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0ms !important; }
  }
}`
}
