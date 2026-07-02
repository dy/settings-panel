/**
 * oui — calibrated to wearekuva/oui
 *
 * Signatures: a minimal white panel with Menlo monospace at a small size, a red
 * (#ff5252) slider fill with no visible thumb, and borderless inputs that show
 * only a bottom rule (turning red on focus). Clinical, code-editor restraint.
 * Ref: https://github.com/wearekuva/oui
 *
 * oui(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

export default function oui({
  shade = '#fafafa',
  accent = '#ff5252',
} = {}) {
  const acc = resolveAccent(accent, shade)
  const text = '#424242';
  const line = '#d2d2d2';

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  color-scheme: light;

  background: var(--bg);
  color: ${text};
  font: 10px/1.6 Menlo, Inconsolata, Consolas, ui-monospace, monospace;
  width: 275px;
  min-width: 0;
  max-width: 275px;
  border-radius: 2px;
  padding: 10px;
  box-shadow: none;

  /* ── Title ── */
  > summary, > .s-panel-title {
    color: ${text}; font-weight: 400; height: 22px; padding: 0 0 11px; border-bottom: 1px solid ${line};
    &::after { content: ''; width: 10px; height: 10px; margin-left: auto; background: ${text}; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s; transform: rotate(-180deg); }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(0deg); }
  .s-panel-content { gap: 2px; padding: 7px 0 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 7px; }

  /* ── Row ── */
  .s-control { gap: 8px; padding: 0; min-height: 20px; align-items: center; }
  .s-boolean { min-height: 24px; }
  .s-label-group { width: 50%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: ${text}; font-weight: 400; }
  .s-hint { color: #999; font-size: 9px; }
  .s-input { gap: 6px; align-items: center; justify-content: flex-end; }

  /* ── Fields: borderless, bottom rule only ── */
  input[type="text"], input[type="number"], textarea {
    background: transparent; color: ${text}; border: none; border-bottom: 1px solid ${line}; border-radius: 0;
    height: 20px; padding: 0 2px; font: inherit; text-align: right;
    &::placeholder { color: #aaa; }
    &:hover { border-bottom-color: ${acc}; }
  }
  input[type="number"] { &:focus { outline: none; border-bottom-color: ${acc}; } }
  .s-text input[type="text"] { flex: 1; }
  .s-text, .s-color.s-picker {
    .s-label-group { width: auto; flex: 0 1 auto; }
    .s-input { flex: 0 0 50.2%; margin-left: auto; }
    input[type="text"] { flex: 1; width: auto; }
  }
  select { background: transparent; color: ${text}; border: none; cursor: pointer; height: 20px; padding: 0 2px; font: inherit; line-height: 20px; text-align: right; &:focus { outline: none; } option { background: #fff; color: ${text}; } }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: light track, red fill, invisible thumb ── */
  .s-slider {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0;
    min-height: 32px;
    align-items: start;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-label-group { grid-column: 1; grid-row: 1; width: auto; line-height: 20px; }
    .s-input { display: contents; }
    .s-track { grid-column: 1 / 3; grid-row: 2; height: 10px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 10px; -webkit-appearance: none; appearance: none; cursor: pointer; border-radius: 0; outline: none;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), ${line} var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; background: transparent; cursor: ew-resize; }
      &::-moz-range-thumb { width: 10px; height: 10px; border: none; background: transparent; cursor: ew-resize; }
      &:focus-visible { box-shadow: inset 0 0 0 1px ${acc}; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 9px; color: #999; white-space: nowrap; }
    .s-readout { grid-column: 2; grid-row: 1; flex: 0 0 auto; width: 28px; min-width: 28px; text-align: center; background: #fff; color: ${text}; border: 1px solid ${line}; border-radius: 2px; height: 15px; padding: 0 2px; font-variant-numeric: tabular-nums; &:focus { outline: none; border-color: ${acc}; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: ${text}; color: #fff; padding: 1px 5px; border-radius: 2px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 4px; margin: 8px 0; background: ${line}; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; border-bottom: 1px solid ${line};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='1,1 5,5 9,1' fill='none' stroke='%23999' stroke-width='1.2'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1px center; background-size: 9px 6px; padding: 0 18px 0 2px; }
    &.s-segmented { .s-input { gap: 0; } button { flex: 1; background: transparent; border: 1px solid ${line}; color: ${text}; margin-left: -1px; padding: 3px; font: inherit; &:first-child { margin-left: 0; } &:hover { color: ${acc}; } &.s-selected { background: ${acc}; color: #fff; border-color: ${acc}; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: flex-end; gap: 3px; } label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
  }

  /* ── Boolean: native checkbox, right ── */
  .s-boolean {
    align-items: center;
    .s-input { justify-content: flex-end; }
    input[type="checkbox"] { -webkit-appearance: auto; appearance: auto; position: static; opacity: 1; width: 13px; height: 13px; margin: 0; accent-color: #1a73e8; cursor: pointer; }
    .s-track { display: none; }
  }

  /* ── Color: circular swatch ── */
  .s-color {
    &.s-picker .s-color-input { gap: 6px; justify-content: flex-end;
      input[type="color"] { display: none; }
      input[type="text"] { flex: 0 1 auto; width: auto; min-width: 8ch; } }
    &.s-rgba .s-color-input { gap: 6px; justify-content: flex-end; input[type="color"] { width: 16px; height: 16px; border-radius: 50%; } input[type="text"] { flex: 0 1 auto; min-width: 8ch; } }
    &.s-swatches { .s-input { justify-content: flex-end; } button { width: 16px; height: 16px; border-radius: 50%; border: 1px solid ${line}; &.s-selected { outline: 2px solid var(--accent); } } }
  }

  /* ── Button (small gray pill, left-aligned) ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    margin-top: 2px; /* native: 4px gap before button row vs the 2px row gap */
    .s-input { justify-content: flex-start; gap: 0; }
    button { background: rgba(0,0,0,.06); color: ${text}; border: none; border-radius: 2px; min-width: 50px; height: 25px; padding: 0 10px; &:hover { background: ${acc}; color: #fff; } &:active { filter: brightness(.92); } }
    &.s-secondary button, button.s-secondary { background: rgba(0,0,0,.04); &:hover { background: ${acc}; color: #fff; } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 4px; text-align: left; border: 1px solid ${line}; } }

  /* ── Folder ── */
  .s-folder {
    > summary { color: ${text}; font-weight: 400; height: 20px; padding: 0;
      &::after { content: ''; width: 10px; height: 10px; margin-left: auto; background: ${text}; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s; transform: rotate(-180deg); } }
    &[open] > summary::after { transform: rotate(0deg); }
    &[open] { margin-bottom: 2px; }
    &[open] > .s-content { background: rgba(0,0,0,.04); border-radius: 2px; padding: 10px; }
    .s-content { gap: 6px; }
  }

  /* ── Info / separator ── */
  .s-info { .s-input { justify-content: flex-end; } .s-monitor { flex: 0 1 auto; color: ${text}; font-variant-numeric: tabular-nums; } }
  .s-separator { background: ${line}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
