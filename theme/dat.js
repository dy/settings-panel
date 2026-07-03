/**
 * dat — calibrated to dat.gui / lil-gui
 *
 * The classic out-of-the-way inspector: an ultra-narrow near-black panel with a
 * darker title bar, cyan-tinted numeric widgets, and the signature thumbless
 * slider where a colored fill-bar IS the position indicator.
 * Ref: https://lil-gui.georgealways.com/
 *
 * Axes: shade (panel bg), accent (number-widget hue), title (header bar bg),
 * widget (control surface) and text (label/value color) — everything else
 * derives from them. Hover/focus tints and the darker "menu"/"secondary"
 * panel tones lighten or darken --widget (color-mix, live in CSS so they
 * track a widget override); the checkbox-check and select-arrow icon fills
 * derive from --text via encodeURIComponent, baked at build time since a
 * data-URI can't read a CSS var. `string` (lil-gui's fixed green for
 * string-type fields) and `ink` (the tooltip/separator/swatch-border true
 * black) are lil-gui's own hardcoded constants — not derivable from the
 * other axes, but still exposed as overridable tokens per the architecture.
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
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

  const overrides = `.s-panel {
  --bg: ${shade};
  --accent: ${acc};
  --title: ${title};
  --widget: ${widget};
  --text: ${text};
  --hint: color-mix(in srgb, var(--text), var(--bg) 48.529412%);
  --widget-hover: color-mix(in srgb, var(--widget), white 6.878307%);
  --widget-focus: color-mix(in srgb, var(--widget), white 12.169312%);
  --menu: color-mix(in srgb, var(--widget), black 36.363636%);
  --widget-secondary: color-mix(in srgb, var(--widget), black 22.727273%);
  --string: #a2db3c;
  --ink: #000;
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
    background: var(--title);
    color: var(--text);
    font-weight: 600;
    font-size: 11px;
    padding: 0 4px;
    min-height: 25px;
    line-height: 1;
    &::before { content: ''; width: 1em; height: 1em; margin-right: 2px; flex-shrink: 0; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 11 11' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='0.5,4 4,7.5 7.5,4' fill='none' stroke='%23fff' stroke-width='1.8'/%3E%3C/svg%3E");
  &:not([open]) > summary::before { transform: rotate(-90deg); }
  > summary:focus-visible { outline: none; text-decoration: underline; }
  .s-panel-content { gap: 4px; padding: 4px 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 4px; }

  /* ── Row (lil-gui metrics: 20px tall, 4px side padding, 4px gaps, no border, 45% name) ── */
  .s-control {
    gap: 0;
    padding: 0 4px;
    min-height: 20px;
    align-items: center;
    /* Disabled: dim the whole row (lil-gui .controller.disabled), not just the widget — .s-input[inert] is the only disabled hook base.js exposes */
    &:has(> .s-input[inert]) .s-label-group { opacity: .5; }
  }
  .s-label-group { flex: 0 0 auto; width: auto; min-width: 45%; max-width: none; padding: 0; line-height: 20px; overflow: visible; }
  .s-label { color: var(--text); font-weight: 400; white-space: nowrap; overflow: visible; }
  .s-hint { color: var(--hint); font-size: 10px; }
  .s-input { flex: 1 1 auto; min-width: 0; gap: 4px; align-items: center; }

  /* ── Widgets (inputs / select) ── */
  input[type="text"], input[type="number"], select {
    background: var(--widget);
    color: var(--accent);
    border: none;
    border-radius: var(--r);
    height: 20px;
    padding: 0 0 0 3px;
    font: inherit;
    &::placeholder { color: var(--hint); }
    &:hover { background: var(--widget-hover); }
    &:focus { background: var(--widget-focus); outline: none; }
  }
  .s-text input[type="text"] { flex: 1; }
  .s-text input[type="text"], .s-textarea textarea { color: var(--string); }

  /* ── Number ── */
  .s-number {
    input[type="number"] { flex: 1; text-align: left; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
    .s-step { display: none; }
  }

  /* ── Slider: thumbless fill-bar + cyan number ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 14px; }
    .s-track { height: 20px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 20px; -webkit-appearance: none; appearance: none; cursor: ew-resize;
      border-radius: var(--r);
      background: var(--widget);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 2px; height: 20px; background: var(--accent); cursor: ew-resize; }
      &::-moz-range-thumb { width: 2px; height: 20px; border: none; border-radius: 0; background: var(--accent); cursor: ew-resize; }
      &:hover { background: var(--widget-hover); }
    }
    .s-marks { display: none; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: var(--hint); white-space: nowrap; }
    .s-readout {
      flex: 0 0 auto; width: 27%; min-width: 45px; text-align: left;
      background: var(--widget); color: var(--accent); border: none; border-radius: var(--r);
      height: 20px; padding: 0 0 0 3px; font-variant-numeric: tabular-nums;
      &:hover { background: var(--widget-hover); } &:focus { background: var(--widget-focus); outline: none; }
    }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: var(--ink); color: var(--accent); padding: 1px 5px; border-radius: 2px; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 20px; margin: 3px 0; border-radius: var(--r); background: var(--widget); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select / dropdown ── */
  .s-select {
    &.s-dropdown .s-input { justify-content: flex-start; }
    &.s-dropdown select { flex: 0 0 auto; width: auto; min-width: 30px; appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--text);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='${enc(text)}'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 7px center; background-size: 6px 9px; padding: 0 1.75em 0 0.55em;
      option { background: var(--menu); color: var(--text); } }
    &.s-segmented { .s-input { gap: 1px; } button { flex: 1; background: var(--widget); border: none; color: var(--text); padding: 3px; &:hover { background: var(--widget-hover); } &.s-selected { background: var(--accent); color: var(--ink); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 3px; padding: 3px 0; } .s-input label { display: flex; align-items: center; gap: 6px; cursor: pointer; } }
  }

  /* ── Boolean: widget-colored square checkbox with a text-colored check ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; width: 15px; height: 15px; margin: 0; background: var(--widget); border-radius: var(--r); cursor: pointer; position: static; opacity: 1; outline: none;
      &:hover { background: var(--widget-hover); }
      &:focus-visible { background: var(--widget-focus); }
      &:checked { background: var(--widget) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='${enc(text)}' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
    /* switch/toggle fall back to a checkbox-ish look via the native input above */
    &.s-switch .s-input, &.s-toggle .s-input { gap: 6px; }
  }

  /* ── Color: full-width swatch + hex ── */
  .s-color {
    &.s-picker .s-color-input { gap: 4px;
      input[type="color"] { position: static; flex: 1; min-width: 0; height: 20px; padding: 0; border: none; border-radius: var(--r); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 0 0 auto; width: 45px; background: var(--widget); color: var(--text); border-radius: var(--r); font-family: ui-monospace, monospace; padding: 0 0 0 3px; height: 20px; } }
    &.s-rgba .s-color-input { gap: 4px; input[type="color"] { flex: none; width: 28px; height: 20px; } input[type="text"] { flex: 1; font-family: ui-monospace, monospace; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: 1px solid var(--ink); &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--widget); color: var(--text); border: none; border-radius: var(--r); height: 20px; padding: 0 8px; &:hover { background: var(--widget-hover); } &:active { background: var(--widget-focus); } }
    &.s-secondary button, button.s-secondary { background: var(--widget-secondary); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; background: var(--widget); border: none; border-radius: var(--r); resize: vertical; field-sizing: content; min-height: 40px; max-height: 50vh; padding: 4px 5px; } &.s-code textarea { font-family: ui-monospace, monospace; } }

  /* ── Folder ── */
  .s-folder {
    padding: 0;
    > summary { background: transparent; color: var(--text); font-weight: 600; height: 25px; padding: 0 4px; border-top: 1px solid var(--widget); border-bottom: 1px solid var(--widget);
      &::before { content: ''; width: 1em; height: 1em; margin-right: 2px; flex: none; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; }
      &::after { display: none; } }
    &:not([open]) > summary::before { transform: rotate(-90deg); }
    > summary:focus-visible { outline: none; text-decoration: underline; }
    .s-content { gap: 4px; margin-top: 4px; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--accent); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--ink); opacity: .4; }
}`

  return baseCSS + '\n' + overrides
}
