/**
 * leva — calibrated to pmndrs/leva's default dark theme
 *
 * Custom shades derive missing color roles; explicit role axes take precedence.
 *
 * Axes: shade (elevation2 — panel/rows), accent (slider fill, thumb, checked
 * boxes), title (elevation1 — title bar / slider track / folder rule), and the
 * three text roles muted/ink/dim, which leva keeps as fixed steel-grey
 * signatures decoupled from shade's own hue (measured: shade sits at hue 248,
 * the text ramp at hue 270 — a deliberate mismatch in the reference, not a bug
 * to "fix" by tying them together).
 *
 * Field (elevation3 — input backgrounds) isn't its own axis: it's one
 * lightness+chroma step up from title on leva's elevation ladder, the step
 * measured once off the reference palette (title #292d39 → field #373c4b) and
 * reapplied via CSS relative color so a custom title still yields a coherent,
 * lighter field instead of a stuck literal. Field/accent hover+active states
 * derive the same way, off field/accent — those never appear in the resting
 * panel, so they're free to track whatever shade/accent the caller passes.
 *
 * Signatures: three near-black depth levels (panel #181c20, title bar #292d39,
 * input fields #373c4b), a single #007bff blue accent (slider fill, rounded-rect
 * scrubber thumb, checked boxes), monospace text, and a 10px-rounded panel.
 * Ref: https://leva.pmnd.rs
 *
 * leva(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveAccent, resolveRoles } from './color.js'

const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

export default function leva({
  shade = '#181c20',     // elevation2 — panel / rows
  accent = '#007bff',    // accent2 — slider fill, thumb, checked boxes
  title,     // elevation1 — title bar / slider track / folder rule
  muted,     // highlight2 — labels, input values, select-arrow glyph
  ink,       // highlight3 — folder/button text, checkmark glyph
  dim,       // title-bar text, folder chevron — dimmer than muted,
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const native = shade === '#181c20'
  const roles = resolveRoles(shade, accent)
  title ??= native ? '#292d39' : roles.surface
  muted ??= native ? '#8c92a4' : roles.fg
  ink ??= native ? '#fefefe' : roles.fg
  dim ??= native ? '#535760' : roles.fgMuted
  const onAccent = native ? ink : roles.onAccent

  const acc = resolveAccent(accent, shade)

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {fontSize: 11, fontFamily: "ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace", lineHeight: 15.4, controlHeight: 24, inset: 6, rowGap: 0, columnGap: 8, sectionGap: 8, panelPadding: 0})}

  /* ── Derived tokens ──
     --field: elevation3, one lightness+chroma step above --title (elevation1)
     on leva's own ladder — see header for the measured step.
     --field-hover / --accent-hover / --accent-active: the same lighten-or-
     darken-in-place move, applied to --field / --accent respectively. */
  --bg: ${shade};
  --accent: ${acc};
  --title: ${title};
  --field: oklch(from var(--title) calc(l + 0.0593) calc(c + 0.0044) h);
  --field-hover: oklch(from var(--field) calc(l + 0.0375) calc(c + 0.005) h);
  --accent-hover: oklch(from var(--accent) calc(l + 0.06) max(c - 0.036, 0) h);
  --accent-active: oklch(from var(--accent) calc(l - 0.07) max(c - 0.025, 0) h);
  --muted: ${muted};
  --ink: ${ink};
  --on-accent: ${onAccent};
  --dim: ${dim};
  --content-line: rgb(from var(--muted) r g b / .4);
  --shadow: #00000088;
  --thumb-w: calc(8 * var(--length));
  --thumb-h: calc(16 * var(--length));
  --thumb-r: calc(2 * var(--length));
  --thumb-ring: calc(2 * var(--length));

  --weight: 400;
  --r: calc(3 * var(--length));
  color-scheme: ${roles.dark ? 'dark' : 'light'};

  background: var(--title);
  color: var(--muted);

  width: min(100%, calc(280 * var(--length)));
  min-width: 0;
  max-width: calc(280 * var(--length));
  border-radius: calc(10 * var(--length));
  padding: var(--panel-padding);
  box-shadow: 0 0 9px 0 var(--shadow);
  overflow: hidden;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title bar (elevation1): left collapse triangle, centered title, right filter icon ── */
  > summary, > .s-panel-title {
    background: transparent;
    color: var(--dim);
    font-weight: 400;
    justify-content: center;
    padding: 0 calc(28 * var(--space));
    height: calc(39 * var(--length));
    position: relative;
    &::before { content: ''; position: absolute; left: calc(14 * var(--length)); width: calc(12 * var(--length)); height: calc(8 * var(--length)); background: currentColor; opacity: .65; -webkit-mask: var(--chevron) center / contain no-repeat; mask: var(--chevron) center / contain no-repeat; transition: transform .15s; }
  }
  --chevron: url("data:image/svg+xml,%3Csvg viewBox='0 0 9 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z'/%3E%3C/svg%3E");
  --search: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 9a2 2 0 114 0 2 2 0 01-4 0z'/%3E%3Cpath fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z' clip-rule='evenodd'/%3E%3C/svg%3E");
  &:not([open]) > summary::before { transform: rotate(-90deg); }
  /* Native leva's content wrapper is a distinct box (own bg + own 10px radius on all corners)
     stacked below the title bar rather than inheriting the panel's background — its rounded
     top peeks out from under the bar. Reproduced here the same way: the panel base holds the
     title-bar color, and .s-panel-content paints over it with its own rounded box. Native pads
     the first/last row 6px top/bottom (rows in between rely purely on the 7px grid gap); a
     6px 0 padding on the content box itself gives the same edge rhythm with one declaration. */
  .s-panel-content { gap: var(--row-gap); padding: calc(6 * var(--space)) 0; background: var(--bg); border-radius: calc(10 * var(--length)); }

  /* ── Search: a full-width absolute overlay (out of flex flow entirely, like the chevron,
     so it never unbalances the centered title text regardless of its own content width) —
     the 20×20 magnifier glyph sits inset in the title bar's top-right corner, and opening
     it drops a full-width filter row directly beneath the title bar ── */
  .s-search { pointer-events: none; position: absolute; inset: 0; margin: 0; justify-content: flex-end; align-items: center; padding-right: calc(10 * var(--space)); }
  .s-search-btn { pointer-events: auto; width: calc(20 * var(--length)); height: calc(20 * var(--length)); background: var(--dim); -webkit-mask: var(--search) center / contain no-repeat; mask: var(--search) center / contain no-repeat; }
  .s-search-input { pointer-events: auto; position: absolute; top: calc(39 * var(--length)); left: 0; right: 0; height: calc(30 * var(--length)); padding: 0 calc(10 * var(--space)); background: var(--title); color: var(--ink); font: 10px/1 ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace; z-index: 1; outline: none; &::placeholder { color: var(--muted); } &::-webkit-search-cancel-button { filter: invert(1) opacity(.6); } }
  &.s-searching .s-search-btn { background: var(--ink); }
  &.s-searching .s-panel-content { margin-top: calc(30 * var(--space)); }

  /* ── Row ── */
  .s-control { gap: var(--column-gap); padding: 0 calc(10 * var(--space)); min-height: var(--control-height); align-items: center; margin-bottom: calc(7 * var(--space)); }
  /* Native leva dims the whole row (label + control) to 60% for a disabled input, not just
     the control side — the label stays legible but visibly inert alongside its field. */
  .s-control:has(.s-input[inert]) { opacity: .6; }
  .s-input[inert] { opacity: 1; }
  .s-label-group { width: 36%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--muted); font-weight: 400; }
  .s-hint { color: var(--muted); opacity: .7; font-size: calc(10 * var(--length)); }
  .s-input { gap: calc(6 * var(--space)); align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--muted); border: none; border-radius: var(--r);
    height: var(--control-height); padding: 0 calc(6 * var(--space)); font: inherit; transition: background-color .1s;
    &::placeholder { color: var(--muted); }
    &:hover { background: var(--field-hover); }
    &:focus { background: var(--field-hover); outline: 1px solid var(--accent); outline-offset: -1px; }
  }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Vector: native insets a small faded uppercase glyph flush inside the field's left
     edge rather than labeling outside it — the axis wrapper (not the input) carries the
     field's background/radius, so label and value visually share one box. */
  .s-vector {
    .s-vec-axis { background: var(--field); border-radius: var(--r); gap: 0; transition: background-color .1s; &:hover, &:focus-within { background: var(--field-hover); } &:focus-within { outline: 1px solid var(--accent); outline-offset: -1px; } }
    .s-vec-label { flex: none; opacity: .3; font-size: calc(8.8 * var(--length)); text-transform: uppercase; padding: 0 calc(3 * var(--space)); justify-content: center; }
    input[type="number"] { background: transparent; padding: 0 calc(6 * var(--space)) 0 0; &:hover, &:focus { background: transparent; outline: none; } }
  }

  /* ── Slider: 2px track, blue fill, 8×16 rounded-rect thumb ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(12 * var(--space)); }
    .s-track { height: var(--control-height); margin: 0; }
    input[type="range"] {
      width: 100%; height: calc(16 * var(--length)); -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
      background-image: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--title) var(--p, 0%));
      background-size: 100% calc(2 * var(--length)); background-position: center; background-repeat: no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb-w); height: var(--thumb-h); border-radius: var(--thumb-r); background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); cursor: ew-resize; }
      &::-moz-range-thumb { width: var(--thumb-w); height: var(--thumb-h); border-radius: var(--thumb-r); border: none; background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); cursor: ew-resize; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: calc(10 * var(--length)); color: var(--muted); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: calc(38 * var(--length)); min-width: calc(38 * var(--length)); text-align: right; background: var(--field); color: var(--muted); border: none; border-radius: var(--r); height: var(--control-height); padding: 0 calc(6 * var(--space)); font-variant-numeric: tabular-nums; transition: background-color .1s; &:hover { background: var(--field-hover); } &:focus { background: var(--field-hover); outline: 1px solid var(--accent); outline-offset: -1px; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--field); color: var(--muted); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(2 * var(--length)); margin: calc(10 * var(--space)) 0; background: var(--title); position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type="range"] { background-image: none; top: 50%; height: calc(16 * var(--length)); transform: translateY(-50%); }
      input[type="range"]::-webkit-slider-thumb { width: var(--thumb-w); height: var(--thumb-h); background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); }
      input[type="range"]::-moz-range-thumb { width: var(--thumb-w); height: var(--thumb-h); background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); }
      /* Native leva insets each handle from its own value point by a fixed 6px push (so two
         independently-rounded pill thumbs never fuse into one blob when values sit close together);
         the two native range inputs here span the full track and can't take that per-thumb inline
         offset, so a fixed opposing translateX of the same magnitude reproduces the same seam. */
      .s-interval-lo::-webkit-slider-thumb { border-radius: var(--thumb-r) 0 0 var(--thumb-r); transform: translateX(-6px); }
      .s-interval-lo::-moz-range-thumb { border-radius: var(--thumb-r) 0 0 var(--thumb-r); transform: translateX(-6px); }
      .s-interval-hi::-webkit-slider-thumb { border-radius: 0 var(--thumb-r) var(--thumb-r) 0; transform: translateX(6px); }
      .s-interval-hi::-moz-range-thumb { border-radius: 0 var(--thumb-r) var(--thumb-r) 0; transform: translateX(6px); } }
    &.s-multiple .s-readout-lo { order: 2; }
    &.s-multiple .s-interval-track { order: 1; }
    &.s-multiple .s-readout-hi { order: 3; }
  }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--muted);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 9 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z' fill='${enc(muted)}'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; background-size: calc(9 * var(--length)) calc(5 * var(--length)); padding-right: calc(22 * var(--space));
      option { background: var(--field); color: var(--muted); } }
    &.s-segmented { .s-input { gap: calc(2 * var(--length)); } button { flex: 1; background: var(--field); border: none; color: var(--ink); border-radius: var(--r); padding: calc(4 * var(--space)); font: inherit; transition: background-color .1s; &:hover { background: var(--field-hover); } &.s-selected { background: var(--accent); color: var(--on-accent); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(4 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(7 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean: 16px square, blue when checked ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: calc(16 * var(--length)); height: calc(16 * var(--length)); margin: 0; border-radius: var(--r); background: var(--field); cursor: pointer; transition: background-color .1s;
      &:hover { background: var(--field-hover); }
      &:checked { background: var(--accent) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='${enc(onAccent)}' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(6 * var(--space));
      input[type="color"] { position: static; width: calc(24 * var(--length)); height: var(--control-height); padding: 0; border: none; border-radius: var(--r); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 1; min-width: 0; } }
    &.s-rgba .s-color-input { gap: calc(6 * var(--space)); input[type="color"] { width: calc(24 * var(--length)); height: var(--control-height); } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: var(--r); border: none; &.s-selected { outline: 2px solid var(--accent); } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--accent); color: var(--on-accent); border: none; border-radius: var(--r); height: var(--control-height); font-weight: 400; transition: background-color .1s; &:hover { background: var(--accent-hover); } &:active { background: var(--accent-active); color: var(--on-accent); } }
    &.s-secondary button, button.s-secondary { background: var(--title); color: var(--ink); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(44 * var(--length)); max-height: 50vh; padding: calc(5 * var(--space)) calc(7 * var(--space)); } }

  /* ── Folder: chevron + indented left rule ── */
  .s-folder {
    padding: calc(7 * var(--space)) calc(10 * var(--space)) 0;
    border-top: 1px solid var(--title);
    &[open] { min-height: calc(82 * var(--length)); }
    > summary { color: var(--ink); font-weight: 400; min-height: calc(20 * var(--length)); padding: 0; border-top: 0; position: relative; gap: calc(7 * var(--space));
      /* Native offsets the chevron glyph with equal-and-opposite margins (-4px/+4px on its own
         9px-wide icon) so its visual center lands exactly on the indent rule below (the rule sits
         flush at the row's left edge) without shifting the label text that follows in flex flow.
         Same trick here, scaled to our 7.2px glyph: margin = 0.5px (half the rule's 1px width) minus
         half the glyph width, mirrored on the other side to leave the label's position untouched. */
      &::before { content: ''; width: calc(7.2 * var(--length)); height: calc(4 * var(--length)); margin: 0 calc(3.1 * var(--space)) 0 calc(-3.1 * var(--length)); background: var(--dim); opacity: .65; -webkit-mask: var(--chevron) center / contain no-repeat; mask: var(--chevron) center / contain no-repeat; transform: rotate(-90deg); transition: transform .15s; }
      &::after { display: none; } }
    &[open] > summary::before { transform: rotate(0deg); }
    .s-content { gap: calc(7 * var(--space)); padding-left: calc(9 * var(--space)); border-left: 1px solid var(--content-line); }
    .s-content .s-control { width: calc(250 * var(--length)); min-height: var(--control-height); padding: 0; margin-bottom: 0; }
    .s-content .s-label-group { width: calc(83 * var(--length)); }
    .s-content .s-input { gap: calc(6 * var(--space)); }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--muted); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--title); opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
