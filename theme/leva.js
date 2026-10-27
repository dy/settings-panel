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
 * lighter field instead of a stuck literal. leva's two accent neighbours derive
 * the same way off accent: accent1 (#0066dc: field/checkbox hover ring, pressed
 * fills) and accent3 (#3c93ff: thumb hover, button hover ring); the oklch steps
 * reproduce both literals exactly at the default accent.
 *
 * Signatures: three near-black depth levels (panel #181c20, title bar #292d39,
 * input fields #373c4b), a single #007bff blue accent (slider fill, rounded-rect
 * scrubber thumb, checked boxes), monospace text, a 10px-rounded panel, a fixed
 * 160px control column, and hover shown as a 1px inset accent ring, never a fill.
 * Ref: https://leva.pmnd.rs (values read off the leva@0.9.35 stylesheet)
 *
 * leva(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveAccent, resolveRoles, parseColor, toHex, ink as legible, mix } from './color.js'

const enc = c => encodeURIComponent(c)   // any CSS color, safe inside an SVG data-URI

export default function leva({
  shade = '#181c20',     // elevation2 — panel / rows
  accent = '#007bff',    // accent2 — slider fill, thumb, checked boxes
  title,     // elevation1 — title bar / slider track / folder rule
  muted,     // highlight2: labels, input values, select-arrow glyph, folder widget
  ink,       // highlight3 — folder/button text, checkmark glyph
  dim,       // highlight1: title-bar text and icons, dimmer than muted
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const native = shade === '#181c20'
  const roles = resolveRoles(shade, accent)
  title ??= native ? '#292d39' : roles.surface
  muted ??= native ? '#8c92a4' : roles.fg
  ink ??= native ? '#fefefe' : roles.fg
  dim ??= legible(title, 4.5, native ? '#535760' : roles.fgMuted)   // leva #535760, 1.9:1 on the title bar
  const onAccent = native ? ink : roles.onAccent

  const acc = resolveAccent(accent, shade)
  // Text at 4.5:1 where leva's own falls short (WCAG 1.4.3), each tone lifted only as far as it must:
  // values on fields (#8c92a4 on #373c4b, 3.5:1), hints (muted at 70%, 3.4:1), a labeled separator's
  // label (muted at 60% on its title-colored band, 2.5:1), and the fill behind lettering on the
  // accent (#fefefe on #007bff, 3.9:1)
  const field = parseColor(title)
  const fieldInk = legible(toHex({ L: field.L + (roles.dark ? .0593 : -.0593), C: field.C + .0044, H: field.H }), 4.5, muted)
  const hint = legible(shade, 4.5, mix(shade, muted, .7))
  const sepLabel = legible(title, 4.5, mix(title, muted, .6))
  const action = legible(onAccent, 4.5, acc)
  // and the search placeholder, muted on the title-coloured search bar (4.4:1)
  const searchInk = legible(title, 4.5, muted)

  // Body 11px: Leva sets its labels and values in an 11px monospace.
  const body = 11
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 11, fontFamily: "ui-monospace, SFMono-Regular, Menlo, 'Roboto Mono', monospace", lineHeight: 15.4, controlHeight: 24, inset: 6, rowGap: 7, columnGap: 7, sectionGap: 10, panelPadding: 0})}

  /* ── Derived tokens ──
     --field: elevation3, one lightness+chroma step past --title (elevation1) on leva's
     ladder, continuing away from the panel shade (lighter on dark panels, darker on light
     ones, as resolveRoles lifts surfaces), so light colormaps keep visible fields; see
     header for the measured step.
     --accent1 / --accent3: leva's darker and lighter accent neighbours, the
     measured oklch steps off accent2 (#007bff → #0066dc / #3c93ff). */
  --bg: ${shade};
  --accent: ${acc};
  --title: ${title};
  --field: oklch(from var(--title) calc(l ${roles.dark ? '+' : '-'} 0.0593) calc(c + 0.0044) h);
  --accent1: oklch(from var(--accent) calc(l - 0.0705) max(c - 0.0191, 0) calc(h + 0.75));
  --accent3: oklch(from var(--accent) calc(l + 0.0602) max(c - 0.0362, 0) calc(h - 1.49));
  --muted: ${muted};
  --ink: ${ink};
  --on-accent: ${onAccent};
  --field-ink: ${fieldInk};
  --action: ${action};
  --dim: ${dim};
  --shadow: #00000088;
  --control-width: calc(160 * var(--length));
  --hairline: calc(1 * var(--length));   /* leva borderWidths: hover, focus, active, folder */
  --thumb-w: calc(8 * var(--length));
  --thumb-h: calc(16 * var(--length));
  --thumb-r: calc(2 * var(--length));
  --thumb-ring: calc(2 * var(--length));

  --weight: 400;
  --r: calc(3 * var(--length));
  color-scheme: ${roles.dark ? 'dark' : 'light'};

  background: var(--title);
  color: var(--muted);

  /* A definite 280px (leva's rootWidth) capped by the host, so a shrink-to-fit host still
     gets the full panel instead of the rows' content width. */
  width: calc(280 * var(--length));
  min-width: 0;
  max-width: 100%;
  border-radius: calc(10 * var(--length));
  padding: var(--panel-padding);
  box-shadow: 0 0 calc(9 * var(--length)) 0 var(--shadow);
  overflow: hidden;

  /* leva never sets a line-height: every text line box is the font's own "normal" (13px
     for SF Mono at 11px), which is what lands glyphs on native's pixel rows once centered. */
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: normal;

  /* ── Title bar (elevation1): three zones as native lays them out, a 40px collapse-chevron
     box, the centered title, a 40px filter box. Each rests at highlight1 and lights up to
     highlight3 only while its own zone is hovered. ── */
  > summary, > .s-panel-title {
    background: transparent;
    color: var(--dim);
    font-weight: 400;
    justify-content: center;
    padding: 0 calc(40 * var(--length));
    height: calc(39 * var(--length));
    position: relative;
  }
  > summary:hover:not(:has(.s-fold-icon:hover, .s-search:hover)) { color: var(--ink); }
  /* Native draws the 9×5 chevron into a 12×8 svg (meet, so centered 0.67px down). The mask
     frames the same path in a 9×6 viewBox so the tile fills the box and the centering
     happens inside the vector, never as a fractional tile offset. */
  .s-fold-icon { position: absolute; left: 0; top: 0; width: calc(40 * var(--length)); height: 100%; display: flex; align-items: center; justify-content: center;
    i { width: calc(12 * var(--length)); height: calc(8 * var(--length)); background: var(--dim); -webkit-mask: var(--chevron-bar) 0 0 / 100% 100% no-repeat; mask: var(--chevron-bar) 0 0 / 100% 100% no-repeat; transition: transform .35s, background-color .25s; }
    &:hover i { background: var(--ink); } }
  /* An icon whose state is engaged (panel collapsed, filter shown) rests at highlight2;
     hover still lights it to highlight3. */
  &:not([open]) > summary .s-fold-icon i { transform: rotate(-90deg); }
  &:not([open]) > summary .s-fold-icon:not(:hover) i { background: var(--muted); }
  ::selection { background: var(--accent); }
  --chevron: url("data:image/svg+xml,%3Csvg viewBox='0 0 9 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z'/%3E%3C/svg%3E");
  --chevron-bar: url("data:image/svg+xml,%3Csvg viewBox='0 -.5 9 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z'/%3E%3C/svg%3E");
  --clear: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'/%3E%3C/svg%3E");
  --search: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 9a2 2 0 114 0 2 2 0 01-4 0z'/%3E%3Cpath fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z' clip-rule='evenodd'/%3E%3C/svg%3E");
  /* Native leva's content wrapper is a distinct box (own bg + own 10px radius on all corners)
     stacked below the title bar rather than inheriting the panel's background — its rounded
     top peeks out from under the bar. Reproduced here the same way: the panel base holds the
     title-bar color, and .s-panel-content paints over it with its own rounded box. Native pads
     the first row's top and the last row's bottom 6px and spaces rows with a 7px grid gap. */
  .s-panel-content { gap: var(--row-gap); padding: calc(6 * var(--space)) 0; background: var(--bg); border-radius: calc(10 * var(--length)); }

  /* ── Search: a full-width absolute overlay (out of flex flow entirely, like the chevron,
     so it never unbalances the centered title text regardless of its own content width) —
     the 20×20 magnifier glyph centered in native's 40px right-hand icon box, and opening
     it drops a full-width 30px filter row directly beneath the title bar; native text sits
     12px in (10px row padding + the input's own 2px). ── */
  .s-search { pointer-events: none; position: absolute; inset: 0; margin: 0; justify-content: flex-end; align-items: center; }
  .s-search-btn { pointer-events: auto; width: calc(40 * var(--length)); height: calc(39 * var(--length)); background: var(--dim); -webkit-mask: var(--search) center / calc(20 * var(--length)) no-repeat; mask: var(--search) center / calc(20 * var(--length)) no-repeat; transition: background-color .25s; &:hover { background: var(--ink); } }
  /* The clear control is native's 14px circled x (highlight1, highlight3 on hover), centered
     in the same 40px right-hand box as the magnifier above it. */
  .s-search-input { pointer-events: auto; position: absolute; top: calc(39 * var(--length)); left: 0; right: 0; height: calc(30 * var(--length)); padding: 0 calc(13 * var(--length)) 0 calc(12 * var(--space)); background: var(--title); color: var(--ink); font: calc(10 * var(--length))/1 var(--font-family); z-index: 1; outline: none; &::placeholder { color: ${searchInk}; }
    &::-webkit-search-cancel-button { -webkit-appearance: none; width: calc(14 * var(--length)); height: calc(14 * var(--length)); margin: 0; background: var(--dim); -webkit-mask: var(--clear) center / contain no-repeat; mask: var(--clear) center / contain no-repeat; cursor: pointer; }
    &::-webkit-search-cancel-button:hover { background: var(--ink); } }
  &.s-searching .s-search-btn:not(:hover) { background: var(--muted); }
  &.s-searching .s-panel-content { margin-top: calc(30 * var(--space)); }

  /* ── Row: label takes whatever the fixed 160px control column leaves ── */
  .s-control { gap: var(--column-gap); padding: 0 calc(10 * var(--space)); min-height: var(--control-height); align-items: center; }
  /* Native leva dims the whole row (label + control) to 60% for a disabled input, not just
     the control side — the label stays legible but visibly inert alongside its field. */
  .s-control:has(.s-input[inert]) { opacity: .6; }
  .s-input[inert] { opacity: 1; }
  .s-label-group { flex: 1 1 0; width: auto; min-width: 0; max-width: none; padding: 0; line-height: normal; }
  .s-label-group:not([hidden]) + .s-input { flex: 0 1 var(--control-width); }
  .s-label { color: var(--muted); font-weight: 400; }
  .s-label-group .s-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .s-hint { color: ${hint}; opacity: 1; }
  /* secondary text, one step under the body (the in-field axis glyphs keep native's .8em) */
  :is(.s-hint, .s-mark-label, .s-separator-label, .s-tooltip, .s-title-text, .s-knob-val, .s-pad-val) { font-size: calc(10 * var(--length)); }
  /* a hint grows the label downward; the label itself stays centred on its control's 24px line */
  .s-control:has(> .s-label-group .s-hint) { align-items: flex-start; > .s-label-group { padding-top: calc((var(--control-height) - 1lh) / 2); } }
  .s-input { gap: var(--column-gap); align-items: center; }

  /* ── Fields: hover draws a 1px inset accent1 ring, focus a 1px outer accent ring. Native
     rings the field's wrapper, so hovering the row's <label> (which lends :hover/:active to
     its control) shows nothing; ":where(:hover) > &:hover" keeps the same physical-pointer
     rule here, since a label never lends its state to the control's parent. ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--field-ink); border: none; border-radius: var(--r);
    height: var(--control-height); padding: 0 calc(6 * var(--space)); font: inherit; outline: none;
    &::placeholder { color: var(--field-ink); }
    :where(:hover) > &:hover { box-shadow: inset 0 0 0 var(--hairline) var(--accent1); }
    &:focus { box-shadow: 0 0 0 var(--hairline) var(--accent); }
  }
  input[type="number"] { -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  .s-text input[type="text"] { flex: 1; }

  /* ── Number: native frames a plain number as one field holding a faded uppercase "v"
     (value) scrub glyph, flush left, overlapping the input's own 3px of left inset ── */
  .s-number {
    .s-input { height: var(--control-height); background: var(--field); border-radius: var(--r); gap: 0;
      &::before { content: 'v'; align-self: stretch; display: flex; align-items: center; padding: 0 calc(3 * var(--space)); margin-right: calc(-3 * var(--space)); font-size: .8em; text-transform: uppercase; opacity: .3; cursor: ew-resize; }
      /* the glyph lights up under the pointer: hovering the field but not its input is the glyph */
      &:hover:not(:has(input:hover))::before { opacity: 1; }
      &:hover { box-shadow: inset 0 0 0 var(--hairline) var(--accent1); }
      &:focus-within { box-shadow: 0 0 0 var(--hairline) var(--accent); } }
    input[type="number"] { flex: 1; background: transparent; padding: 0 calc(6 * var(--space)) 0 0; text-align: right; &:hover, &:focus { box-shadow: none; } }
    .s-step { display: none; }
  }

  /* ── Vector: native insets a small faded uppercase glyph flush inside the field's left
     edge rather than labeling outside it — the axis wrapper (not the input) carries the
     field's background/radius/rings, so label and value visually share one box. */
  .s-vector {
    .s-vec-axis { height: var(--control-height); background: var(--field); border-radius: var(--r); gap: 0; &:hover { box-shadow: inset 0 0 0 var(--hairline) var(--accent1); } &:focus-within { box-shadow: 0 0 0 var(--hairline) var(--accent); } }
    .s-vec-label { flex: none; align-self: stretch; display: flex; align-items: center; justify-content: center; opacity: .3; font-size: .8em; text-transform: uppercase; padding: 0 calc(3 * var(--space)); margin-right: calc(-3 * var(--space)); cursor: ew-resize; &:hover { opacity: 1; } }
    input[type="number"] { background: transparent; padding: 0 calc(6 * var(--space)) 0 0; &:hover, &:focus { box-shadow: none; } }
  }

  /* ── Slider: 2px elevation1 track, accent fill, 8×16 rounded-rect scrubber ringed in the
     panel color; the scrubber lightens to accent3 under the pointer, darkens to accent1
     while dragged elsewhere ── */
  /* The colour's alpha is the same track and scrubber, the track a row of checker cells under the colour's ramp. */
  :is(.s-slider, .s-rgba) input[type="range"] {
    width: 100%; height: var(--thumb-h); -webkit-appearance: none; appearance: none; cursor: pointer; background: transparent;
    background-image: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--title) var(--p, 0%));
    background-size: 100% calc(2 * var(--length)); background-position: center; background-repeat: no-repeat;
    border-radius: 0;
    &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb-w); height: var(--thumb-h); border: none; border-radius: var(--thumb-r); background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); cursor: pointer; }
    &::-moz-range-thumb { width: var(--thumb-w); height: var(--thumb-h); border-radius: var(--thumb-r); border: none; background: var(--accent); box-shadow: 0 0 0 var(--thumb-ring) var(--bg); cursor: pointer; }
    :where(:active) > &:active::-webkit-slider-thumb { background: var(--accent1); }
    :where(:active) > &:active::-moz-range-thumb { background: var(--accent1); }
    &::-webkit-slider-thumb:hover { background: var(--accent3); }
    &::-moz-range-thumb:hover { background: var(--accent3); }
    &.s-alpha { flex: 1 1 0; min-width: calc(40 * var(--length)); background-image: linear-gradient(to right, transparent, var(--c)), repeating-linear-gradient(to right, #fff 0 calc(2 * var(--length)), #ccc 0 calc(4 * var(--length))); }
  }
  .s-slider {
    align-items: center;
    /* labelled marks hang in a line kept under the row (the gap and a 1.25 line of the label), so the label still centres on the track */
    &:has(.s-mark-labels:not(:empty)) { margin-bottom: calc(14.5 * var(--length)); }
    .s-track { height: var(--control-height); margin: 0; }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, calc(2 * var(--length))); color: var(--muted); white-space: nowrap; line-height: 1.25;
      /* the end labels stay inside the track's span: the first starts at 0%, the last ends at 100% */
      &.s-first { transform: translate(0, calc(2 * var(--length))); } &.s-last { transform: translate(-100%, calc(2 * var(--length))); } }
    /* leva's 38px box, which leva clips a longer value to; here '440 Hz' or '10.00' widens it. Four
       digits (26.5px) already overrun leva's 26px of text room by half a pixel: a 5px left inset
       absorbs that, so they keep the 38px box */
    .s-readout { flex: 0 0 auto; width: calc(38 * var(--length)); min-width: calc(38 * var(--length)); @supports (field-sizing: content) { field-sizing: content; width: auto; padding-left: calc(5 * var(--space)); } text-align: right; font-variant-numeric: tabular-nums; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--field); color: var(--field-ink); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: var(--r); white-space: nowrap; }
    /* Interval: native travels each scrubber over the track inset by half a scrubber per
       side, then pushes the pair apart by half (scrubber + 4px) so two squared-off halves
       never fuse. The range inputs take the same inset; the fill spans the gap between the
       two rings, which in the inputs' thumb space is exactly --low..--high of a box inset by
       one scrubber width (everything beyond it sits under an opaque scrubber or its ring). */
    &.s-multiple .s-interval-track { height: calc(2 * var(--length)); margin: calc(10 * var(--space)) 0; background: var(--title); border-radius: var(--thumb-r); position: relative; overflow: visible;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--thumb-w); right: var(--thumb-w); background: linear-gradient(to right, transparent var(--low, 0%), var(--accent) var(--low, 0%) var(--high, 100%), transparent var(--high, 100%)); }
      input[type="range"] { background-image: none; top: 50%; left: calc(var(--thumb-w) / 2); width: calc(100% - var(--thumb-w)); height: var(--thumb-h); transform: translateY(-50%); }
      .s-interval-lo::-webkit-slider-thumb { border-radius: var(--thumb-r) 0 0 var(--thumb-r); transform: translateX(calc(-.5 * (var(--thumb-w) + 4 * var(--length)))); }
      .s-interval-lo::-moz-range-thumb { border-radius: var(--thumb-r) 0 0 var(--thumb-r); transform: translateX(calc(-.5 * (var(--thumb-w) + 4 * var(--length)))); }
      .s-interval-hi::-webkit-slider-thumb { border-radius: 0 var(--thumb-r) var(--thumb-r) 0; transform: translateX(calc(.5 * (var(--thumb-w) + 4 * var(--length)))); }
      .s-interval-hi::-moz-range-thumb { border-radius: 0 var(--thumb-r) var(--thumb-r) 0; transform: translateX(calc(.5 * (var(--thumb-w) + 4 * var(--length)))); } }
    &.s-multiple .s-readout-lo { order: 2; }
    &.s-multiple .s-interval-track { order: 1; }
    &.s-multiple .s-readout-hi { order: 3; }
  }

  /* ── Select: native paints no hover or focus on its dropdown (the real select is an
     invisible overlay); keyboard focus alone gets the field focus ring ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; cursor: pointer; color: var(--field-ink);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 9 5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.8 4.4c.4.3 1 .3 1.4 0L8 1.7A1 1 0 007.4 0H1.6a1 1 0 00-.7 1.7l3 2.7z' fill='${enc(muted)}'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right calc(10 * var(--space)) center; background-size: calc(9 * var(--length)) calc(5 * var(--length)); padding-right: calc(22 * var(--space));
      &:hover, &:focus { box-shadow: none; }
      &:focus-visible { box-shadow: 0 0 0 var(--hairline) var(--accent); }
      option { background: var(--field); color: var(--field-ink); } }
    &.s-segmented { .s-input { gap: calc(2 * var(--length)); } button { flex: 1; background: var(--field); border: none; color: var(--ink); border-radius: var(--r); height: var(--control-height); padding: 0 calc(4 * var(--space)); font: inherit; &:hover { box-shadow: inset 0 0 0 var(--hairline) var(--accent1); } &.s-selected { background: var(--action); color: var(--on-accent); } } }
    /* an option list stands a step clear of its neighbours, so two lists never read as one */
    &:is(.s-radio, .s-checkboxes) > .s-input { padding-block: calc(4 * var(--space)); }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(4 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(7 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean: 16px elevation3 square, accent when checked, accent1 while pressed; the
     check is native's own 24-unit round-capped stroke in a 90% (14.39px) svg whose box
     snaps to the whole pixel, 1px in. The viewBox reproduces that frame so the image tile
     stays the whole pixel-aligned box, and it rides a ::before (native's is a child svg)
     so the hover ring antialiases against a plain fill exactly as native's does. ── */
  .s-boolean input[type="checkbox"], .s-checkboxes .s-track { -webkit-appearance: none; appearance: none; flex: none; width: calc(16 * var(--length)); height: calc(16 * var(--length)); margin: 0; border-radius: var(--r); background: var(--field); cursor: pointer; }
  .s-boolean input[type="checkbox"]:checked, .s-checkboxes input:checked + .s-track { background: var(--s-color, var(--accent)); &::before { content: ''; display: block; width: 100%; height: 100%; background: url("data:image/svg+xml,%3Csvg viewBox='-1.668 -1.668 26.684 26.684' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 13l4 4L19 7' fill='none' stroke='${enc(onAccent)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 0 0 / 100% 100% no-repeat; } }
  .s-boolean {
    align-items: center;
    /* only the 16px box is live, as native's: the wrapping label passes the pointer through */
    .s-input { pointer-events: none; min-height: var(--control-height); }
    input[type="checkbox"] { position: static; opacity: 1; outline: none; pointer-events: auto;
      :where(:hover) > &:hover { box-shadow: inset 0 0 0 var(--hairline) var(--accent1); }
      :where(:active) > &:active { background-color: var(--accent1); }
      &:focus-visible { box-shadow: 0 0 0 var(--hairline) var(--accent); } }
    .s-track { display: none; }
  }
  .s-checkboxes { label:hover .s-track { box-shadow: inset 0 0 0 var(--hairline) var(--accent1); } label:active .s-track { background-color: var(--accent1); } input:focus-visible + .s-track { box-shadow: 0 0 0 var(--hairline) var(--accent); } }

  /* ── Color: 24px square swatch clipped by its rounded white base, as native nests it; the
     swatch is positioned (native's is an absolute ::before) so the clip antialiases it
     separately from the base, leaving native's faint light corner fringe ── */
  .s-color {
    &:is(.s-picker, .s-rgba) .s-color-input { gap: var(--column-gap);
      input[type="color"] { position: static; width: var(--control-height); height: var(--control-height); padding: 0; border: none; border-radius: var(--r); overflow: hidden; background: #fff; cursor: pointer; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 0; position: relative; } :where(:hover) > &:hover { box-shadow: inset 0 0 0 var(--hairline) var(--accent1); } }
      input[type="text"] { flex: 1; min-width: 0; } }
    /* the value keeps its length where it fits; the alpha takes the rest, never under 40px */
    &.s-rgba .s-color-input input[type="text"] { flex: 0 1 auto; width: auto; field-sizing: content; }
    &.s-swatches button { width: calc(18 * var(--length)); height: calc(18 * var(--length)); border-radius: var(--r); border: none; &.s-selected { outline: 2px solid var(--accent); } }
  }

  /* ── Button: accent fill; hover rings it in accent3, press darkens to accent1, focus
     (declared last, as native) swaps the ring for a 1px outer accent halo ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    button { width: 100%; background: var(--action); color: var(--on-accent); border: none; border-radius: var(--r); height: var(--control-height); font-weight: 400; outline: none;
      &:hover { box-shadow: inset 0 0 0 var(--hairline) var(--accent3); }
      &:active { box-shadow: inset 0 0 0 var(--hairline) var(--accent3); background: var(--accent1); }
      &:focus { box-shadow: 0 0 0 var(--hairline) var(--accent); } }
    &.s-secondary button, button.s-secondary { background: var(--title); color: var(--ink); }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: none; field-sizing: content; min-height: calc(44 * var(--length)); max-height: 50vh; padding: calc(5 * var(--space)) calc(7 * var(--space)); } }

  /* ── Folder: a root folder below any visible row (native re-renders filtered rows away)
     opens with a 1px elevation1 rule 10px below it; its chevron (highlight2 at 60%) and
     indent rule (40%) brighten while the folder is hovered ── */
  .s-panel-content > :not([hidden]) ~ .s-folder { margin-top: var(--section-gap); padding-top: calc(6 * var(--space)); border-top: var(--hairline) solid var(--title); }
  .s-folder {
    > summary { color: var(--ink); font-weight: 400; height: calc(20 * var(--length)); padding: 0; border-top: 0; gap: 0;
      /* Native offsets the 9px chevron with equal-and-opposite 4px margins so its center
         lands on the indent rule below without shifting the label that follows. */
      &::before { content: ''; flex: none; width: calc(9 * var(--length)); height: calc(5 * var(--length)); margin: 0 calc(4 * var(--length)) 0 calc(-4 * var(--length)); background: var(--muted); opacity: .6; -webkit-mask: var(--chevron) center / contain no-repeat; mask: var(--chevron) center / contain no-repeat; transform: rotate(-90deg); transition: transform .35s; }
      &::after { display: none; } }
    &[open] > summary::before { transform: rotate(0deg); }
    &:hover > summary::before { opacity: 1; }
    /* The rule is a 1px bar centered on the content's left edge (translateX -50%), not a
       border, so it straddles the chevron's axis exactly as native does. */
    > .s-content { position: relative; gap: var(--row-gap); padding-left: calc(10 * var(--space));
      &::after { content: ''; position: absolute; left: 0; top: 0; width: var(--hairline); height: 100%; background: var(--muted); opacity: .4; transform: translateX(-50%); } }
    &:hover > .s-content::after, > summary:hover + .s-content::after { opacity: .6; }
    .s-content .s-control { padding: 0; }
  }

  /* ── Info: monitors top-align their label 6px down (native reserves room for graphs) ── */
  .s-info > .s-label-group { align-self: flex-start; padding-top: calc(6 * var(--space)); }
  .s-info .s-monitor { color: var(--muted); opacity: 1; font-variant-numeric: tabular-nums; }
  .s-separator { background: var(--title); opacity: 1; }
  .s-separator-labeled { background: none; &::before, &::after { background: var(--title); opacity: 1; } }
  .s-separator-label { color: ${sepLabel}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
