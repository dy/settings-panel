/**
 * dat — calibrated to dat.gui / lil-gui
 *
 * Custom shades derive missing color roles; explicit role axes take precedence.
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

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveAccent, resolveRoles } from './color.js'

export default function dat({
  shade = '#1f1f1f',
  accent = '#2cc9ff',
  title,
  widget,
  text,
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const native = shade === '#1f1f1f'
  const roles = resolveRoles(shade)
  title ??= native ? '#111111' : roles.surface
  widget ??= native ? '#424242' : roles.surface2
  text ??= native ? '#ebebeb' : roles.fg

  const acc = resolveAccent(accent, shade)
  const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {fontSize: 11, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif", lineHeight: 15.95, controlHeight: 20, inset: 4, rowGap: 4, columnGap: 0, sectionGap: 4, panelPadding: 0})}

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
  --string: ${roles.dark ? '#a2db3c' : text};
  --ink: #000;

  --weight: 400;
  --r: calc(2 * var(--length));
  color-scheme: ${roles.dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--text);

  width: calc(245 * var(--length));
  min-width: 0;
  max-width: calc(245 * var(--length));
  border-radius: 0;
  padding: var(--panel-padding);

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title bar (left-prefixed disclosure triangle, lil-gui style) ── */
  > summary, > .s-panel-title {
    background: var(--title);
    color: var(--text);
    font-weight: 600;
    font-size: calc(11 * var(--length));
    padding: 0 calc(4 * var(--space));
    min-height: calc(25 * var(--length));
    line-height: 1;
    &::before { content: ''; width: 1em; height: 1em; margin-right: calc(2 * var(--length)); flex-shrink: 0; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; }
  }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 11 11' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='0.5,4 4,7.5 7.5,4' fill='none' stroke='%23fff' stroke-width='1.8'/%3E%3C/svg%3E");
  &:not([open]) > summary::before { transform: rotate(-90deg); }
  > summary:focus-visible { outline: none; text-decoration: underline; }
  .s-panel-content { gap: var(--row-gap); padding: calc(4 * var(--space)) 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(4 * var(--space)); }

  /* ── Row (lil-gui metrics: 20px tall, 4px side padding, 4px gaps, no border, 45% name) ── */
  .s-control {
    gap: var(--column-gap);
    padding: 0 calc(4 * var(--space));
    min-height: var(--control-height);
    align-items: center;
    /* Disabled: dim the whole row (lil-gui .controller.disabled), not just the widget — .s-input[inert] is the only disabled hook base.js exposes */
    &:has(> .s-input[inert]) .s-label-group { opacity: .5; }
  }
  .s-label-group { flex: 0 0 auto; width: auto; min-width: 45%; max-width: none; padding: 0; line-height: 20px; overflow: visible; }
  .s-label { color: var(--text); font-weight: 400; white-space: nowrap; overflow: visible; }
  .s-hint { color: var(--hint); font-size: calc(10 * var(--length)); }
  .s-input { flex: 1 1 auto; min-width: 0; gap: calc(4 * var(--space)); align-items: center; }

  /* ── Widgets (inputs / select) ── */
  input[type="text"], input[type="number"], select {
    background: var(--widget);
    color: var(--accent);
    border: none;
    border-radius: var(--r);
    height: var(--control-height);
    padding: 0 0 0 calc(3 * var(--space));
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
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(14 * var(--space)); }
    .s-track { height: var(--control-height); margin: 0; }
    input[type="range"] {
      width: 100%; height: var(--control-height); -webkit-appearance: none; appearance: none; cursor: ew-resize;
      border-radius: var(--r);
      background: var(--widget);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(2 * var(--length)); height: var(--control-height); background: var(--accent); cursor: ew-resize; }
      &::-moz-range-thumb { width: calc(2 * var(--length)); height: var(--control-height); border: none; border-radius: 0; background: var(--accent); cursor: ew-resize; }
      &:hover { background: var(--widget-hover); }
    }
    .s-marks { display: none; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: calc(10 * var(--length)); color: var(--hint); white-space: nowrap; }
    .s-readout {
      flex: 0 0 auto; width: 27%; min-width: calc(45 * var(--length)); text-align: left;
      background: var(--widget); color: var(--accent); border: none; border-radius: var(--r);
      height: var(--control-height); padding: 0 0 0 calc(3 * var(--space)); font-variant-numeric: tabular-nums;
      &:hover { background: var(--widget-hover); } &:focus { background: var(--widget-focus); outline: none; }
    }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--ink); color: var(--accent); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: calc(2 * var(--length)); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: var(--control-height); margin: calc(3 * var(--space)) 0; border-radius: var(--r); background: var(--widget); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select / dropdown ── */
  .s-select {
    &.s-dropdown .s-input { justify-content: flex-start; }
    &.s-dropdown select { flex: 0 0 auto; width: auto; min-width: calc(30 * var(--length)); appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--text);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 8 12' xmlns='http://www.w3.org/2000/svg' fill='${enc(text)}'%3E%3Cpath d='M0 5 L4 1 L8 5Z'/%3E%3Cpath d='M0 7 L4 11 L8 7Z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 7px center; background-size: calc(6 * var(--length)) calc(9 * var(--length)); padding: 0 1.75em 0 0.55em;
      option { background: var(--menu); color: var(--text); } }
    &.s-segmented { .s-input { gap: calc(1 * var(--length)); } button { flex: 1; background: var(--widget); border: none; color: var(--text); padding: calc(3 * var(--space)); &:hover { background: var(--widget-hover); } &.s-selected { background: var(--accent); color: var(--ink); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(3 * var(--space)); padding: calc(3 * var(--space)) 0; } .s-input label { display: flex; align-items: center; gap: calc(6 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean: widget-colored square checkbox with a text-colored check ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; width: calc(15 * var(--length)); height: calc(15 * var(--length)); margin: 0; background: var(--widget); border-radius: var(--r); cursor: pointer; position: static; opacity: 1; outline: none;
      &:hover { background: var(--widget-hover); }
      &:focus-visible { background: var(--widget-focus); }
      &:checked { background: var(--widget) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='${enc(text)}' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
    /* switch/toggle fall back to a checkbox-ish look via the native input above */
    &.s-switch .s-input, &.s-toggle .s-input { gap: calc(6 * var(--space)); }
  }

  /* ── Color: full-width swatch + hex ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(4 * var(--space));
      input[type="color"] { position: static; flex: 1; min-width: 0; height: var(--control-height); padding: 0; border: none; border-radius: var(--r); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 0 0 auto; width: calc(45 * var(--length)); background: var(--widget); color: var(--text); border-radius: var(--r); font-family: ui-monospace, monospace; padding: 0 0 0 calc(3 * var(--space)); height: var(--control-height); } }
    &.s-rgba .s-color-input { gap: calc(4 * var(--space)); input[type="color"] { flex: none; width: calc(28 * var(--length)); height: var(--control-height); } input[type="text"] { flex: 1; font-family: ui-monospace, monospace; } }
    &.s-swatches button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: var(--r); border: 1px solid var(--ink); &.s-selected { outline: 1px solid var(--accent); } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--widget); color: var(--text); border: none; border-radius: var(--r); height: var(--control-height); padding: 0 calc(8 * var(--space)); &:hover { background: var(--widget-hover); } &:active { background: var(--widget-focus); } }
    &.s-secondary button, button.s-secondary { background: var(--widget-secondary); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; background: var(--widget); border: none; border-radius: var(--r); resize: vertical; field-sizing: content; min-height: calc(40 * var(--length)); max-height: 50vh; padding: calc(4 * var(--space)) calc(5 * var(--space)); } &.s-code textarea { font-family: ui-monospace, monospace; } }

  /* ── Folder ── */
  .s-folder {
    padding: 0;
    > summary { background: transparent; color: var(--text); font-weight: 600; height: calc(25 * var(--length)); padding: 0 calc(4 * var(--space)); border-top: 1px solid var(--widget); border-bottom: 1px solid var(--widget);
      &::before { content: ''; width: 1em; height: 1em; margin-right: calc(2 * var(--length)); flex: none; background: currentColor; -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .1s; }
      &::after { display: none; } }
    &:not([open]) > summary::before { transform: rotate(-90deg); }
    > summary:focus-visible { outline: none; text-decoration: underline; }
    .s-content { gap: calc(4 * var(--space)); margin-top: calc(4 * var(--space)); }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--accent); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--ink); opacity: .4; }
}`

  return baseCSS + '\n' + overrides
}
