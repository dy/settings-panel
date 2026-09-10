/**
 * apple — calibrated to macOS System Settings (HIG)
 *
 * Signatures: SF Pro, the #007aff system blue, iOS toggles, rounded grouped
 * cells with hairline row dividers, thin sliders with a 20px circular thumb,
 * and macOS popup-button dropdowns. Light by default; dark shade flips it.
 *
 * Axes: shade + accent decompose (via parseColor) into a `dark` flag that
 * drives every native constant below (ink/dim text, hairline, sheet/field
 * fill, slider/segmented/switch track tones, tooltip, shadows) — each still
 * a named CSS custom property so it can be overridden independently even
 * though its default is Apple's own fixed value, not a formula.
 *
 * apple(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, resolveAccent } from './color.js'

export default function apple({
  shade = '#ffffff',
  accent = '#007aff',
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < 0.5
  const acc = resolveAccent(accent, shade)

  // ── Derived tokens (native's own constants, named + light/dark aware) ──
  const ink = dark ? '#ffffff' : '#1d1d1f'                                  // primary text
  const dim = dark ? '#98989d' : '#8e8e93'                                  // secondary text, hint, chevrons
  const line = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'           // row hairline
  const fill = dark ? '#1c1c1e' : '#ffffff'                                 // panel sheet background
  const field = dark ? '#2c2c2e' : '#f2f2f7'                                // input / well fill
  const track = dark ? '#48484a' : '#e9e9eb'                                // slider / segmented / interval empty track
  const switchOff = dark ? '#39393d' : '#e9e9eb'                            // switch off-state track (its own shade — not `track`)
  const segmentSelected = dark ? '#636366' : '#fff'                         // segmented active pill
  const segmentHover = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)'   // segmented hover wash
  const tooltipBg = dark ? '#3a3a3c' : '#fff'
  const swatchBorder = 'rgba(0,0,0,.15)'                                    // color-well / swatch edge — same both modes
  const onAccent = '#fff'                                                   // text/icon drawn on an accent-filled surface
  const thumbFace = '#fff'                                                  // slider/switch knob face — native keeps this white in both modes

  const shadowPanel = '0 8px 30px rgba(0,0,0,.12)'
  const shadowThumb = '0 1px 3px rgba(0,0,0,.25), 0 0 0 .5px rgba(0,0,0,.04)'
  const shadowKnob = '0 1px 3px rgba(0,0,0,.25)'
  const shadowTooltip = '0 2px 8px rgba(0,0,0,.2)'
  const shadowPill = '0 .5px 1px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)'

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {fontSize: 13, fontFamily: "-apple-system, system-ui, 'SF Pro Text', 'Helvetica Neue', sans-serif", lineHeight: 16.9, controlHeight: 28, inset: 7, rowGap: 0, columnGap: 8, sectionGap: 12, panelPadding: 0})}

  /* ── Axes → color tokens ── */
  --bg: ${shade};
  --accent: ${acc};
  --ink: ${ink};
  --dim: ${dim};
  --line: ${line};
  --fill: ${fill};
  --field: ${field};
  --track: ${track};
  --switch-off: ${switchOff};
  --segment-selected: ${segmentSelected};
  --segment-hover: ${segmentHover};
  --tooltip-bg: ${tooltipBg};
  --swatch-border: ${swatchBorder};
  --on-accent: ${onAccent};
  --thumb-face: ${thumbFace};
  --shadow-panel: ${shadowPanel};
  --shadow-thumb: ${shadowThumb};
  --shadow-knob: ${shadowKnob};
  --shadow-tooltip: ${shadowTooltip};
  --shadow-pill: ${shadowPill};

  /* ── Size tokens — native's exact constants, still overridable ── */

  --weight: 400;
  --w: calc(320 * var(--length));
  --r: calc(8 * var(--length));
  --r-panel: calc(12 * var(--length));
  --r-field: calc(6 * var(--length));
  --r-control: calc(7 * var(--length));
  --r-track: calc(2 * var(--length));
  --thumb: calc(20 * var(--length));
  --field-h: var(--control-height);
  --switch-w: calc(38 * var(--length));
  --switch-h: calc(22 * var(--length));
  --swatch-picker: calc(24 * var(--length));
  --swatch: calc(22 * var(--length));
  --ease: cubic-bezier(.2, 0, 0, 1);
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--fill);
  color: var(--ink);

  width: min(100%, var(--w));
  min-width: 0;
  max-width: min(100%, var(--w));
  border-radius: var(--r-panel);
  padding: 0;
  box-shadow: var(--shadow-panel);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title ── */
  > summary, > .s-panel-title {
    font-weight: 600; font-size: calc(15 * var(--length)); color: var(--ink);
    padding: calc(16 * var(--space)) calc(18 * var(--space)) calc(10 * var(--space));
  }
  > summary::after { content: ''; width: calc(13 * var(--length)); height: calc(13 * var(--length)); margin-left: auto; background: var(--dim); -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s var(--ease); }
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='2,3.5 5,6.5 8,3.5' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(-180deg); }
  .s-panel-content { gap: var(--row-gap); padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }

  /* ── Row (cell with hairline divider) ── */
  .s-control { gap: var(--column-gap); padding: calc(9 * var(--space)) calc(18 * var(--space)); min-height: calc(44 * var(--length)); align-items: center; border-top: 1px solid var(--line);
    &:first-child { border-top: none; } }
  .s-label-group { width: 42%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--ink); font-weight: 400; }
  .s-hint { color: var(--dim); font-size: calc(12 * var(--length)); }
  .s-input { gap: calc(var(--u) * 2); align-items: center; justify-content: flex-end; }

  /* ── Fields ── */
  input[type="text"], input[type="number"], select, textarea {
    background: var(--field); color: var(--ink); border: none; border-radius: var(--r-field);
    height: var(--field-h); padding: 0 calc(8 * var(--space)); font: inherit;
    transition: box-shadow .12s var(--ease);
    &::placeholder { color: var(--dim); }
    &:focus { outline: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent), transparent 70%); }
  }
  .s-text input[type="text"] { flex: 1; text-align: right; }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 0 1 auto; width: calc(72 * var(--length)); text-align: right; cursor: ew-resize; font-variant-numeric: tabular-nums; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Vector ── */
  .s-vector {
    .s-input { gap: var(--column-gap); flex-wrap: wrap; }
    .s-vec-axis { flex: 1; min-width: 8ch; gap: calc(var(--u)); background: var(--field); border-radius: var(--r-field); padding: 0 calc(8 * var(--space)); height: var(--field-h);
      transition: box-shadow .12s var(--ease);
      &:focus-within { box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent), transparent 70%); } }
    .s-vec-label { color: var(--dim); font-size: calc(12 * var(--length)); }
    input[type="number"] { background: transparent; text-align: right; padding: 0; height: var(--field-h); font-variant-numeric: tabular-nums; &:focus { box-shadow: none; } }
  }

  /* ── Slider (thin track, 20px circular thumb) ── */
  .s-slider {
    align-items: center;
    .s-track { height: var(--field-h); margin: 0; }
    input[type="range"] {
      width: 100%; height: calc(4 * var(--length)); -webkit-appearance: none; appearance: none; border-radius: var(--r-track); cursor: pointer;
      background: linear-gradient(to right, var(--accent) var(--p, 0%), var(--track) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb); height: var(--thumb); border-radius: 50%; background: var(--thumb-face); box-shadow: var(--shadow-thumb); cursor: pointer; }
      &::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border: none; border-radius: 50%; background: var(--thumb-face); box-shadow: var(--shadow-knob); cursor: pointer; }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, 4px); font-size: calc(11 * var(--length)); color: var(--dim); white-space: nowrap; }
    .s-readout { flex: 0 0 auto; width: calc(52 * var(--length)); text-align: right; background: var(--field); color: var(--ink); border: none; border-radius: var(--r-field); height: var(--field-h); padding: 0 calc(8 * var(--space)); font-variant-numeric: tabular-nums; cursor: ew-resize; }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(6 * var(--space)); background: var(--tooltip-bg); color: var(--ink); padding: calc(3 * var(--space)) calc(8 * var(--space)); border-radius: var(--r-field); box-shadow: var(--shadow-tooltip); white-space: nowrap; }
    &.s-multiple .s-interval-track { height: calc(4 * var(--length)); margin: calc(12 * var(--space)) 0; background: var(--track); border-radius: var(--r-track); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); } }
  }

  /* ── Select (macOS popup button) ── */
  .s-select {
    &.s-dropdown .s-input { position: relative; flex: 0 1 auto; min-width: auto; max-width: 100%;
      &::after { content: ''; position: absolute; top: 50%; right: calc(3 * var(--length)); width: calc(16 * var(--length)); height: calc(18 * var(--length)); transform: translateY(-50%); border-radius: calc(4 * var(--length)); background: var(--accent);
        -webkit-mask: var(--pop-chev) center / 9px 12px no-repeat; mask: var(--pop-chev) center / 9px 12px no-repeat; pointer-events: none; } }
    --pop-chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 9 12' xmlns='http://www.w3.org/2000/svg' fill='%23fff'%3E%3Cpath d='M4.5 0 L8 3.6 L6.8 4.8 L4.5 2.5 L2.2 4.8 L1 3.6Z'/%3E%3Cpath d='M4.5 12 L8 8.4 L6.8 7.2 L4.5 9.5 L2.2 7.2 L1 8.4Z'/%3E%3C/svg%3E");
    &.s-dropdown select { flex: 0 1 auto; width: auto; max-width: 100%; min-width: 0; appearance: none; -webkit-appearance: none; cursor: pointer; font-weight: 400; color: var(--ink);
      text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
      padding-right: calc(26 * var(--space)); background: var(--field);
      option { background: var(--fill); color: var(--ink); } }
    &.s-segmented { .s-input { gap: 0; background: var(--track); border-radius: var(--r); padding: calc(2 * var(--length)); }
      button { flex: 1; background: transparent; border: none; color: var(--ink); border-radius: var(--r-field); height: calc(26 * var(--length)); font: inherit;
        transition: background .12s var(--ease), box-shadow .12s var(--ease);
        &:not(.s-selected):hover { background: var(--segment-hover); }
        &.s-selected { background: var(--segment-selected); box-shadow: var(--shadow-pill); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(var(--u) * 2); } .s-input label { display: flex; align-items: center; gap: calc(var(--u) * 2); cursor: pointer; } }
  }

  /* ── Boolean (iOS toggle) ── */
  .s-boolean {
    align-items: center;
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch {
      .s-track { width: var(--switch-w); height: var(--switch-h); border-radius: calc(999 * var(--length)); background: var(--switch-off); position: relative; cursor: pointer; transition: background .2s var(--ease);
        &::after { content: ''; position: absolute; top: calc(1 * var(--length)); left: calc(1 * var(--length)); width: var(--thumb); height: var(--thumb); border-radius: 50%; background: var(--thumb-face); box-shadow: var(--shadow-knob); transition: left .2s var(--ease); } }
      &:has(input:checked) .s-track { background: var(--accent); &::after { left: calc(var(--switch-w) - var(--thumb) - calc(1 * var(--length))); } }
      &:has(input:focus-visible) .s-track { outline: 3px solid color-mix(in oklab, var(--accent), transparent 60%); outline-offset: 1px; }
    }
    &.s-checkbox {
      .s-track { display: grid; place-items: center; width: var(--thumb); height: var(--thumb); border-radius: 50%; background: transparent; border: 1.5px solid var(--dim);
        transition: background .12s var(--ease), border-color .12s var(--ease);
        &::after { content: ''; width: calc(11 * var(--length)); height: calc(9 * var(--length)); -webkit-mask: var(--check) center / contain no-repeat; mask: var(--check) center / contain no-repeat; background: var(--on-accent); opacity: 0; } }
      &:has(input:checked) .s-track { background: var(--accent); border-color: var(--accent); &::after { opacity: 1; } }
    }
    --check: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E");
    &.s-toggle .s-track { padding: 0 calc(14 * var(--space)); height: var(--field-h); border-radius: var(--r-control); background: var(--field); display: flex; align-items: center; justify-content: center; cursor: pointer; &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--accent); color: var(--on-accent); &::after { content: 'On'; } }
  }

  /* ── Color (rounded well) ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(var(--u) * 2); justify-content: flex-end;
      input[type="color"] { position: static; flex: none; width: var(--swatch-picker); height: var(--swatch-picker); padding: 0; border: .5px solid var(--swatch-border); border-radius: 50%; cursor: pointer; overflow: hidden; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } }
      input[type="text"] { flex: 0 1 auto; width: auto; min-width: 9ch; background: var(--field); border-radius: var(--r-field); height: var(--field-h); text-align: right; } }
    &.s-rgba .s-color-input { gap: calc(var(--u) * 1.5); justify-content: flex-end; input[type="color"] { width: var(--swatch-picker); height: var(--swatch-picker); border-radius: 50%; } input[type="text"] { flex: 1; background: var(--field); border-radius: var(--r-field); height: var(--field-h); } }
    &.s-swatches { .s-input { justify-content: flex-end; } button { width: var(--swatch); height: var(--swatch); border-radius: 50%; border: .5px solid var(--swatch-border); &.s-selected { outline: 2px solid var(--accent); outline-offset: 2px; } } }
  }

  /* ── Button ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: calc(var(--u) * 2); }
    button { flex: 1; height: calc(30 * var(--length)); background: var(--accent); color: var(--on-accent); border: none; border-radius: var(--r-control); font-weight: 500;
      transition: filter .12s var(--ease);
      &:hover { filter: brightness(1.05); } &:active { filter: brightness(.92); } &:disabled { opacity: .4; cursor: not-allowed; } }
    &.s-secondary button, button.s-secondary { background: var(--field); color: var(--accent); transition: filter .12s var(--ease); &:hover { filter: brightness(.97); } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(52 * var(--length)); max-height: 50vh; padding: calc(7 * var(--space)) calc(8 * var(--space)); } }

  /* ── Folder (grouped section) ── */
  .s-folder {
    padding: 0; /* .s-folder also matches .s-control — without this it double-applies the row inset/top-padding to both the header and .s-content's children */
    > summary { font-weight: 600; font-size: calc(13 * var(--length)); color: var(--dim); text-transform: none; padding: calc(14 * var(--space)) calc(18 * var(--space)) calc(6 * var(--space));
      &::after { content: ''; width: calc(13 * var(--length)); height: calc(13 * var(--length)); margin-left: auto; background: var(--dim); -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transition: transform .15s var(--ease); } }
    &[open] > summary::after { transform: rotate(-180deg); }
    .s-content { gap: 0; }
  }

  /* ── XY pad / knob ── */
  .s-pad { border-radius: var(--r); background: var(--field); border-color: var(--line); }
  .s-knob-dial { background: var(--field); border: 1px solid var(--line); }

  /* ── Info / separator ── */
  .s-info { .s-input { justify-content: flex-end; } .s-monitor { flex: 0 1 auto; color: var(--dim); font-variant-numeric: tabular-nums; } }
  .s-separator { background: var(--line); opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
