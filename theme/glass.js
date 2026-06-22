/**
 * Glass theme — glassmorphism
 *
 * A frosted, translucent panel floating over a background: backdrop-filter blur,
 * thin light gradient borders (the bevel mixin), generous radius, layered
 * translucent surfaces. Needs something interesting behind it. Airy and premium.
 *
 * glass(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveRoles } from './color.js'
import { bevel, bevelRing } from './mixins.js'

export default function glass({
  shade = '#1c2030',
  accent = '#6ea8ff',
  spacing = 1,
  weight = 400,
  roundness = 1.4,
  blur = 18,
  size = 1,
} = {}) {
  const { dark, fg, fgMuted, accent: acc } = resolveRoles(shade, accent)

  // Translucent surface + light-stroke helpers, all derived from the shade.
  const sheet = (a) => `hsl(from var(--bg) h s l / ${a})`
  const lite = (a) => `hsl(from white h s l / ${a})`
  const fieldFill = dark ? lite(0.06) : lite(0.35)
  const fieldHover = dark ? lite(0.1) : lite(0.5)
  const stroke = dark ? lite(0.14) : lite(0.6)
  // Gradient light borders (brighter top-left, faint elsewhere) via the bevel mixin.
  const panelBevel = `linear-gradient(135deg, ${lite(dark ? 0.45 : 0.85)}, ${lite(0.04)} 38%, ${lite(0.02)} 68%, ${lite(dark ? 0.16 : 0.4)})`
  const ctrlBevel = `linear-gradient(135deg, ${lite(dark ? 0.3 : 0.7)}, ${lite(0.02)} 50%, ${lite(dark ? 0.08 : 0.25)})`

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --fg: ${fg};
  --fg-muted: ${fgMuted};
  --field: ${fieldFill};
  --field-hover: ${fieldHover};
  --stroke: ${stroke};
  --spacing: ${spacing};
  --weight: ${weight};
  --roundness: ${roundness};
  --r: calc(var(--u) * var(--roundness) * 3);
  --u: ${4 * size}px;
  color-scheme: ${dark ? 'dark' : 'light'};

  position: relative;
  isolation: isolate;
  background: ${sheet(dark ? 0.45 : 0.4)};
  -webkit-backdrop-filter: blur(${blur}px) saturate(1.4);
  backdrop-filter: blur(${blur}px) saturate(1.4);
  color: var(--fg);
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-weight: var(--weight);
  border-radius: var(--r);
  box-shadow: 0 16px 40px -12px hsl(from var(--bg) h s calc(l - 0.1) / .5);
  padding: calc(var(--u) * (3 + 2 * var(--spacing)));
  min-width: 28ch;
  max-width: calc(var(--u) * 112);
  -webkit-font-smoothing: antialiased;

  /* gradient light border */
  &::after { ${bevel('var(--panel-bevel)', '1px')} }
  --panel-bevel: ${panelBevel};
  --ctrl-bevel: ${ctrlBevel};

  /* ── Header ── */
  > summary, > .s-panel-title { font-weight: 600; font-size: larger; letter-spacing: -0.01em; text-shadow: 0 1px 2px ${sheet(0.4)}; }
  > summary {
    &::after { content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; flex-shrink: 0; background: currentColor; opacity: .7;
      -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
      mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
      transition: transform .2s; }
  }
  &[open] > summary::after { transform: rotate(-180deg); }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(var(--u) * (1 + 2 * var(--spacing))); }
  .s-panel-content { gap: calc(var(--pad) * 1.4); }

  /* ── Labels ── */
  .s-label { font-weight: 500; }
  .s-hint { color: var(--fg-muted); font-size: smaller; }
  .s-title { display: inline-flex; align-items: center; justify-content: center; width: calc(var(--u) * 4); height: calc(var(--u) * 4); border-radius: 50%; background: var(--field); border: 1px solid var(--stroke); font-size: 10px; cursor: help;
    &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: var(--u); padding: calc(var(--u) * 1.5); font-size: smaller; background: ${sheet(0.85)}; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.5); width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--field); color: var(--fg); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.55);
    font: inherit; font-weight: var(--weight);
    &::placeholder { color: var(--fg-muted); }
    &:hover { background: var(--field-hover); }
    &:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent), transparent 65%); }
  }
  input[type="text"], input[type="number"], select { height: calc(1lh + var(--pad) * 2); }
  select { cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,4 5,6.5 7,4' fill='none' stroke='%23${dark ? 'ccc' : '555'}' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right calc(var(--u) * 2) center; padding-right: calc(var(--u) * 6);
    option { background: ${dark ? '#1c2030' : '#fff'}; color: var(--fg); } }
  .s-select.s-dropdown select { flex: 1; }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { flex-direction: column; button { background: none; border: none; color: var(--fg-muted); padding: 0 calc(var(--u) * 1.5); font-size: .6em; line-height: 1.4; cursor: pointer; &:hover { color: var(--fg); } } }
  }

  /* ── Buttons ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { position: relative; width: 100%; background: color-mix(in oklab, var(--accent), transparent 12%); color: #fff; font-weight: 600; border: none; border-radius: calc(var(--r) * 0.55);
      padding: calc(var(--u) * (1 + var(--spacing))) calc(var(--pad) * 2); box-shadow: 0 4px 14px -4px color-mix(in oklab, var(--accent), transparent 40%); transition: background .14s, transform .08s;
      &::after { ${bevel('var(--ctrl-bevel)', '1px')} }
      &:hover { background: var(--accent); }
      &:active { transform: translateY(1px); }
      &:disabled { opacity: .5; box-shadow: none; cursor: not-allowed; }
      &:focus-visible { outline: 2px solid #fff; outline-offset: 2px; } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--fg); border: 1px solid var(--stroke); box-shadow: none;
      &::after { display: none; } &:hover { background: var(--field-hover); } }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-input { cursor: pointer; }
    &.s-switch {
      .s-track { width: calc(var(--u) * 12); height: calc(var(--u) * 6.5); border-radius: 999px; background: var(--field); border: 1px solid var(--stroke); position: relative; transition: background .2s;
        &::after { content: ''; position: absolute; top: 50%; left: 2px; width: calc(var(--u) * 5); height: calc(var(--u) * 5); transform: translateY(-50%); border-radius: 50%; background: ${dark ? lite(0.85) : '#fff'}; box-shadow: 0 1px 3px hsl(from var(--bg) h s calc(l - 0.1) / .5); transition: left .2s; } }
      &:has(input:checked) .s-track { background: var(--accent); border-color: transparent; &::after { left: calc(100% - var(--u) * 5 - 2px); } }
      &:has(input:focus-visible) .s-track { box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent), transparent 50%); }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); border-radius: calc(var(--r) * 0.35); background: var(--field); border: 1px solid var(--stroke);
        &::after { content: ''; width: 55%; height: 55%; border-radius: calc(var(--r) * 0.2); background: transparent; transition: background .12s; } }
      &:has(input:checked) .s-track { background: var(--accent); border-color: transparent; &::after { background: #fff; } }
    }
    &.s-toggle {
      .s-track { padding: var(--pad) calc(var(--pad) * 2); border-radius: calc(var(--r) * 0.55); background: var(--field); border: 1px solid var(--stroke); height: calc(1lh + var(--pad) * 2); display: flex; align-items: center; justify-content: center; font-size: smaller; color: var(--fg-muted); cursor: pointer;
        &::after { content: 'Off'; } }
      &:has(input:checked) .s-track { background: color-mix(in oklab, var(--accent), transparent 15%); border-color: transparent; color: #fff; &::after { content: 'On'; } }
    }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track { height: calc(var(--u) * 5); margin: calc(var(--u) * var(--spacing)) 0; }
    input[type="range"] {
      width: 100%; height: calc(var(--u) * 1.5); -webkit-appearance: none; appearance: none; border-radius: 999px; cursor: pointer;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--field) var(--p, 0%));
      border: 1px solid var(--stroke);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border-radius: 50%; background: #fff; border: 1px solid var(--stroke); box-shadow: 0 1px 4px hsl(from var(--bg) h s calc(l - 0.1) / .5); cursor: grab; margin-top: calc(var(--u) * -1.5); }
      &::-moz-range-thumb { width: calc(var(--u) * 4.5); height: calc(var(--u) * 4.5); border-radius: 50%; background: #fff; border: 1px solid var(--stroke); cursor: grab; }
      &:focus-visible { outline: none; box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent), transparent 60%); }
    }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-marks { display: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 6px); font-size: smaller; color: var(--fg-muted); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; min-width: 7ch; text-align: right; font-size: smaller; color: var(--fg-muted); font-variant-numeric: tabular-nums; background: transparent; border: none; padding-left: var(--pad); }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); margin-bottom: var(--u); background: ${sheet(0.85)}; -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.4); padding: 2px 8px; font-size: smaller; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(var(--u) * 1.5); margin: calc(var(--u) * var(--spacing)) 0; border-radius: 999px; background: var(--field); border: 1px solid var(--stroke); position: relative;
      &::before { content: ''; position: absolute; top: -1px; bottom: -1px; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); border-radius: 999px; } }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-segmented {
      .s-input { gap: 0; background: var(--field); border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.55); padding: 2px; }
      button { flex: 1; background: transparent; border: none; border-radius: calc(var(--r) * 0.45); color: var(--fg-muted); padding: calc(var(--pad) - 2px); transition: background .14s, color .14s;
        &:hover { color: var(--fg); }
        &.s-selected { background: var(--accent); color: #fff; } }
    }
    &.s-radio, &.s-checkboxes {
      .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * var(--spacing) * 1.5); }
      label { display: flex; align-items: center; gap: calc(var(--u) * 2.5); cursor: pointer; }
    }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: grid; place-items: center; width: calc(var(--u) * 5.5); height: calc(var(--u) * 5.5); flex-shrink: 0; border-radius: calc(var(--r) * 0.35); background: var(--field); border: 1px solid var(--stroke);
        &::after { content: ''; width: 55%; height: 55%; border-radius: calc(var(--r) * 0.2); background: transparent; } }
      label:has(input:checked) .s-track { background: var(--accent); border-color: transparent; &::after { background: #fff; } }
    }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 2);
      input[type="color"] { position: static; width: calc(var(--u) * 8); height: calc(1lh + var(--pad) * 2); padding: 0; border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.55); cursor: pointer; overflow: hidden;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { flex: 1; min-width: 0; font-family: ui-monospace, monospace; } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: calc(var(--u) * 1.5); }
      button { width: calc(var(--u) * 6); height: calc(var(--u) * 6); padding: 0; border: 1px solid var(--stroke); border-radius: calc(var(--r) * 0.45);
        &.s-selected { outline: 2px solid #fff; outline-offset: 2px; } } }
  }

  /* ── Text / Textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start;
    textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(var(--lh) * 3); max-height: 50vh; }
    &.s-code textarea { font-family: ui-monospace, monospace; font-size: smaller; } }

  /* ── Folder ── */
  .s-folder {
    > summary { font-weight: 500; color: var(--fg-muted); padding: calc(var(--u) * 2) 0; border-bottom: 1px solid var(--stroke);
      &::after { content: ''; width: calc(var(--u) * 4); height: calc(var(--u) * 4); margin-left: auto; background: currentColor; -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; transition: transform .2s; } }
    &[open] > summary { border-bottom: none; &::after { transform: rotate(-180deg); } }
    .s-content { padding: calc(var(--u) * 2 * var(--spacing)) 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
