/**
 * leva — calibrated to pmndrs/leva's default dark theme
 *
 * Signatures: three near-black depth levels (panel #181c20, title bar #292d39,
 * input fields #373c4b), a single #007bff blue accent (slider fill, rounded-rect
 * scrubber thumb, checked boxes), monospace text, and a 10px-rounded panel.
 * Ref: https://leva.pmnd.rs
 *
 * leva(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

export default function leva({
  shade = '#181c20',     // elevation2 — panel / rows
  accent = '#007bff',    // accent2
  title = '#292d39',     // elevation1 — title bar / slider track
  field = '#373c4b',     // elevation3 — input fields
} = {}) {
  const acc = resolveAccent(accent, shade)
  const muted = '#8c92a4';   // highlight2 — labels
  const ink = '#fefefe';     // highlight3 — input text

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --field: ${field};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 3px;
  color-scheme: dark;

  background: var(--bg);
  color: ${muted};
  font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace;
  width: 280px;
  min-width: 0;
  max-width: 280px;
  border-radius: 10px;
  padding: 0;
  box-shadow: 0 0 9px 0 #00000088;
  overflow: hidden;

  /* ── Title bar (elevation1) ── */
  > summary, > .s-panel-title {
    background: ${title};
    color: ${muted};
    font-weight: 400;
    justify-content: center;
    padding: 0 10px;
    height: 32px;
    position: relative;
    &::after { content: ''; position: absolute; right: 10px; width: 10px; height: 10px; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; opacity: .6; transition: transform .15s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='3,2 7,5 3,8' fill='none' stroke='%23fff' stroke-width='1.4'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(90deg); }
  .s-panel-content { gap: 0; padding: 7px 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 7px; }

  /* ── Row ── */
  .s-control { gap: 6px; padding: 3px 10px; min-height: 24px; align-items: center; }
  .s-label-group { width: 36%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: ${muted}; font-weight: 400; }
  .s-hint { color: ${muted}; opacity: .7; font-size: 10px; }
  .s-input { gap: 6px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: ${ink}; border: none; border-radius: var(--r);
    height: 22px; padding: 0 7px; font: inherit;
    &::placeholder { color: ${muted}; }
    &:hover { background: #3f4658; }
    &:focus { background: #3f4658; outline: 1px solid ${acc}; outline-offset: -1px; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: 2px track, blue fill, 8×16 rounded-rect thumb ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 22px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 16px; -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
      background-image: linear-gradient(to right, var(--accent) 0 var(--p, 0%), ${title} var(--p, 0%));
      background-size: 100% 2px; background-position: center; background-repeat: no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 8px; height: 16px; border-radius: 2px; background: var(--accent); box-shadow: 0 0 0 2px ${shade}; cursor: ew-resize; }
      &::-moz-range-thumb { width: 8px; height: 16px; border-radius: 2px; border: none; background: var(--accent); box-shadow: 0 0 0 2px ${shade}; cursor: ew-resize; }
      &:hover { background-image: linear-gradient(to right, #3c93ff 0 var(--p, 0%), ${title} var(--p, 0%)); &::-webkit-slider-thumb { background: #3c93ff; } &::-moz-range-thumb { background: #3c93ff; } }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: ${muted}; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 30%; min-width: 50px; text-align: left; background: var(--field); color: ${ink}; border: none; border-radius: var(--r); height: 22px; padding: 0 7px; font-variant-numeric: tabular-nums; &:hover { background: #3f4658; } &:focus { background: #3f4658; outline: 1px solid ${acc}; outline-offset: -1px; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: ${field}; color: ${ink}; padding: 1px 5px; border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 2px; margin: 10px 0; background: ${title}; position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type="range"]::-webkit-slider-thumb { width: 8px; height: 16px; border-radius: 2px; background: var(--accent); box-shadow: 0 0 0 2px ${shade}; }
      input[type="range"]::-moz-range-thumb { width: 8px; height: 16px; border-radius: 2px; background: var(--accent); box-shadow: 0 0 0 2px ${shade}; } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: ${ink};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='1,1 5,5 9,1' fill='none' stroke='%238c92a4' stroke-width='1.4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; padding-right: 22px;
      option { background: ${field}; color: ${ink}; } }
    &.s-segmented { .s-input { gap: 2px; } button { flex: 1; background: var(--field); border: none; color: ${ink}; border-radius: var(--r); padding: 4px; font: inherit; &:hover { background: #3f4658; } &.s-selected { background: var(--accent); color: #fff; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 4px; } label { display: flex; align-items: center; gap: 7px; cursor: pointer; } }
  }

  /* ── Boolean: 16px square, blue when checked ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 16px; height: 16px; margin: 0; border-radius: var(--r); background: var(--field); cursor: pointer;
      &:hover { background: #3f4658; }
      &:checked { background: var(--accent) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: 6px;
      input[type="color"] { position: static; width: 26px; height: 22px; padding: 0; border: none; border-radius: var(--r); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 1; min-width: 0; } }
    &.s-rgba .s-color-input { gap: 6px; input[type="color"] { width: 26px; height: 22px; } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: none; &.s-selected { outline: 2px solid var(--accent); } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--field); color: ${ink}; border: none; border-radius: var(--r); height: 24px; &:hover { background: #3f4658; } &:active { background: ${acc}; color: #fff; } }
    &.s-secondary button, button.s-secondary { background: ${title}; }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 44px; max-height: 50vh; padding: 5px 7px; } }

  /* ── Folder: chevron + indented left rule ── */
  .s-folder {
    > summary { color: ${ink}; font-weight: 400; padding: 5px 10px; border-top: 1px solid ${title};
      &::before { content: ''; width: 10px; height: 10px; margin-right: 6px; background: ${muted}; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s; }
      &::after { display: none; } }
    &[open] > summary::before { transform: rotate(90deg); }
    .s-content { gap: 0; margin-left: 10px; border-left: 1px solid ${muted}66; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: ${ink}; font-variant-numeric: tabular-nums; }
  .s-separator { background: ${title}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
