/**
 * apple — calibrated to macOS System Settings (HIG)
 *
 * Signatures: SF Pro, the #007aff system blue, iOS toggles, rounded grouped
 * cells with hairline row dividers, thin sliders with a 20px circular thumb,
 * and macOS popup-button dropdowns. Light by default; dark shade flips it.
 *
 * apple(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent } from './color.js'

export default function apple({
  shade = '#ffffff',
  accent = '#007aff',
  size = 1,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < 0.5
  const acc = resolveAccent(accent, shade)
  const ink = dark ? '#ffffff' : '#1d1d1f'
  const dim = dark ? '#98989d' : '#8e8e93'
  const line = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'
  const fill = dark ? '#1c1c1e' : '#ffffff'
  const field = dark ? '#2c2c2e' : '#f2f2f7'

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --ink: ${ink};
  --line: ${line};
  --field: ${field};
  --u: ${4 * size}px;
  --spacing: 1;
  --weight: 400;
  --r: 8px;
  color-scheme: ${dark ? 'dark' : 'light'};

  background: ${fill};
  color: var(--ink);
  font: 13px/1.3 -apple-system, system-ui, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  width: 320px;
  min-width: 0;
  max-width: 320px;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 30px rgba(0,0,0,.12);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;

  /* ── Title ── */
  > summary, > .s-panel-title {
    font-weight: 600; font-size: 15px; color: var(--ink);
    padding: 16px 18px 10px;
    &::after { content: ''; width: 13px; height: 13px; margin-left: auto; background: ${dim}; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(-180deg); }
  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row (cell with hairline divider) ── */
  .s-control { gap: calc(var(--u) * 2); padding: 9px 18px; min-height: 44px; align-items: center; border-top: 1px solid var(--line);
    &:first-child { border-top: none; } }
  .s-label-group { width: 42%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--ink); font-weight: 400; }
  .s-hint { color: ${dim}; font-size: 12px; }
  .s-input { gap: calc(var(--u) * 2); align-items: center; justify-content: flex-end; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--ink); border: none; border-radius: 6px;
    height: 28px; padding: 0 8px; font: inherit;
    &::placeholder { color: ${dim}; }
    &:focus { outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent), transparent 70%); }
  }
  .s-text input[type="text"] { flex: 1; text-align: right; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 0 1 auto; width: 72px; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Vector ── */
  .s-vector {
    .s-input { gap: calc(var(--u) * 2); }
    .s-vec-axis { flex: 1; min-width: 0; gap: calc(var(--u)); background: var(--field); border-radius: 6px; padding: 0 8px; height: 28px; }
    .s-vec-label { color: ${dim}; font-size: 12px; }
    input[type="number"] { background: transparent; text-align: right; padding: 0; height: 28px; &:focus { box-shadow: none; } }
  }

  /* ── Slider (thin track, 20px circular thumb) ── */
  .s-slider {
    align-items: center;
    .s-track { height: 28px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 4px; -webkit-appearance: none; appearance: none; border-radius: 2px; cursor: pointer;
      background: linear-gradient(to right, var(--accent) var(--p, 0%), ${dark ? '#48484a' : '#e9e9eb'} var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25), 0 0 0 .5px rgba(0,0,0,.04); cursor: pointer; }
      &::-moz-range-thumb { width: 20px; height: 20px; border: none; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); cursor: pointer; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 4px); font-size: 11px; color: ${dim}; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 52px; text-align: right; background: var(--field); color: var(--ink); border: none; border-radius: 6px; height: 28px; padding: 0 8px; font-variant-numeric: tabular-nums; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 6px; background: ${dark ? '#3a3a3c' : '#fff'}; color: var(--ink); padding: 3px 8px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,.2); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 4px; margin: 12px 0; background: ${dark ? '#48484a' : '#e9e9eb'}; border-radius: 2px; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select (macOS popup button) ── */
  .s-select {
    &.s-dropdown select { flex: 0 1 auto; width: auto; min-width: 0; appearance: none; -webkit-appearance: none; cursor: pointer; font-weight: 400; color: var(--ink); padding-right: 26px;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 16' xmlns='http://www.w3.org/2000/svg' fill='%23${dark ? 'fff' : 'fff'}'%3E%3Cpath d='M2 7 L6 3 L10 7Z'/%3E%3Cpath d='M2 9 L6 13 L10 9Z'/%3E%3C/svg%3E"), linear-gradient(${acc}, ${acc}); background-repeat: no-repeat; background-position: right 0 center, right 0 center; background-size: 20px 28px, 20px 28px;
      option { background: ${fill}; color: var(--ink); } }
    &.s-segmented { .s-input { gap: 0; background: ${dark ? '#48484a' : '#e9e9eb'}; border-radius: 7px; padding: 2px; }
      button { flex: 1; background: transparent; border: none; color: var(--ink); border-radius: 6px; height: 26px; font: inherit;
        &.s-selected { background: ${dark ? '#636366' : '#fff'}; box-shadow: 0 1px 3px rgba(0,0,0,.12); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 2); } label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; } }
  }

  /* ── Boolean (iOS toggle) ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch {
      .s-track { width: 38px; height: 22px; border-radius: 999px; background: ${dark ? '#39393d' : '#e9e9eb'}; position: relative; cursor: pointer; transition: background .2s;
        &::after { content: ''; position: absolute; top: 1px; left: 1px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: left .2s; } }
      &:has(input:checked) .s-track { background: var(--accent); &::after { left: 17px; } }
      &:has(input:focus-visible) .s-track { outline: 3px solid color-mix(in oklab, var(--accent), transparent 60%); outline-offset: 1px; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: transparent; border: 1.5px solid ${dim};
        &::after { content: ''; width: 11px; height: 9px; -webkit-mask: var(--check) center / contain no-repeat; mask: var(--check) center / contain no-repeat; background: #fff; opacity: 0; } }
      &:has(input:checked) .s-track { background: var(--accent); border-color: var(--accent); &::after { opacity: 1; } }
    }
    --check: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E");
    &.s-toggle .s-track { padding: 0 14px; height: 28px; border-radius: 7px; background: var(--field); display: flex; align-items: center; justify-content: center; cursor: pointer; &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--accent); color: #fff; &::after { content: 'On'; } }
  }

  /* ── Color (rounded well) ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 2); justify-content: flex-end;
      input[type="color"] { position: static; flex: none; width: 24px; height: 24px; padding: 0; border: .5px solid rgba(0,0,0,.15); border-radius: 50%; cursor: pointer; overflow: hidden; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } }
      input[type="text"] { flex: 0 1 auto; width: auto; min-width: 9ch; background: var(--field); border-radius: 6px; height: 28px; text-align: right; } }
    &.s-rgba .s-color-input { gap: calc(var(--u) * 1.5); justify-content: flex-end; input[type="color"] { width: 24px; height: 24px; border-radius: 50%; } input[type="text"] { flex: 1; background: var(--field); border-radius: 6px; height: 28px; } }
    &.s-swatches { .s-input { justify-content: flex-end; } button { width: 22px; height: 22px; border-radius: 50%; border: .5px solid rgba(0,0,0,.15); &.s-selected { outline: 2px solid var(--accent); outline-offset: 2px; } } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { flex: 1; height: 30px; background: var(--accent); color: #fff; border: none; border-radius: 7px; font-weight: 500;
      &:hover { filter: brightness(1.05); } &:active { filter: brightness(.92); } &:disabled { opacity: .4; cursor: not-allowed; } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--accent); &:hover { filter: brightness(.97); } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 52px; max-height: 50vh; padding: 7px 8px; } }

  /* ── Folder (grouped section) ── */
  .s-folder {
    > summary { font-weight: 600; font-size: 13px; color: ${dim}; text-transform: none; padding: 14px 18px 6px; border-top: 1px solid var(--line);
      &::after { content: ''; width: 13px; height: 13px; margin-left: auto; background: ${dim}; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { gap: 0; }
  }

  /* ── XY pad / knob ── */
  .s-pad { border-radius: var(--r); background: var(--field); border-color: var(--line); }
  .s-knob-dial { background: var(--field); border: 1px solid var(--line); }

  /* ── Info / separator ── */
  .s-info { .s-input { justify-content: flex-end; } .s-monitor { flex: 0 1 auto; color: ${dim}; font-variant-numeric: tabular-nums; } }
  .s-separator { background: var(--line); opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
