/**
 * uil — calibrated to lo-th/uil
 *
 * Signatures: a tightly-framed monospace panel (#37383d) where each control can
 * carry its own accent color, pill-toggle booleans, thin recessed slider tracks
 * with a light fill, and a #308AFF blue for active/selected states.
 * Ref: https://lo-th.github.io/uil/
 *
 * uil(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

export default function uil({
  shade = '#37383d',
  accent = '#308AFF',
  fill = '#dddddd',
} = {}) {
  const acc = resolveAccent(accent, shade)
  const text = '#dddddd';
  const face = '#3c3c3c';
  const border = '#4c4c4c';

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --slide: ${fill};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 6px;
  color-scheme: dark;

  background: var(--bg);
  color: ${text};
  font: 11px/1.4 'Roboto Mono', ui-monospace, Menlo, Courier, monospace;
  width: 240px;
  min-width: 0;
  max-width: 240px;
  border: 2px solid ${shade};
  border-radius: 6px;
  padding: 0;

  /* ── Title (left-aligned, dot-grid mark right) ── */
  > summary, > .s-panel-title {
    color: #fff; font-weight: 500; justify-content: flex-start; height: 24px; padding: 0 8px; position: relative;
    &::after { content: ''; width: 9px; height: 9px; margin-left: auto;
      background: radial-gradient(${text} 40%, transparent 45%) 0 0 / 4.5px 4.5px; opacity: .7; }
  }
  .s-panel-content { gap: 3px; padding: 4px; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 4px; }

  /* ── Row ── */
  .s-control { gap: 4px; padding: 0; min-height: 24px; align-items: center; }
  .s-label-group { width: 38%; min-width: 0; max-width: none; padding: 0 0 0 4px; }
  .s-label { color: ${text}; font-weight: 400; }
  .s-hint { color: #999; font-size: 10px; }
  .s-input { gap: 4px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: rgba(0,0,0,.2); color: ${text}; border: 1px solid ${border}; border-radius: var(--r);
    height: 22px; padding: 0 6px; font: inherit;
    &::placeholder { color: #888; }
    &:focus { outline: 1px solid ${acc}; outline-offset: -1px; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: center; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: recessed thin track, light fill, small thumb ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 22px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 22px; -webkit-appearance: none; appearance: none; cursor: pointer; border-radius: var(--r);
      background: linear-gradient(to right, var(--slide) 0 var(--p, 0%), rgba(0,0,0,.25) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 4px; height: 22px; background: var(--slide); cursor: ew-resize; }
      &::-moz-range-thumb { width: 4px; height: 22px; border: none; border-radius: 0; background: var(--slide); cursor: ew-resize; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: #999; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 28%; min-width: 46px; text-align: center; background: rgba(0,0,0,.2); color: ${text}; border: 1px solid ${border}; border-radius: var(--r); height: 22px; padding: 0 4px; font-variant-numeric: tabular-nums; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: #000; color: ${text}; padding: 1px 5px; border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 22px; margin: 0; border-radius: var(--r); background: rgba(0,0,0,.25); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--slide); opacity: .6; } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg' stroke='%23bbb' stroke-width='1.4'%3E%3Cline x1='1' y1='3.5' x2='11' y2='3.5'/%3E%3Cline x1='1' y1='6.5' x2='11' y2='6.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 6px center; background-size: 11px 9px; padding-right: 20px;
      option { background: #2c2d31; color: ${text}; } }
    &.s-segmented { .s-input { gap: 3px; } button { flex: 1; background: ${face}; border: 1px solid ${border}; color: ${text}; border-radius: var(--r); padding: 3px; font: inherit; &:hover { background: #5c5c5c; } &.s-selected { background: ${acc}; color: #fff; border-color: ${acc}; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 3px; } label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
  }

  /* ── Boolean: pill toggle ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch, &.s-toggle {
      .s-track { width: 36px; height: 18px; border-radius: 10px; background: rgba(0,0,0,.3); border: 1px solid rgba(0,0,0,.2); position: relative; cursor: pointer;
        &::after { content: ''; position: absolute; top: 50%; left: 2px; width: 13px; height: 13px; transform: translateY(-50%); border-radius: 50%; background: ${face}; transition: left .15s, background .15s; } }
      &:has(input:checked) .s-track { background: rgba(48,138,255,.35); &::after { left: calc(100% - 15px); background: #eee; } }
      &:has(input:focus-visible) .s-track { outline: 1px solid ${acc}; outline-offset: 1px; }
    }
    &.s-checkbox { input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 16px; height: 16px; margin: 0; border-radius: 3px; background: rgba(0,0,0,.3); border: 1px solid ${border}; cursor: pointer; &:checked { background: ${acc}; } } .s-track { display: none; } }
  }

  /* ── Color: full-width tinted field with the hex over it (uil style) ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; border: 1px solid ${border}; border-radius: var(--r); overflow: hidden;
      input[type="color"] { position: absolute; inset: 0; width: 100%; height: 22px; padding: 0; border: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { position: relative; flex: 1; background: transparent; color: #fff; mix-blend-mode: difference; font-family: 'Roboto Mono', monospace; padding-left: 8px; height: 22px; } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { flex: none; width: 28px; height: 22px; border: 1px solid ${border}; border-radius: var(--r); } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: 1px solid ${border}; &.s-selected { outline: 1px solid ${acc}; } }
  }

  /* ── Button: pill ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: 4px; }
    button { width: 100%; background: ${face}; color: ${text}; border: 1px solid ${border}; border-radius: var(--r); height: 22px; &:hover { background: #5c5c5c; } &:active, &.s-selected { background: ${acc}; color: #fff; border-color: ${acc}; } }
    &.s-secondary button, button.s-secondary { background: rgba(0,0,0,.2); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 44px; max-height: 50vh; padding: 4px 6px; } }

  /* ── Folder: dot-grid marker ── */
  .s-folder {
    > summary { color: #ccc; font-weight: 400; padding: 4px 4px;
      &::after { content: ''; width: 8px; height: 8px; margin-left: auto; background: radial-gradient(#999 40%, transparent 45%) 0 0 / 4px 4px; transition: transform .15s; } }
    &[open] > summary::after { transform: rotate(90deg); }
    .s-content { gap: 3px; padding-left: 6px; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: ${text}; font-variant-numeric: tabular-nums; }
  .s-separator { background: rgba(0,0,0,.3); opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
