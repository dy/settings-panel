/**
 * Default theme — browser baseline
 * FEATURE: theme — base layer for all themes
 *
 * Static CSS string with design tokens.
 * Override themes concatenate + set CSS variables.
 * Utilities (parseColor, resolveAccent, lerp, clamp) stay for override themes.
 */

const { min, max } = Math
export const lerp = (a, b, t) => a + (b - a) * t
export const clamp = (v, lo, hi) => min(hi, max(lo, v))

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

const chevron = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E")`

export default `@layer s-base {\n.s-panel {

  /* ── Variables ── */
  --bg: #f5f4f2;
  --accent: #2563eb;
  --u: 4px;
  --lh: calc(var(--u) * 4);
  --spacing: 1;
  --roundness: 1;
  --weight: 400;
  --r: calc(var(--u) * var(--roundness));
  --padding: calc(var(--u) * (0.5 + var(--spacing)));

  /* ── Panel ── */
  display: flex; flex-direction: column;
  background-color: var(--bg);
  color-scheme: light;
  color: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
  accent-color: var(--accent);
  padding: calc(var(--u) * (2 + 3 * var(--spacing)));
  border-radius: var(--r);
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: var(--weight);
  font-size: inherit;
  line-height: var(--lh);
  min-width: 27ch;
  max-width: calc(var(--u) * 108);
  -webkit-text-size-adjust: none;
  -webkit-font-smoothing: antialiased;

  &, *, *::before, *::after { box-sizing: border-box; margin: 0; }
  *[hidden] { display: none!important; }

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    list-style: none; display: flex; align-items: center;
    font-weight: calc(var(--weight) + 300); font-size: larger;
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
      height: 0; opacity: 0;
      transition: height 200ms 80ms, opacity 80ms;
    }
    &[open]::details-content {
      height: auto; opacity: 1;
      transition: height 200ms, opacity 150ms 150ms;
    }
  }

  /* ── Panel content ── */
  .s-panel-content {
    display: flex; flex-direction: column;
    gap: var(--padding);
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: calc(var(--u) * (1 + 2 * var(--spacing)));
  }

  /* ═══ Control row ═══ */
  .s-control {
    display: flex; align-items: baseline; gap: calc(var(--u) * (1 + var(--spacing)));
    margin: 0; padding: 0; border: 0;
  }
  .s-label-group {
    flex: 0 0 auto;
    min-width: 8ch; width: var(--label-w, 25%); max-width: 20ch;
    display: flex; flex-direction: column; gap: var(--u);
    line-height: calc(var(--u) * 4);
  }
  .s-label { }
  .s-label-row { display: flex; align-items: center; gap: calc(var(--u) * 1.5); position: relative; }
  .s-title {
    display: inline-flex; align-items: center; justify-content: center;
    width: calc(var(--u) * 3.5); height: calc(var(--u) * 3.5);
    font-size: 10px; font-weight: 600; line-height: 1;
    border-radius: 50%;
    border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 30%);
    color: color-mix(in oklab, var(--bg), light-dark(black, white) 50%);
    cursor: help; flex-shrink: 0;
    &:hover + .s-title-text { opacity: 1; visibility: visible; transform: translateY(0); }
  }
  .s-title-text {
    position: absolute; left: 0; top: 100%;
    margin-top: var(--u);
    padding: calc(var(--u) * 1.5);
    font-size: smaller; line-height: 1.3;
    background: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
    color: light-dark(white, black);
    border-radius: var(--r);
    white-space: normal; width: max-content; max-width: 30ch;
    pointer-events: none; z-index: 10;
    opacity: 0; visibility: hidden;
    transform: translateY(-2px);
    transition: opacity 100ms, visibility 100ms, transform 100ms;
  }
  .s-hint { font-size: smaller; opacity: .6; }
  .s-input {
    flex: 1; min-width: 0;
    display: flex; gap: var(--padding);
    margin: 0; padding: 0; border: 0; min-inline-size: 0;
    &[inert] { opacity: .5; }
  }

  /* ═══ Input base ═══ */
  input[type="text"], input[type="number"], textarea, select {
    width: 0; min-width: 0;
    padding: var(--padding);
    font: inherit; color: inherit;
  }
  input[type="text"], input[type="number"], select {
    height: calc(1lh + var(--padding) * 2);
  }
  select {
    padding-top: 0; padding-bottom: 0; cursor: pointer;
    option { font-family: system-ui, -apple-system, sans-serif; }
  }
  button {
    font: inherit; cursor: pointer;
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: -1px; }
  }

  /* ═══ Boolean ═══ */
  .s-boolean {
    align-items: center;
    .s-input { cursor: pointer; }

    /* ── shared: hide native checkbox ── */
    &.toggle, &.switch {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      &:has(input:focus-visible) .s-track {
        outline: 2px solid var(--accent); outline-offset: 2px;
      }
    }

    /* ── switch — pill style ── */
    &.switch {
      .s-track {
        width: calc(var(--u) * (8 + var(--spacing) * 2));
        height: calc(var(--u) * 4 + var(--padding));
        background: color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 15%);
        border-radius: 999px;
        position: relative; cursor: pointer;
        transition: background-color 200ms;
        margin: calc(var(--padding) / 2) 0;
        &::after {
          content: '';
          display: block; position: absolute;
          width: calc(var(--u) * 4); height: calc(var(--u) * 4);
          margin: auto calc(var(--padding) / 2);
          inset: 0;
          background: #fff;
          border-radius: 50%;
          transition: transform 200ms;
          box-shadow: 0 1px 2px color-mix(in oklab, light-dark(black, white), transparent 75%);
        }
      }
      &:has(input:checked) .s-track {
        background: var(--accent); border-color: var(--accent);
        &::after { right: 0; left: auto; }
      }
    }

    /* ── toggle — button style ── */
    &.toggle {
      .s-track {
        padding: var(--padding) calc(var(--padding) * 2);
        background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border-radius: var(--r);
        cursor: pointer;
        transition: background-color 140ms, color 140ms, border-color 140ms;
        height: calc(1lh + var(--padding) * 2);
        display: flex; align-items: center; justify-content: center;
        font-size: smaller;
        &::after { content: 'Off'; }
        &:hover { filter: brightness(1.2); }
        &:active { filter: brightness(.95); }
      }
      &:has(input:checked) .s-track {
        background: var(--accent); color: white; border-color: transparent;
        &::after { content: 'On'; }
      }
    }

    /* ── checkbox ── */
    &.checkbox {
      input[type="checkbox"] {
        width: calc(var(--u) * 4); height: calc(var(--u) * 4);
        cursor: pointer;
      }
      .s-track { display: none; }
    }
  }

  /* ═══ Number ═══ */
  .s-number {
    input[type="number"] {
      flex: 1; text-align: right;
      -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    }
    .s-step {
      display: flex; flex-direction: column; gap: 1px;
      button {
        display: flex; align-items: center; justify-content: center;
        background: none; border: none; padding: 0 calc(var(--u) * 1);
        color: inherit; opacity: .5; cursor: pointer; font-size: .625em; line-height: 1;
        &:hover { opacity: 1; }
      }
    }
  }

  /* ═══ Slider ═══ */
  .s-slider {
    align-items: center;
    .s-input { flex-direction: row; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }

    .s-track {
      flex: 1; position: relative; display: flex; align-items: center;
      height: calc(var(--u) * 4);
      margin: calc(var(--u) * (0.5 + 1 * var(--spacing))) 0;
    }
    input[type="range"] { width: 100%; cursor: pointer; }

    .s-marks, .s-mark-labels {
      position: absolute; left: 0; right: 0; top: 0; bottom: 0;
      pointer-events: none;
    }
    .s-marks { display: none; }
    .s-mark { }
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
      position: absolute; bottom: 100%;
      transform: translateX(-50%);
      font-size: smaller; white-space: nowrap;
      pointer-events: none;
      background: color-mix(in oklab, var(--bg), light-dark(black, white) 85%);
      color: light-dark(white, black);
      padding: 2px 6px;
      border-radius: var(--r);
      margin-bottom: var(--u);
    }

    /* ── multiple (interval) ── */
    &.multiple {
      .s-interval-track {
        flex: 1; position: relative; display: flex; align-items: center;
        height: calc(var(--u) * 4);
        margin: calc(var(--u) * (0.5 + 1 * var(--spacing))) 0;
        background: linear-gradient(to right,
          transparent var(--low, 0%), color-mix(in oklab, var(--accent), transparent 75%) var(--low, 0%),
          color-mix(in oklab, var(--accent), transparent 75%) var(--high, 100%), transparent var(--high, 100%));
        border-radius: 2px;
        input[type="range"] {
          position: absolute; width: 100%; height: 100%; top: 0; left: 0; bottom: 0; margin: auto 0;
          -webkit-appearance: none; appearance: none;
          background: transparent; pointer-events: none; cursor: ew-resize;
          &::-webkit-slider-thumb { pointer-events: all; cursor: ew-resize; }
          &::-moz-range-thumb { pointer-events: all; cursor: ew-resize; }
        }
      }
      .s-readout {
        align-self: center;
        min-width: calc(4ch + var(--padding));
        font-size: smaller;
        padding-left: var(--padding);
      }
    }
  }

  /* ═══ Select ═══ */
  .s-select {

    /* ── dropdown ── */
    &.dropdown {
      select { flex: 1; cursor: pointer; }
    }

    /* ── radio ── */
    &.radio {
      .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * var(--spacing)); }
      label { display: flex; center; gap: calc(var(--u) * 1.5); cursor: pointer; }
    }

    /* ── segmented ── */
    &.segmented {
      align-items: center;
      .s-input { gap: 0; }
      button {
        flex: 1;
        padding: var(--padding);
        background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
        border-radius: 0; margin-left: -1px;
        color: inherit; font-size: smaller;
        transition: background-color 140ms, color 140ms, filter 140ms, border-color 140ms;
        &:first-child { margin-left: 0; border-top-left-radius: var(--r); border-bottom-left-radius: var(--r); }
        &:last-child { border-top-right-radius: var(--r); border-bottom-right-radius: var(--r); }
        &:hover { filter: brightness(1.2); }
        &:active { filter: brightness(.95); }
        &.selected { background: var(--accent); color: white; border-color: transparent; }
      }
    }

    /* ── checkboxes ── */
    &.checkboxes {
      .s-input { flex-direction: column; align-items: flex-start; gap: calc(var(--u) * var(--spacing)); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 1.5); cursor: pointer; }
      .s-track { display: none; }
    }
  }

  /* ═══ Color ═══ */
  .s-color {

    /* ── picker ── */
    &.picker .s-color-input {
      flex: 1; position: relative; display: flex; align-items: center;
      input[type="color"] {
        position: absolute;
        width: calc(var(--u) * 5); height: calc(var(--u) * 5);
        padding: 0; border: none; cursor: pointer;
        left: calc(var(--u) * (0.5 + 1 * var(--spacing)));
      }
      input[type="text"] {
        flex: 1;
        padding-left: calc(var(--u) * 6 + var(--u) * 2 * var(--spacing));
      }
    }

    /* ── swatches ── */
    &.swatches {
      .s-input { flex-wrap: wrap; gap: var(--u); }
      button {
        width: calc(var(--u) * 5); height: calc(var(--u) * 5); padding: 0;
        border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 15%); border-radius: var(--r);
        &.selected { outline: 2px solid var(--accent); outline-offset: 1px; }
      }
    }
  }

  /* ═══ Text ═══ */
  .s-text {
    input[type="text"] { flex: 1; }
  }

  /* ═══ Textarea ═══ */
  .s-textarea {
    align-items: flex-start;
    textarea {
      flex: 1; resize: both; field-sizing: content;
      white-space: nowrap; overflow: auto;
      min-height: calc(var(--lh) * 3); max-height: 50vh;
      scrollbar-width: thin; scrollbar-color: color-mix(in srgb, currentColor 40%, transparent) transparent;
      &::-webkit-scrollbar { width: 4px; height: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 40%, transparent); border-radius: 2px; }
    }

    /* ── code ── */
    &.code textarea { font-family: ui-monospace, monospace; font-size: smaller; }
  }

  /* ═══ Button ═══ */
  .s-button {
    button {
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--padding) * 2);
      background: var(--accent); color: white;
      border: none; border-radius: var(--r);
      transition: background-color 140ms, filter 140ms;
      &:hover { filter: brightness(1.2); }
      &:active { filter: brightness(.95); }
      &:disabled { opacity: .35; cursor: not-allowed; }
    }

    /* ── group ── */
    &.group { }

    /* ── secondary ── */
    &.secondary button, button.secondary {
      background-color: color-mix(in oklab, var(--bg), light-dark(black, white) 5%);
      border: 1px solid color-mix(in oklab, var(--bg), light-dark(black, white) 20%);
      color: inherit;
      &:hover { filter: brightness(1.2); }
      &:active { filter: brightness(.95); }
      &.selected { background: var(--accent); color: white; border-color: transparent; }
    }
  }

  /* ═══ Folder ═══ */
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

    /* ── section (no collapse, just labeled block) ── */
    &.section {
      > summary { pointer-events: none; &::after { display: none; } }
      &:not([open]) { > summary { border-bottom: none; } }
    }

    /* ── tab (placeholder) ── */
    &.tab { }
  }
  .s-content {
    padding: calc(var(--u) * 2 * var(--spacing)) 0;
    display: flex; flex-direction: column; gap: calc(var(--u) * 2 * var(--spacing));
  }

}\n}`
