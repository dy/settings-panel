/**
 * tweakpane — calibrated to Tweakpane's default dark theme
 *
 * Signatures: monospace throughout, a fully greyscale blue-grey palette (no hue
 * accent — states shift only lightness), a razor-thin 2px slider track with a
 * 12px square knob, light-grey buttons with dark text, and a grid-dot folder mark.
 * Ref: https://tweakpane.github.io/docs/
 *
 * tweakpane(axes?) → CSS string
 */

import baseCSS from './base.js'

export default function tweakpane({
  shade = '#262629',     // panel bg ≈ hsl(230 7% 17%)
  fg = '#bcbcc2',        // input-fg / slider fill ≈ hsl(230 7% 75%)
  button = '#b0b0b6',    // button bg ≈ hsl(230 7% 70%)
} = {}) {
  const field = 'rgba(191,191,191,0.1)';   // input-bg / container-bg
  const fieldH = 'rgba(191,191,191,0.16)';
  const label = 'rgba(191,191,191,0.7)';

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${fg};
  --field: ${field};
  --fg: ${fg};
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 2px;
  color-scheme: dark;

  background: var(--bg);
  color: var(--fg);
  font: 11px/1.4 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  width: 256px;
  min-width: 0;
  max-width: 256px;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);

  /* ── Title ── */
  > summary, > .s-panel-title {
    color: ${label};
    font-weight: 500;
    padding: 4px 4px 6px;
    &::after { content: ''; width: 6px; height: 6px; margin-left: auto; border: 1px solid currentColor; opacity: .5; transition: transform .15s; }
  }
  &[open] > summary::after { transform: rotate(45deg); }
  .s-panel-content { gap: 4px; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row ── */
  .s-control { gap: 4px; padding: 0; min-height: 20px; align-items: center; }
  .s-label-group { width: 34%; min-width: 0; max-width: none; padding: 0 4px; line-height: 1.3; }
  .s-label { color: ${label}; font-weight: 400; }
  .s-hint { color: ${label}; opacity: .7; font-size: 10px; }
  .s-input { gap: 4px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--fg); border: none; border-radius: var(--r);
    height: 20px; padding: 0 6px; font: inherit;
    &::placeholder { color: ${label}; }
    &:hover { background: ${fieldH}; }
    &:focus { background: ${fieldH}; outline: none; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: 2px track + 2px fill + 12px square knob ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 20px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 16px; -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
      background-image:
        linear-gradient(to right, var(--fg) 0 var(--p, 0%), transparent var(--p, 0%)),
        linear-gradient(${field} 0 0);
      background-size: 100% 2px, 100% 2px; background-position: center; background-repeat: no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 2px; background: ${button}; cursor: pointer; }
      &::-moz-range-thumb { width: 12px; height: 12px; border-radius: 2px; border: none; background: ${button}; cursor: pointer; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: ${label}; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 38%; min-width: 44px; text-align: right; background: var(--field); color: var(--fg); border: none; border-radius: var(--r); height: 20px; padding: 0 6px; font-variant-numeric: tabular-nums; &:hover, &:focus { background: ${fieldH}; outline: none; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: #000; color: var(--fg); padding: 1px 5px; border-radius: 2px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 2px; margin: 9px 0; background: var(--field); position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--fg); }
      input[type="range"]::-webkit-slider-thumb { width: 12px; height: 12px; border-radius: 2px; background: ${button}; }
      input[type="range"]::-moz-range-thumb { width: 12px; height: 12px; border-radius: 2px; background: ${button}; } }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='1,1 5,5 9,1' fill='none' stroke='%23bcbcc2' stroke-width='1.3'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 7px center; background-size: 9px 6px; padding-right: 20px;
      option { background: #2f2f33; color: var(--fg); } }
    &.s-segmented { .s-input { gap: 2px; } button { flex: 1; background: var(--field); border: none; color: var(--fg); border-radius: var(--r); padding: 3px; font: inherit; &:hover { background: ${fieldH}; } &.s-selected { background: ${button}; color: ${shade}; } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 3px; } label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
  }

  /* ── Boolean: input-bg square with a check ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 16px; height: 16px; margin: 0; border-radius: var(--r); background: var(--field); cursor: pointer;
      &:hover { background: ${fieldH}; }
      &:checked { background: var(--field) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23bcbcc2' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: 4px;
      input[type="color"] { position: static; width: 24px; height: 20px; padding: 0; border: none; border-radius: var(--r); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 1; min-width: 0; } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { width: 24px; height: 20px; } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: none; &.s-selected { outline: 1px solid var(--fg); } }
  }

  /* ── Button: light pill, dark text ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: ${button}; color: ${shade}; border: none; border-radius: var(--r); height: 20px; font-weight: 500; &:hover { background: #c2c2c8; } &:active { background: #d2d2d8; } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--fg); &:hover { background: ${fieldH}; } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 4px 6px; } }

  /* ── Folder: container-bg row + grid-dot marker ── */
  .s-folder {
    > summary { background: var(--field); color: ${label}; font-weight: 500; padding: 5px 6px; border-radius: var(--r);
      &::after { content: ''; width: 6px; height: 6px; margin-left: auto; opacity: .5;
        background: radial-gradient(currentColor 40%, transparent 45%) 0 0 / 3px 3px; transition: transform .15s; } }
    &[open] > summary::after { transform: rotate(90deg); }
    .s-content { gap: 4px; padding-left: 4px; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { background: rgba(0,0,0,.2); border-radius: var(--r); padding: 0 6px; color: var(--fg); font-variant-numeric: tabular-nums; }
  .s-separator { background: ${field}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
