/**
 * controlkit — calibrated to ControlKit.js's dark panel
 *
 * Signatures: a dense, flat near-black panel with gradient group-header bars, a
 * single burgundy-red (#b32435) thumbless slider fill, a strict label/control
 * split, and Arial type — the "Photoshop-panel" inspector look.
 * Ref: https://github.com/automat/controlkit.js
 *
 * controlkit(axes?) → CSS string
 */

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

export default function controlkit({
  shade = '#1a1a1a',
  accent = '#b32435',
  field = '#222729',
} = {}) {
  const acc = resolveAccent(accent, shade)
  const inset = '#1e2224';
  const text = '#aeb5b8';
  const muted = '#65696b';

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --field: ${field};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  color-scheme: dark;

  background: var(--bg);
  color: ${text};
  font: 11px/1.4 Arial, Helvetica, sans-serif;
  width: 200px;
  min-width: 0;
  max-width: 200px;
  border-radius: 2px;
  padding: 0;

  /* ── Title ── */
  > summary, > .s-panel-title {
    background: ${shade}; color: ${muted}; font-weight: 700; height: 30px; padding: 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: .04em;
    &::after { content: ''; width: 8px; height: 8px; margin-left: auto; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23aaa' stroke-width='1.6'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(-180deg); }
  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row ── */
  .s-control { gap: 0; padding: 0 6px; min-height: 25px; align-items: center; border-bottom: 1px solid #000; }
  .s-label-group { width: 30%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: ${text}; font-weight: 400; }
  .s-hint { color: ${muted}; font-size: 10px; }
  .s-input { gap: 4px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: ${field}; color: #fff; border: 1px solid #000; border-radius: 2px;
    height: 19px; padding: 0 4px; font: inherit;
    &::placeholder { color: ${muted}; }
    &:focus { outline: 1px solid ${acc}; outline-offset: -1px; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: dark slot, red fill, no thumb, number right ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 19px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 19px; -webkit-appearance: none; appearance: none; cursor: pointer; border: 1px solid #000; border-radius: 2px;
      background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), ${inset} var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 0; height: 19px; }
      &::-moz-range-thumb { width: 0; height: 19px; border: none; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: ${muted}; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 34%; min-width: 42px; text-align: right; background: ${field}; color: #fff; border: 1px solid #000; border-radius: 2px; height: 19px; padding: 0 4px; font-variant-numeric: tabular-nums; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: #000; color: #fff; padding: 1px 4px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 19px; margin: 0; border: 1px solid #000; border-radius: 2px; background: ${inset}; position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: ${text};
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='%23888'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 5px center; padding-right: 16px;
      option { background: ${field}; color: ${text}; } }
    &.s-segmented { .s-input { gap: 0; } button { flex: 1; background: ${field}; border: 1px solid #000; color: ${text}; margin-left: -1px; padding: 2px; font: inherit; &:first-child { margin-left: 0; } &.s-selected { background: var(--accent); color: #fff; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 2px; } label { display: flex; align-items: center; gap: 5px; cursor: pointer; } }
  }

  /* ── Boolean: small blue checkbox ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 14px; height: 14px; margin: 0; border-radius: 2px; background: ${field}; border: 1px solid #000; cursor: pointer;
      &:checked { background: #2f6fb3 url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") center / 10px no-repeat; } }
    .s-track { display: none; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: 0; position: relative; border: 1px solid #000; border-radius: 2px; overflow: hidden;
      input[type="color"] { position: absolute; inset: 0; width: 100%; height: 19px; padding: 0; border: none; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; } }
      input[type="text"] { position: relative; flex: 1; background: transparent; color: #fff; mix-blend-mode: difference; font-family: Arial, sans-serif; padding-left: 5px; height: 19px; } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { width: 28px; height: 19px; border: 1px solid #000; } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 16px; height: 16px; border: 1px solid #000; &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button: gray gradient, uppercase ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: linear-gradient(#454545, #3b3b3b); color: #fff; border: 1px solid #000; border-radius: 2px; height: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; &:hover { background: linear-gradient(#505050, #444); } &:active { background: linear-gradient(#3b3b3b, #454545); } }
    &.s-secondary button, button.s-secondary { background: ${field}; }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 3px 4px; } }

  /* ── Folder: gradient group header ── */
  .s-folder {
    > summary { background: linear-gradient(#454545, #3b3b3b); color: #fff; font-weight: 700; height: 28px; padding: 0 8px; border-bottom: 1px solid #000;
      &::after { content: ''; width: 8px; height: 8px; margin-left: auto; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; } }
    &[open] > summary::after { transform: rotate(-180deg); }
    &.s-section > summary, .s-content .s-folder > summary { background: #272727; }
    .s-content { gap: 0; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: #fff; font-variant-numeric: tabular-nums; }
  .s-separator { background: #000; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
