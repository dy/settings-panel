/**
 * leva — calibrated to pmndrs/leva's default dark theme
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

import baseCSS from './base.js'
import { resolveAccent } from './color.js'

const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

export default function leva({
  shade = '#181c20',     // elevation2 — panel / rows
  accent = '#007bff',    // accent2 — slider fill, thumb, checked boxes
  title = '#292d39',     // elevation1 — title bar / slider track / folder rule
  muted = '#8c92a4',     // highlight2 — labels, input values, select-arrow glyph
  ink = '#fefefe',       // highlight3 — folder/button text, checkmark glyph
  dim = '#535760',       // title-bar text, folder chevron — dimmer than muted
} = {}) {
  const acc = resolveAccent(accent, shade)

  const overrides = `.s-panel {
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
  --dim: ${dim};
  --content-line: rgb(from var(--muted) r g b / .4);
  --shadow: #00000088;
  --thumb-w: 8px;
  --thumb-h: 16px;
  --thumb-r: 2px;
  --thumb-ring: 2px;
  --u: 4px;
  --spacing: 1;
  --weight: 400;
  --r: 3px;
  color-scheme: dark;

  background: var(--title);
  color: var(--muted);
  font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace;
  width: min(100%, 280px);
  min-width: 0;
  max-width: 280px;
  border-radius: 10px;
  padding: 0;
  box-shadow: 0 0 9px 0 var(--shadow);
  overflow: hidden;

  /* ── Title bar (elevation1): left collapse triangle, centered title, right filter icon ── */
  > summary, > .s-panel-title {
    background: transparent;
    color: var(--dim);
    font-weight: 400;
    justify-content: center;
    padding: 0 28px;
    height: 39px;
    position: relative;
    &::before { content: ''; position: absolute; left: 14px; width: 12px; height: 8px; background: currentColor; opacity: .65; -webkit-mask: var(--chevron) center / contain no-repeat; mask: var(--chevron) center / contain no-repeat; transition: transform .15s; }
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
  .s-panel-content { gap: 0; padding: 6px 0; background: var(--bg); border-radius: 10px; }

  /* ── Search: a full-width absolute overlay (out of flex flow entirely, like the chevron,
     so it never unbalances the centered title text regardless of its own content width) —
     the 20×20 magnifier glyph sits inset in the title bar's top-right corner, and opening
     it drops a full-width filter row directly beneath the title bar ── */
  .s-search { pointer-events: none; position: absolute; inset: 0; margin: 0; justify-content: flex-end; align-items: center; padding-right: 10px; }
  .s-search-btn { pointer-events: auto; width: 20px; height: 20px; background: var(--dim); -webkit-mask: var(--search) center / contain no-repeat; mask: var(--search) center / contain no-repeat; }
  .s-search-input { pointer-events: auto; position: absolute; top: 39px; left: 0; right: 0; height: 30px; padding: 0 10px; background: var(--title); color: var(--ink); font: 10px/1 ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace; z-index: 1; outline: none; &::placeholder { color: var(--muted); } &::-webkit-search-cancel-button { filter: invert(1) opacity(.6); } }
  &.s-searching .s-search-btn { background: var(--ink); }
  &.s-searching .s-panel-content { margin-top: 30px; }

  /* ── Row ── */
  .s-control { gap: 6px; padding: 0 10px; min-height: 24px; align-items: center; margin-bottom: 7px; }
  /* Native leva dims the whole row (label + control) to 60% for a disabled input, not just
     the control side — the label stays legible but visibly inert alongside its field. */
  .s-control:has(.s-input[inert]) { opacity: .6; }
  .s-input[inert] { opacity: 1; }
  .s-label-group { width: 36%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--muted); font-weight: 400; }
  .s-hint { color: var(--muted); opacity: .7; font-size: 10px; }
  .s-input { gap: 6px; align-items: center; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--muted); border: none; border-radius: var(--r);
    height: 24px; padding: 0 6px; font: inherit; transition: background-color .1s;
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
    .s-vec-label { flex: none; opacity: .3; font-size: 8.8px; text-transform: uppercase; padding: 0 3px; justify-content: center; }
    input[type="number"] { background: transparent; padding: 0 6px 0 0; &:hover, &:focus { background: transparent; outline: none; } }
  }

  /* ── Slider: 2px track, blue fill, 8×16 rounded-rect thumb ── */
  .s-slider {
    align-items: center;
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: 12px; }
    .s-track { height: 24px; margin: 0; }
    input[type="range"] {
      width: 100%; height: 16px; -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
      background-image: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--title) var(--p, 0%));
      background-size: 100% 2px; background-position: center; background-repeat: no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb-w); height: var(--thumb-h); border-radius: var(--thumb-r); background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); cursor: ew-resize; }
      &::-moz-range-thumb { width: var(--thumb-w); height: var(--thumb-h); border-radius: var(--thumb-r); border: none; background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); cursor: ew-resize; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 2px); font-size: 10px; color: var(--muted); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: 38px; min-width: 38px; text-align: right; background: var(--field); color: var(--muted); border: none; border-radius: var(--r); height: 24px; padding: 0 6px; font-variant-numeric: tabular-nums; transition: background-color .1s; &:hover { background: var(--field-hover); } &:focus { background: var(--field-hover); outline: 1px solid var(--accent); outline-offset: -1px; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px; background: var(--field); color: var(--muted); padding: 1px 5px; border-radius: var(--r); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: 2px; margin: 10px 0; background: var(--title); position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type="range"] { background-image: none; top: 50%; height: 16px; transform: translateY(-50%); }
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
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 9 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z' fill='${enc(muted)}'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; background-size: 9px 5px; padding-right: 22px;
      option { background: var(--field); color: var(--muted); } }
    &.s-segmented { .s-input { gap: 2px; } button { flex: 1; background: var(--field); border: none; color: var(--ink); border-radius: var(--r); padding: 4px; font: inherit; transition: background-color .1s; &:hover { background: var(--field-hover); } &.s-selected { background: var(--accent); color: var(--ink); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: 4px; } .s-input label { display: flex; align-items: center; gap: 7px; cursor: pointer; } }
  }

  /* ── Boolean: 16px square, blue when checked ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { -webkit-appearance: none; appearance: none; position: static; opacity: 1; width: 16px; height: 16px; margin: 0; border-radius: var(--r); background: var(--field); cursor: pointer; transition: background-color .1s;
      &:hover { background: var(--field-hover); }
      &:checked { background: var(--accent) url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='${enc(ink)}' stroke-width='2'/%3E%3C/svg%3E") center / 11px no-repeat; } }
    .s-track { display: none; }
  }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input { gap: 6px;
      input[type="color"] { position: static; width: 24px; height: 24px; padding: 0; border: none; border-radius: var(--r); cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      input[type="text"] { flex: 1; min-width: 0; } }
    &.s-rgba .s-color-input { gap: 6px; input[type="color"] { width: 24px; height: 24px; } input[type="text"] { flex: 1; } }
    &.s-swatches button { width: 18px; height: 18px; border-radius: var(--r); border: none; &.s-selected { outline: 2px solid var(--accent); } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--accent); color: var(--ink); border: none; border-radius: var(--r); height: 24px; font-weight: 400; transition: background-color .1s; &:hover { background: var(--accent-hover); } &:active { background: var(--accent-active); color: var(--ink); } }
    &.s-secondary button, button.s-secondary { background: var(--title); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: 44px; max-height: 50vh; padding: 5px 7px; } }

  /* ── Folder: chevron + indented left rule ── */
  .s-folder {
    padding: 7px 10px 0;
    border-top: 1px solid var(--title);
    &[open] { min-height: 82px; }
    > summary { color: var(--ink); font-weight: 400; min-height: 20px; padding: 0; border-top: 0; position: relative; gap: 7px;
      /* Native offsets the chevron glyph with equal-and-opposite margins (-4px/+4px on its own
         9px-wide icon) so its visual center lands exactly on the indent rule below (the rule sits
         flush at the row's left edge) without shifting the label text that follows in flex flow.
         Same trick here, scaled to our 7.2px glyph: margin = 0.5px (half the rule's 1px width) minus
         half the glyph width, mirrored on the other side to leave the label's position untouched. */
      &::before { content: ''; width: 7.2px; height: 4px; margin: 0 3.1px 0 -3.1px; background: var(--dim); opacity: .65; -webkit-mask: var(--chevron) center / contain no-repeat; mask: var(--chevron) center / contain no-repeat; transform: rotate(-90deg); transition: transform .15s; }
      &::after { display: none; } }
    &[open] > summary::before { transform: rotate(0deg); }
    .s-content { gap: 7px; padding-left: 9px; border-left: 1px solid var(--content-line); }
    .s-content .s-control { width: 250px; min-height: 24px; padding: 0; margin-bottom: 0; }
    .s-content .s-label-group { width: 83px; }
    .s-content .s-input { gap: 6px; }
  }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--muted); font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--title); opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
