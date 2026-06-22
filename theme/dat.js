/**
 * dat — calibrated to dat.gui / lil-gui
 *
 * The classic out-of-the-way inspector: an ultra-narrow near-black panel with a
 * darker title bar, cyan-tinted numeric widgets, and the signature thumbless
 * slider where a colored fill-bar IS the position indicator.
 * Ref: https://lil-gui.georgealways.com/
 *
 * dat(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

export default function dat({
  shade = '#1f1f1f',
  accent = '#2cc9ff',
  title = '#111111',
  widget = '#424242',
  text = '#ebebeb',
} = {}) {
  const acc = resolveAccent(accent, shade)

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --widget: ${widget};
  --text: ${text};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  color-scheme: dark;

  background: var(--bg);
  color: var(--text);
  font: 11px/1.45 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  width: 245px;
  min-width: 0;
  max-width: 245px;
  border-radius: 0;
  padding: 0;

  /* ── Title bar (left-prefixed disclosure triangle, lil-gui style) ── */
  > summary, > .s-panel-title {
    background: ${title};
    color: var(--text);
    font-weight: 600;
    font-size: 11px;
    padding: 5px 8px;
    line-height: 1;
    &::before { content: ''; width: 8px; height: 8px; margin-right: 6px; flex-shrink: 0; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23fff' stroke-width='1.6'/%3E%3C/svg%3E");
  &:not([open]) > summary::before { transform: rotate(-90deg); }
  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row ── */
  .s-control {
    gap: 0;
    padding: 0 8px 0 10px;
    min-height: 26px;
    align-items: center;
    border-bottom: 1px solid #00000033;
  }
  .s-label-group { width: 38%; min-width: 0; max-width: none; padding: 0; line-height: 1.2; }
  .s-label { color: var(--text); font-weight: 400; }
  .s-hint { color: #888; font-size: 10px; }
  .s-input { gap: 4px; align-items: center; }

  /* ── Widgets (inputs / select) ── */
  input[type="text"], input[type="number"], select {
    background: var(--widget);
    color: var(--accent);
    border: none;
    border-radius: var(--r);
    height: 20px;
    padding: 0 5px;
    font: inherit;
    &::placeholder { color: #888; }
    &:hover { background: #4f4f4f; }
    &:focus { background: #595959; outline: none; }
  }
  .s-text input[type="text"] { flex: 1; }
  .s-text input[type="text"], .s-textarea textarea { color: #a2db3c; }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { display: none; }
  }

  /* ── Slider: thumbless fill-bar + cyan number ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 14px; }
    .s-track { height: 20px; margin: 3px 0; }
    input[type="range"] {
      width: 100%; height: 20px; -webkit-appearance: none; appearance: none; cursor: ew-resize;
      border-radius: var(--r);
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--widget) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 2px; height: 20px; background: var(--accent); cursor: ew-resize; }
      &::-moz-range-thumb { width: 2px; height: 20px; border: none; border-radius: 0; background: var(--accent); cursor: ew-resize; }
      &:hover { background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), #4f4f4f var(--p, 0%)); }
    }
    .s-marks { display: none; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: #888; white-space: nowrap; }
    .s-readout {
      flex: 0 0 auto; width: 27%; min-width: 45px; text-align: left;
      background: var(--widget); color: var(--accent); border: none; border-radius: var(--r);
      height: 20px; padding: 0 5px; font-variant-numeric: tabular-nums;
      &:hover { background: #4f4f4f; } &:focus { background: #595959; outline: none; }
    }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: #000; color: var(--accent); padding: 1px 5px; border-radius: 2px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 20px; margin: 3px 0; border-radius: var(--r); background: var(--widget); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select / dropdown ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--text);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='%23bbb'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 6px center; padding-right: 18px;
      option { background: #2a2a2a; color: var(--text); } }
    &.s-segmented { .s-input { gap: 1px; } button { flex: 1; background: var(--widget); border: none; color: var(--text); padding: 3px; &:hover { background: #4f4f4f; } &.s-selected { background: var(--accent); color: #000; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 3px; padding: 3px 0; } label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
  }

  /* ── Boolean: #424242 square checkbox with a cyan check ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; width: 15px; height: 15px; margin: 0; background: var(--widget); border-radius: var(--r); cursor: pointer; position: static; opacity: 1;
      &:hover { background: #4f4f4f; }
      &:checked { background: var(--widget) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%232cc9ff' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
    /* switch/toggle fall back to a checkbox-ish look via the native input above */
    &.s-switch .s-input, &.s-toggle .s-input { gap: 6px; }
  }

  /* ── Color: full-width swatch + hex ── */
  .s-color {
    &.s-picker .s-color-input { gap: 4px;
      input[type="color"] { position: static; flex: 1; min-width: 0; height: 20px; padding: 0; border: none; border-radius: var(--r); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 0 0 auto; width: 56px; background: var(--widget); color: var(--accent); border-radius: var(--r); font-family: ui-monospace, monospace; padding: 0 5px; height: 20px; } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { flex: none; width: 28px; height: 20px; } input[type="text"] { flex: 1; font-family: ui-monospace, monospace; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: 1px solid #000; &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--widget); color: var(--text); border: none; border-radius: var(--r); height: 20px; padding: 0 8px; &:hover { background: #4f4f4f; } &:active { background: #595959; } }
    &.s-secondary button, button.s-secondary { background: #333; }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; background: var(--widget); border: none; border-radius: var(--r); resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 4px 5px; } &.s-code textarea { font-family: ui-monospace, monospace; } }

  /* ── Folder ── */
  .s-folder {
    > summary { background: #181818; color: #ccc; font-weight: 400; padding: 5px 8px 5px 10px; border-bottom: 1px solid #00000033;
      &::after { content: ''; width: 9px; height: 9px; margin-left: auto; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { gap: 0; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--accent); font-variant-numeric: tabular-nums; }
  .s-separator { background: #000; opacity: .4; }
}`

  return baseCSS + '\n' + overrides
}
