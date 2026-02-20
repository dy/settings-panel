/**
 * Default theme — browser baseline
 *
 * default(axes?) → CSS string
 * Also exports shared utilities for other themes.
 */

const { round, min, max } = Math
export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, lo, hi) => min(hi, max(lo, v))

// Resolve accent: number 0..1 → oklch derived from shade hue, string → passthrough
export const resolveAccent = (accent, shade) => {
  if (typeof accent !== 'number') return accent
  const { C, H } = parseColor(shade)
  const L = clamp(accent, 0, 1)
  return `oklch(${+L.toFixed(3)} ${+max(C, 0.15).toFixed(4)} ${+H.toFixed(1)})`
}

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
  ...rest
} = {}) {
  accent = resolveAccent(accent, shade)

  const u = Number.isFinite(rest.unit) ? rest.unit : lerp(3, 5, clamp((size) / 2, 0, 1))
  const fontSize = u * 3.5
  const r = round(lerp(0, 3, roundness) * u)
  const { L } = parseColor(shade)
  const dark = L < .6
  const fg = dark ? 'white' : 'black'
  const border = dark ? 'white' : 'black'
  const stroke = max(1, weight / 400)
  const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='${stroke}' stroke-linejoin='round'/%3E%3C/svg%3E")`

  return `.s-panel {
  --bg: ${shade};
  --accent: ${accent};
  --u: ${u}px;
  --spacing: ${spacing};
  --r: ${r}px;
  --lh: calc(var(--u) * 4);
  --padding: calc(var(--u) * (0.5 + 1 * var(--spacing)));

  display: flex; flex-direction: column;
  background-color: var(--bg);
  color-scheme: ${dark ? 'dark' : 'light'};
  color: color-mix(in oklch, var(--bg), ${fg} 85%);
  accent-color: var(--accent);
  padding: calc(var(--u) * (1 + 2 * var(--spacing)));
  border-radius: var(--r);
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: ${weight};
  font-size: ${fontSize}px;
  line-height: var(--lh);
  min-width: 28ch;
  max-width: calc(var(--u) * 100);
  -webkit-text-size-adjust: none;${dark ? `
  -webkit-font-smoothing: antialiased;` : ''}

  &, *, *::before, *::after { box-sizing: border-box; }

  *[hidden] { display: none!important; }

  > summary, > .s-panel-title {
    list-style: none; display: flex; align-items: center;
    font-weight: ${min(round(weight) + 300, 900)}; font-size: larger;
    &::-webkit-details-marker { display: none; }
  }
  > summary {
    cursor: pointer;
    &::after {
      content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; flex-shrink: 0;
      background: currentColor;
      -webkit-mask: ${chevron} center / contain no-repeat;
      mask: ${chevron} center / contain no-repeat;
      transition: transform 140ms;
    }
  }
  &[open] > summary::after { transform: rotate(-180deg); }
  &:is(details) {
    display: block;
    interpolate-size: allow-keywords;
    &::details-content {
      content-visibility: visible;
      height: 0; overflow: clip; overflow-clip-margin: 1.5rem; opacity: 0;
      transition: height 200ms 80ms, opacity 80ms;
    }
    &[open]::details-content {
      height: auto; opacity: 1;
      transition: height 200ms, opacity 150ms 150ms;
    }
  }
  .s-panel-content {
    display: flex; flex-direction: column;
    gap: var(--padding);
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: calc(var(--u) * (1 + 2 * var(--spacing)));
  }

  /* ── Control row ── */
  .s-control {
    display: flex; align-items: baseline; gap: calc(var(--u) * 4);
    margin: 0; padding: 0; border: 0;
  }
  .s-label-group { flex: 0 0 auto;
    min-width: 8ch; width: 25%; max-width: 20ch; display: flex; flex-direction: column; gap: var(--u); line-height: ${fontSize + 1}px;
  }
  .s-hint { font-size: smaller; opacity: .6; }
  .s-input {
    flex: 1; min-width: 0;
    display: flex; gap: calc(var(--u) * (2));
    margin: 0; padding: 0; border: 0; min-inline-size: 0;
  }

  .s-control:has(.s-input:disabled) {
    opacity: .5;
    .s-input { pointer-events: none; }
  }

  /* ── Input base ── */
  input[type="text"], input[type="number"], textarea, select {
    width: 0; min-width: 0;
    padding: var(--padding);
    font: inherit;
    color: inherit;
  }
  select {
    padding-right: calc(var(--u) * 6 * min(var(--spacing), 1));
    cursor: pointer;
    option { font-family: system-ui, -apple-system, sans-serif; }
  }
  button { font: inherit; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    label { display: flex; cursor: pointer; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-track {
      width: calc(var(--u) * 10); height: calc(var(--u) * 5);
      margin: calc(var(--u) * var(--spacing)) 0;
      background: color-mix(in oklch, var(--bg), ${fg} 20%);
      border: 1px solid color-mix(in oklch, var(--bg), ${border} 15%);
      border-radius: 999px;
      position: relative; cursor: pointer;
      transition: background-color 200ms;
      &::after {
        content: ''; position: absolute;
        width: calc(var(--u) * 4); height: calc(var(--u) * 4);
        background: ${dark ? '#fff' : '#fff'};
        border-radius: 50%;
        top: calc(var(--u) * .5); left: calc(var(--u) * .5);
        transition: transform 200ms;
        box-shadow: 0 1px 2px color-mix(in oklch, ${fg}, transparent 75%);
      }
    }
    &:has(input:checked) .s-track {
      background: var(--accent); border-color: var(--accent);
      &::after { transform: translateX(calc(var(--u) * 5)); }
    }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; }
  }

  /* ── Number ── */
  .s-number input[type="number"] { width: calc(var(--u) * 20); text-align: right; }

  /* ── Secondary button base ── */
  .s-step, .s-select.buttons button, .s-button.secondary button, .s-button button.secondary {
    background-color: color-mix(in oklch, var(--bg), ${fg} 5%);
    border: 1px solid color-mix(in oklch, var(--bg), ${border} 20%); border-radius: var(--r);
    transition: background-color 140ms, color 140ms, box-shadow 140ms, filter 140ms, border-color 140ms;
    &:hover { filter: brightness(1.2); }
    &:active { filter: brightness(.95); }
  }

  /* ── Step buttons ── */
  .s-step {
    width: calc(var(--u) * 8); height: calc(var(--u) * 8);
    display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track {
      flex: 1; position: relative; display: flex; align-items: center;
      height: calc(var(--u) * 4);
      margin:  calc(var(--u) * (0.5 + 1 * var(--spacing))) 0;
    }
    input[type="range"] {
      width: 100%;
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
    .s-readout {
      align-self: center;
      min-width: calc(4ch + var(--padding));
      font-size: smaller;
      padding-left: var(--padding);
      padding-right: 0;
    }
    .s-tooltip {
      position: absolute; top: 0;
      transform: translate(-50%, calc(-100% - var(--u)));
      font-size: smaller; white-space: nowrap;
      pointer-events: none;
    }
  }

  /* ── Select ── */
  .s-select select { flex: 1; cursor: pointer; }
  .s-select.buttons {
    align-items: center;
    padding: calc(var(--u) * (-0.5 + var(--spacing))) 0;
    .s-input { gap: 0; }
    button {
      padding: var(--u) calc(var(--u) * 2.5);
      border-radius: 0;
      margin-left: -1px;
      &:first-child {
        margin-left: 0;
        border-top-left-radius: var(--r);
        border-bottom-left-radius: var(--r);
      }
      &:last-child {
        border-top-right-radius: var(--r);
        border-bottom-right-radius: var(--r);
      }
    }
  }
  .s-select.radio {
    .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * .5 * var(--spacing)); }
    label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; opacity: .6; &.selected { opacity: 1; } }
  }

  /* ── Color ── */
  .s-color-input {
    flex: 1; position: relative; display: flex; align-items: center;
    input[type="color"] {
      position: absolute;
      left: calc(var(--u) * (0.5 + 1 * var(--spacing)) - var(--u) * .5);
      width: calc(var(--u) * 5); height: calc(var(--u) * 5);
      padding: 0; border: none;
      cursor: pointer;
    }
    input[type="text"] {
      flex: 1; padding-left: calc(var(--u) * 6 + var(--u) * 2 * min(var(--spacing), 1));
    }
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
    textarea {
      flex: 1; resize: none; overflow: auto; field-sizing: content; min-height: calc(var(--lh) * 4);
      resize: both;
    }
    &.code textarea { font-family: ui-monospace, monospace; font-size: smaller; }
  }

  /* ── Button (action) ── */
  .s-button button {
    padding: calc(var(--u) * 2) calc(var(--u) * 4);
    background: var(--accent); color: white; border: none;
    border-radius: var(--r);
    transition: background-color 140ms, filter 140ms;
    &:hover { filter: brightness(1.2); }
    &:active { filter: brightness(.95); }
    &:disabled { opacity: .35; cursor: not-allowed; }
  }
  .s-select.buttons button.selected,
  .s-button.secondary button.selected, .s-button button.secondary.selected {
    background: var(--accent); color: white; border-color: transparent;
  }

  /* ── Folder ── */
  .s-folder {
    display: block; border: 0; padding: 0;
    > summary {
      cursor: pointer; padding: calc(var(--u) * 2) 0;
      list-style: none; display: flex; align-items: center;
      border-bottom: 1px solid; opacity: .8;
      &::-webkit-details-marker { display: none; }
      &::after {
        content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; flex-shrink: 0;
        background: currentColor;
        -webkit-mask: ${chevron} center / contain no-repeat;
        mask: ${chevron} center / contain no-repeat;
        transition: transform 140ms;
      }
    }
    &[open] > summary { border-bottom: none; }
    &[open] > summary::after { transform: rotate(-180deg); }
  }
  .s-content {
    padding: calc(var(--u) * 2 * var(--spacing)) 0;
    display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--spacing));
  }

  /*
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition-duration: 0ms !important; }
  }
  */
}`
}
