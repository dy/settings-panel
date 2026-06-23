/**
 * figma — calibrated to Figma's properties panel
 *
 * Signatures: Inter, the #0d99ff blue, compact 24px "ghost" inputs (no border
 * until hover/focus), small rounded color swatches, dense icon-prefixed number
 * fields, and segmented icon buttons. Light by default; dark shade flips it.
 *
 * figma(axes?) → CSS string
 */

import baseCSS from './base.js'
import { parseColor, resolveAccent } from './color.js'

export default function figma({
  shade = '#ffffff',
  accent = '#0d99ff',
  size = 1,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < 0.5
  const acc = resolveAccent(accent, shade)
  const ink = dark ? '#ffffff' : '#1e1e1e'
  const dim = dark ? '#a0a0a0' : '#b3b3b3'
  const line = dark ? '#444444' : '#e6e6e6'
  const hover = dark ? '#383838' : '#f5f5f5'
  const sel = dark ? 'rgba(13,153,255,.24)' : '#e5f4ff'

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --ink: ${ink};
  --line: ${line};
  --hover: ${hover};
  --u: ${4 * size}px;
  --spacing: 1;
  --weight: 400;
  --r: 5px;
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--ink);
  font: 11px/16px 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1;
  width: 240px;
  min-width: 0;
  max-width: 240px;
  border-radius: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;

  /* ── Title (panel header) ── */
  > summary, > .s-panel-title {
    font-weight: 600; font-size: 11px; color: var(--ink);
    height: 40px; padding: 0 16px; border-bottom: 1px solid var(--line);
    &::after { content: ''; width: 8px; height: 8px; margin-left: auto; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(-180deg); }
  .s-panel-content { gap: 0; padding: 8px 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 8px; }

  /* ── Row (32px, 16px gutters) ── */
  .s-control { gap: calc(var(--u) * 2); padding: 4px 16px; min-height: 32px; align-items: center; }
  .s-label-group { width: 64px; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--ink); font-weight: 400; }
  .s-hint { color: var(--dim, ${dim}); font-size: 11px; }
  .s-input { gap: calc(var(--u) * 1.5); align-items: center; }

  /* ── Ghost inputs (border only on hover/focus) ── */
  input[type="text"], input[type="number"], select, textarea {
    background: transparent; color: var(--ink);
    border: 1px solid transparent; border-radius: 2px;
    height: 24px; padding: 0 7px; font: inherit;
    &::placeholder { color: ${dim}; }
    &:hover { border-color: var(--line); }
    &:focus { outline: none; border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Vector (Figma X/Y/W/H) ── */
  .s-vector {
    .s-input { gap: calc(var(--u) * 1.5); }
    .s-vec-axis { flex: 1; min-width: 0; gap: 0; border: 1px solid transparent; border-radius: 2px; padding-left: 7px;
      &:hover { border-color: var(--line); }
      &:focus-within { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); } }
    .s-vec-label { color: ${dim}; font-size: 11px; width: 12px; }
    input[type="number"] { border: none; box-shadow: none; padding: 0 4px; &:hover, &:focus { border: none; box-shadow: none; } }
  }

  /* ── Slider ── */
  .s-slider {
    align-items: center;
    .s-track { height: 24px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 4px; -webkit-appearance: none; appearance: none; border-radius: 2px; cursor: pointer;
      background: linear-gradient(to right, var(--accent) var(--p, 0%), var(--line) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 1px solid rgba(0,0,0,.2); box-shadow: 0 1px 2px rgba(0,0,0,.2); cursor: pointer; }
      &::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 1px solid rgba(0,0,0,.2); cursor: pointer; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: ${dim}; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 48px; text-align: left; background: transparent; color: var(--ink); border: 1px solid transparent; border-radius: 2px; height: 24px; padding: 0 6px; font-variant-numeric: tabular-nums; &:hover { border-color: var(--line); } &:focus { outline: none; border-color: var(--accent); } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 4px; background: #1e1e1e; color: #fff; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 4px; margin: 10px 0; background: var(--line); border-radius: 2px; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='1,1 5,5 9,1' fill='none' stroke='%23${dark ? 'ccc' : '555'}' stroke-width='1.2'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 7px center; background-size: 9px 6px; padding-right: 20px;
      option { background: ${dark ? '#2c2c2c' : '#fff'}; color: var(--ink); } }
    &.s-segmented { .s-input { gap: 0; background: var(--hover); border-radius: var(--r); padding: 2px; }
      button { flex: 1; background: transparent; border: none; color: var(--ink); border-radius: 3px; height: 24px; font: inherit;
        &:hover { color: var(--accent); }
        &.s-selected { background: ${dark ? '#2c2c2c' : '#fff'}; box-shadow: 0 1px 2px rgba(0,0,0,.12); color: var(--accent); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 1.5); } label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; } }
  }

  /* ── Boolean ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch {
      .s-track { width: 24px; height: 14px; border-radius: 999px; background: ${dark ? '#555' : '#d9d9d9'}; position: relative; cursor: pointer; transition: background .15s;
        &::after { content: ''; position: absolute; top: 2px; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: left .15s; } }
      &:has(input:checked) .s-track { background: var(--accent); &::after { left: 12px; } }
      &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: 16px; height: 16px; border-radius: 3px; background: transparent; border: 1.5px solid ${dark ? '#666' : '#ccc'};
        &::after { content: ''; width: 9px; height: 7px; -webkit-mask: var(--check) center / contain no-repeat; mask: var(--check) center / contain no-repeat; background: #fff; opacity: 0; } }
      &:has(input:checked) .s-track { background: var(--accent); border-color: var(--accent); &::after { opacity: 1; } }
    }
    --check: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E");
    &.s-toggle .s-track { padding: 0 10px; height: 24px; border-radius: var(--r); background: var(--hover); display: flex; align-items: center; justify-content: center; cursor: pointer;
      &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--accent); color: #fff; &::after { content: 'On'; } }
  }

  /* ── Color (swatch + hex + opacity) ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 1.5); border: 1px solid transparent; border-radius: 2px; padding: 0 2px 0 5px;
      &:hover { border-color: var(--line); }
      input[type="color"] { position: static; flex: none; width: 16px; height: 16px; padding: 0; border: 1px solid rgba(0,0,0,.1); border-radius: 3px; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 3px; } }
      input[type="text"] { flex: 1; min-width: 0; border: none; padding: 0; height: 24px; text-transform: uppercase; &:hover, &:focus { border: none; box-shadow: none; } } }
    &.s-rgba .s-color-input { gap: calc(var(--u) * 1.5); input[type="color"] { width: 16px; height: 16px; border-radius: 3px; } input[type="text"] { flex: 1; text-transform: uppercase; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: 3px; border: 1px solid rgba(0,0,0,.1); &.s-selected { outline: 2px solid var(--accent); outline-offset: 1px; } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { flex: 1; height: 32px; background: var(--accent); color: #fff; border: none; border-radius: var(--r); font-weight: 500; padding: 0 12px;
      &:hover { filter: brightness(1.05); } &:active { filter: brightness(.95); } &:disabled { opacity: .4; cursor: not-allowed; } }
    &.s-secondary button, button.s-secondary { background: transparent; color: var(--ink); box-shadow: inset 0 0 0 1px var(--line); &:hover { background: var(--hover); filter: none; } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 48px; max-height: 50vh; padding: 6px 7px; border-color: var(--line); &:hover { border-color: var(--line); } } }

  /* ── Folder (section) ── */
  .s-folder {
    > summary { font-weight: 600; color: var(--ink); height: 40px; padding: 0 16px; border-top: 1px solid var(--line);
      &::after { content: ''; width: 16px; height: 16px; margin-left: auto; background: currentColor; -webkit-mask: var(--plus) center / 11px no-repeat; mask: var(--plus) center / 11px no-repeat; opacity: .7; } }
    &[open] > summary::after { -webkit-mask-image: var(--minus); mask-image: var(--minus); }
    .s-content { gap: 0; padding-bottom: 8px; }
  }
  --plus: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg' stroke='%23${dark ? 'ccc' : '333'}' stroke-width='1.3'%3E%3Cline x1='6' y1='1' x2='6' y2='11'/%3E%3Cline x1='1' y1='6' x2='11' y2='6'/%3E%3C/svg%3E");
  --minus: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg' stroke='%23${dark ? 'ccc' : '333'}' stroke-width='1.3'%3E%3Cline x1='1' y1='6' x2='11' y2='6'/%3E%3C/svg%3E");

  /* ── XY pad / knob ── */
  .s-pad { border-radius: 2px; }
  .s-knob-dial { background: var(--hover); border: 1px solid var(--line); }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--ink); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--line); opacity: 1; margin: 8px 0; }
}`

  return baseCSS + '\n' + overrides
}
