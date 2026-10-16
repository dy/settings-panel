/**
 * Swiss theme — International Typographic Style
 *
 * Transparent grid rows, hairline rules, typographic hierarchy. No radius, no shadow.
 * Axes: shade/accent (ink + selection color), spacing, weight, size (grid
 * unit), hairline (rule weight), scale (type-size ramp), plus the three
 * font-role slots (title/label/value). Every rule, size, and font-size below
 * reads from the derived tokens in the var block — nothing is a bare literal.
 * swiss(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, resolveAccent, contrast, mix } from './color.js'

const chevUp = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5L5 1.5L8.5 5' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
const chevDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1L5 4.5L8.5 1' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

// One stroke for every glyph: the chevrons draw at 1.2× their viewBox (3u wide), the check at 1.17× its own
const checkMark = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1.5' fill='none' stroke='%23000' stroke-width='1.55' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`
// A native select cannot tint a mask: its chevron is drawn in the ink
const selectChevron = ink => `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 1L5 4.5L8.5 1' fill='none' stroke='${encodeURIComponent(ink)}' stroke-width='1.5' stroke-linecap='square' stroke-linejoin='miter'/%3E%3C/svg%3E")`

export default function swiss({
  shade = '#4a4a4a',
  accent = '#ffffff',
  spacing = 1,
  weight = 500,
  roundness = 0, // always sharp; kept for axis API
  size = 1,       // grid unit (--u) multiplier
  hairline = 1,   // rule / border weight, px
  scale = 1,      // typographic scale multiplier
  titleFont = `'Oswald', 'Arial Narrow', sans-serif`,
  labelFont = `'DM Sans', 'Helvetica', sans-serif`,
  valueFont = `'DM Serif Display', 'Georgia', serif`,
  font,
} = {}) {
  const { L } = parseColor(shade)
  const dark = L < .6
  // Secondary text is the ink at part alpha over the ground the transparent panel sits on (its
  // shade): dim 45% black or 50% white as drawn, hints and section labels at base's 60%, vector
  // axis letters at its 55%; each raised as far as it needs to read 4.5:1 there.
  const ink = dark ? '#ffffff' : '#000000'
  const reads = a => { while (a < 100 && contrast(mix(shade, ink, a / 100), shade) < 4.5) a++; return a }
  const [dimLight, dimDark] = dark ? [45, reads(50)] : [reads(45), 50]

  // Body 14px: between the 12px DM Sans labels and the 16px DM Serif Display values, whose short figures (.66 em) read as 14px text.
  const body = 14
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, inset: 8, rowGap: 0, columnGap: 0, sectionGap: 56, panelPadding: 0, fontFamily: "system-ui, -apple-system, sans-serif"})}

  /* ── Tokens ── */
  --bg: transparent;
  --accent: ${resolveAccent(accent, shade)};

  --weight: ${weight};
  --roundness: 0;
  --r: 0;

  --hairline: ${hairline}px;
  --scale: ${scale};
  /* type scale: one size per role, every font-size in the theme is one of these steps.
     Title and actions in the condensed face; labels, list options and the secondary sans text (hints,
     separator labels, tooltips, axis letters) in the sans at the label size; values (fields, selects,
     numbers, segments, toggles, colour codes, info) in the serif, whose short figures (.66 em) read as
     14px text; readouts, slider tooltips and knob values in the serif a step down, the labels' optical size. */
  --size-title: calc(42 * var(--scale) * var(--length));
  --size-subtitle: calc(15 * var(--scale) * var(--length));
  --size-label: calc(12 * var(--scale) * var(--length));
  --size-value: calc(16 * var(--scale) * var(--length));
  --size-readout: calc(14 * var(--scale) * var(--length));
  --size-button: calc(19.2 * var(--scale) * var(--length));
  --code-font: ui-monospace, 'SF Mono', monospace;
  /* one row for every single-line control, segment and heading: a line with an inset and a half either
     side (the height the serif values set); the checkbox and radio lists keep the reference's smaller step */
  --row: calc(var(--lh) + var(--pad) * 3);
  --glyph: calc(var(--u) * 3);
  --groove: oklch(from var(--accent) clamp(.352, (.75 - l) * 100, .952) 0 0);
  --title-font: ${titleFont};
  --label-font: ${font || labelFont};
  --value-font: ${font || valueFont};
  color-scheme: ${dark ? 'dark' : 'light'};
  color: light-dark(black, white);

  --rule: light-dark(color-mix(in srgb, black 12%, transparent), white);
  --dim: light-dark(color-mix(in srgb, black ${dimLight}%, transparent), color-mix(in srgb, white ${dimDark}%, transparent));
  --fill: light-dark(color-mix(in srgb, black 7%, transparent), color-mix(in srgb, white 10%, transparent));
  --fill-hover: light-dark(color-mix(in srgb, black 11%, transparent), color-mix(in srgb, white 16%, transparent));
  --check-mark: ${checkMark};
  --chev-up: ${chevUp};
  --chev-down: ${chevDown};

  --label-w: 28%;


  border-radius: 0;
  padding: var(--panel-padding);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Panel header ── */
  > summary, > .s-panel-title {
    font-family: var(--title-font);
    font-weight: 600;
    text-transform: uppercase;
    font-size: var(--size-title);
    line-height: 1.1;
    text-align: center;
    display: block;
    padding: calc(var(--u) * 5) var(--pad) calc(var(--u) * 4);
    &::after { display: none; }

    & + .s-subtitle {
      font-family: var(--value-font);
      font-style: italic;
      font-size: var(--size-subtitle);
      text-align: center;
      color: var(--dim);
      line-height: 1.25;
      max-width: 24ch;
      margin: 0 auto;
    }
  }

  .s-panel-content {
    gap: var(--row-gap);
    padding: calc(var(--u) * 13) 0 0;
  }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: 0;
  }

  /* ── Grid row ── */
  .s-control {
    border-top: var(--hairline) solid var(--rule);
    padding: 0;
    gap: var(--column-gap);
    align-items: stretch;
    min-height: calc(var(--row) + var(--hairline));
  }

  /* the label sits on its control's first line: centred in the first row, a hint or a taller control below */
  .s-label-group {
    min-width: 12ch;
    width: var(--label-w);
    max-width: none;
    align-self: stretch;
    padding: calc(var(--pad) * 1.5) var(--pad);
    border-right: var(--hairline) solid var(--rule);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    line-height: var(--lh);
  }
  /* under a hint, the field keeps the first row, level with the label */
  .s-control:has(.s-hint) > .s-input { align-self: flex-start; min-height: var(--row); }

  .s-title { font-family: var(--label-font); font-size: var(--size-label); }
  .s-title-text {
    padding: var(--u) calc(var(--u) * 2);
    background: light-dark(black, white); color: light-dark(white, black);
    font-family: var(--label-font); font-size: var(--size-label); line-height: 1.5;
  }

  .s-label, .s-folder > summary, .s-separator-label {
    font-family: var(--label-font);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .08em;
    line-height: var(--lh);
    font-size: var(--size-label);
  }
  .s-hint, .s-vec-label, .s-mark-label { font-family: var(--label-font); font-size: var(--size-label); }
  .s-readout, .s-tooltip, .s-knob-val, .s-pad-val, .s-info .s-monitor, .s-toggle .s-track { font-family: var(--value-font); }
  .s-readout, .s-tooltip, .s-knob-val, .s-pad-val { font-size: var(--size-readout); }
  .s-info .s-monitor, .s-toggle .s-track { font-size: var(--size-value); }
  /* base dims these by opacity; raised to read on the ground */
  .s-hint { opacity: ${reads(60) / 100}; }

  .s-input {
    gap: 0;
    align-items: stretch;
    align-self: stretch;
  }

  /* ── Value typography (shared) ── */
  input[type="text"], input[type="number"], textarea, select, button {
    font-family: var(--value-font);
    font-size: var(--size-value);
    font-weight: var(--weight);
    color: inherit;
    border-radius: 0;
    box-shadow: none;
    filter: none;
  }

  input[type="text"], textarea, select {
    flex: 1;
    align-self: stretch;
    width: auto;
    min-width: 0;
    height: auto;
    min-height: 0;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border: none;
    outline: none;
    padding: var(--pad) calc(var(--u) * 4);
    &::placeholder { color: var(--dim); }
    &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
  }
  /* a single-line field fills its row: the row sets the height, the field centres its text
     (an inset would add to the serif's own taller line box and lift the row past its pitch) */
  input[type="text"], select { padding-block: 0; }
  .s-search-input::placeholder { color: var(--dim); }

  input[type="number"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    background: transparent;
    border: none;
    outline: none;
    padding: 0 calc(var(--u) * 4);
    font-variant-numeric: tabular-nums;
    &::placeholder { color: var(--dim); }
    &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  }

  /* ── Number ── */
  .s-number {
    /* the stepper's chevrons end one value inset off the edge, where the select's does */
    .s-input {
      gap: calc(var(--u) * 2);
      padding-right: calc(var(--u) * 4);
      align-items: center;
    }
    input[type="number"] {
      flex: none;
      align-self: stretch;
      width: calc(var(--u) * 12);
      min-width: calc(var(--u) * 12);
      text-align: left;
    }
    .s-step {
      display: flex;
      flex-direction: column;
      gap: var(--hairline);
      flex: none;
      margin-left: auto;
      button {
        flex: none;
        width: calc(var(--u) * 3);
        height: calc(var(--u) * 3);
        padding: 0;
        font-size: 0;
        color: inherit;
        opacity: 1;
        background: none;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        &::after {
          content: '';
          display: block;
          width: calc(var(--u) * 3);
          height: calc(var(--u) * 3);
          background: currentColor;
        }
        &.s-step-up::after {
          -webkit-mask: var(--chev-up) center / contain no-repeat;
          mask: var(--chev-up) center / contain no-repeat;
        }
        &.s-step-down::after {
          -webkit-mask: var(--chev-down) center / contain no-repeat;
          mask: var(--chev-down) center / contain no-repeat;
        }
      }
    }
  }

  /* ── Boolean ── */
  .s-boolean {
    /* centred in the row, not inset from it: the row keeps its pitch */
    &.s-switch .s-input, &.s-toggle .s-input { align-items: center; padding: 0 calc(var(--u) * 4); }
    &.s-switch .s-track { position: relative; flex: none; width: calc(var(--u) * 10); height: calc(var(--u) * 5);
      &::after { content: ''; position: absolute; top: calc(2 * var(--length)); bottom: calc(2 * var(--length)); left: calc(2 * var(--length)); width: calc(var(--u) * 4 - 2 * var(--length)); transition: left 120ms; }
    }
    &.s-switch:has(input:checked) .s-track::after { left: calc(var(--u) * 6 - 2 * var(--length)); }
    &.s-toggle .s-track { padding: calc(3 * var(--length)) calc(12 * var(--length)); &::after { content: 'Off'; background: none; } }
    &.s-toggle:has(input:checked) .s-track::after { content: 'On'; background: none; }
    /* checkbox: one row of the checkboxes list, a gutter cell that fills and takes the check mark */
    &.s-checkbox {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { position: relative; flex: none; width: calc(var(--u) * 7); border: none; border-right: var(--hairline) solid var(--rule); cursor: pointer;
        &::after { content: ''; position: absolute; inset: 0; -webkit-mask: var(--check-mark) center / calc(14 * var(--length)) no-repeat; mask: var(--check-mark) center / calc(14 * var(--length)) no-repeat; opacity: 0; transform: scale(.25); transition: opacity 140ms, transform 140ms; } }
      .s-input:hover .s-track { background: var(--fill-hover); }
      &:has(input:checked) .s-track::after { opacity: 1; transform: scale(1); }
    }
    .s-track {
      background: transparent;
      border: var(--hairline) solid var(--rule);
      border-radius: 0;
      box-shadow: none;
      transition: background-color 120ms, transform 120ms;
      &::after {
        border-radius: 0;
        background: currentColor;
        box-shadow: none;
      }
    }
    .s-input:active .s-track { transform: scale(0.96); }
    &:has(input:checked) .s-track {
      background: var(--fill);
      border-color: var(--rule);
      &::after { background: currentColor; }
    }
    &:has(input:focus-visible) .s-track {
      outline: var(--hairline) solid var(--accent);
      outline-offset: calc(var(--hairline) * -1);
    }
  }

  /* ── Select ── */
  .s-select {

    /* an open cell like the fields, its chevron the stepper's */
    select {
      cursor: pointer;
      padding-right: calc(var(--u) * 9);
      background: ${selectChevron(ink)} right calc(var(--u) * 4) center / var(--glyph) no-repeat;
      &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
    }

    /* segmented — horizontal or vertical, same selection model */
    &.s-segmented {
      .s-input {
        gap: 0;
        padding: 0;
        align-items: stretch;
        &:has(button:nth-child(3)) { flex-direction: column; }
      }
      button {
        flex: 1;
        align-self: stretch;
        background: transparent;
        border: none;
        border-left: var(--hairline) solid var(--rule);
        outline: none;
        cursor: pointer;
        letter-spacing: .02em;
        margin-left: calc(var(--hairline) * -1);
        padding: var(--pad) calc(var(--u) * 1.5);
        text-align: center;
        transition: background-color 120ms;
        &:first-child { margin-left: 0; border-left: none; }
        &:hover { background: var(--fill-hover); }
        &.s-selected {
          background: var(--fill);
          &:hover { background: var(--fill-hover); }
        }
      }
      .s-input:has(button:nth-child(3)) button {
        min-height: calc(var(--row) + var(--hairline));
        margin-left: 0;
        margin-top: calc(var(--hairline) * -1);
        border-left: none;
        border-top: var(--hairline) solid var(--rule);
        &:first-child { min-height: var(--row); margin-top: 0; border-top: none; }
      }
    }

    /* lists, as the reference's checkbox list: sans options on the smaller list step, each with a
       gutter cell that fills and takes the mark, a check for each one ticked, a square for the one chosen */
    &:is(.s-checkboxes, .s-radio) {
      align-items: baseline;

      .s-label-group {
        align-self: auto;
        justify-content: flex-start;
        border-right: none;
      }

      .s-input {
        align-self: stretch;
        flex-direction: column;
        gap: 0;
        align-items: stretch;
        padding: 0;
        border-left: var(--hairline) solid var(--rule);
      }
      input { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { display: none; }
      .s-input label {
        position: relative;
        display: flex;
        align-items: center;
        gap: calc(var(--u) * 1.5);
        font-family: var(--label-font);
        font-weight: 600;
        font-size: var(--size-label);
        line-height: var(--lh);
        text-transform: none;
        cursor: pointer;
        min-height: calc(var(--u) * 6.5);
        & + label { border-top: var(--hairline) solid var(--rule); }
        &::before {
          content: '';
          width: calc(var(--u) * 7);
          align-self: stretch;
          flex-shrink: 0;
          padding: calc(var(--u) * 1.5);
          border-right: var(--hairline) solid var(--rule);
          transition: background-color 120ms;
        }
        &:hover::before { background: var(--fill-hover); }
        &:has(input:checked)::before { background-color: var(--fill); }
        &:has(input:checked):hover::before { background-color: var(--fill-hover); }
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: calc(var(--u) * 7);
          background: light-dark(black, white);
          -webkit-mask: var(--check-mark) center / calc(14 * var(--length)) no-repeat;
          mask: var(--check-mark) center / calc(14 * var(--length)) no-repeat;
          pointer-events: none;
          opacity: 0;
          transform: scale(.25);
          transition: opacity 140ms, transform 140ms;
        }
        &:has(input:checked)::after { opacity: 1; transform: scale(1); }
        &:has(input:focus-visible) { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
      }
    }
    &.s-radio .s-input label::after {
      -webkit-mask: none; mask: none;
      background: linear-gradient(light-dark(black, white) 0 0) center / calc(8 * var(--length)) calc(8 * var(--length)) no-repeat;
    }
  }

  /* ── Slider: one square slider for every range (plain, interval, the colour's alpha): an outlined
     groove, the accent filled up to the thumb, a square thumb of the fill ringed in the groove's tone.
     The groove contrasts the accent as the native one does, dark under a light accent, light under a dark one. ── */
  .s-slider input[type="range"], .s-color .s-alpha {
    -webkit-appearance: none; appearance: none; width: 100%; min-width: 0; height: calc(var(--u) * 2); margin: 0;
    border: var(--hairline) solid var(--rule); border-radius: 0;
    background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--groove) var(--p, 0%));
    cursor: pointer;
    &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(var(--u) * 4); height: calc(var(--u) * 4); border: var(--hairline) solid var(--groove); border-radius: 0; background: var(--accent); cursor: grab; }
    &::-moz-range-thumb { width: calc(var(--u) * 4); height: calc(var(--u) * 4); border: var(--hairline) solid var(--groove); border-radius: 0; background: var(--accent); cursor: grab; }
    &:active::-webkit-slider-thumb { cursor: grabbing; }
    &:focus-visible { outline: none; }
    &:focus-visible::-webkit-slider-thumb { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * 2); }
    &:focus-visible::-moz-range-thumb { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * 2); }
  }
  .s-slider {
    /* the track starts one value inset off the column rule, as a field's text does */
    .s-input { padding-left: calc(var(--u) * 4); }
    .s-track { min-width: 0; }
    /* labelled marks take a line of their own under the row's */
    &:has(.s-mark-labels:not(:empty)) { .s-input { padding-bottom: var(--lh); } .s-track { min-height: var(--row); } }
    .s-marks { display: none; }
    .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: calc(100% - var(--pad) / 2); transform: translateX(-50%); line-height: var(--lh); color: var(--dim); white-space: nowrap; &.s-active { color: inherit; } }
    .s-readout {
      flex: none; align-self: center; width: 6ch; min-width: 6ch; padding: 0 calc(var(--u) * 4) 0 calc(var(--u) * 2); text-align: right;
      @supports (field-sizing: content) { field-sizing: content; width: auto; }
      color: var(--dim);
      font-size: var(--size-readout);
      font-variant-numeric: tabular-nums;
      &.s-readout-lo { padding: 0 calc(var(--u) * 2) 0 0; }
    }
    /* tooltip readout: set in reverse above the thumb, so it reads over whatever row it overhangs */
    .s-tooltip {
      position: absolute; bottom: calc(50% + var(--u) * 3); transform: translateX(-50%); z-index: 2;
      padding: var(--u) calc(var(--u) * 1.5);
      background: light-dark(black, white); color: light-dark(white, black);
      font-family: var(--value-font); font-size: var(--size-readout); line-height: 1;
      font-variant-numeric: tabular-nums; white-space: nowrap; pointer-events: none;
    }
    /* interval: the same groove, the span between the thumbs in its fill */
    &.s-multiple .s-interval-track {
      align-self: center; height: calc(var(--u) * 2);
      border: var(--hairline) solid var(--rule);
      background: var(--groove);
      &::before { content: ''; position: absolute; inset-block: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type="range"] { height: 100%; border: none; background: transparent; }
    }
  }

  /* ── Button ── */
  .s-button {
    padding: var(--section-gap) 0 calc(var(--inset) * 2);
    .s-label-group { justify-content: center; }
    /* the gap sets the actions off the form; a second row of actions follows at the inset */
    & + .s-button { padding-top: 0; }
    button {
      width: 100%;
      background: var(--fill);
      border: var(--hairline) solid var(--rule);
      font-family: var(--title-font);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: var(--size-button);
      /* optical lift: uppercase-only ink reads a hair low when geometrically
         centred — raise it 1px (reference buttons carry the same correction) */
      padding: calc(var(--u) * 4 - 1px) calc(var(--u) * 5) calc(var(--u) * 4 + 1px);
      cursor: pointer;
      transition: background-color 120ms, filter 120ms, transform 120ms;
      &:hover { background: var(--fill-hover); }
      &:active { filter: brightness(.9); transform: scale(0.96); }
      &:focus-visible { outline: var(--hairline) solid var(--accent); outline-offset: calc(var(--hairline) * -1); }
    }
    &.s-secondary button, button.s-secondary {
      background: transparent;
      color: inherit;
      &:hover { background: var(--fill-hover); }
      &.s-selected { background: var(--fill); }
    }
  }

  /* ── Folder ── */
  .s-folder {
    /* a heading row; the first row's rule closes it */
    > summary {
      min-height: var(--row);
      padding: 0 var(--pad);
      &::after { display: none; }
    }
    .s-content { gap: 0; }
  }

  /* ── Code: monospace at 14px, the optical size of the serif values ── */
  .s-textarea.s-code textarea { font-family: var(--code-font); font-size: calc(14 * var(--scale) * var(--length)); }

  /* ── Separator: the rows' rule, set off between equal gaps (with the next row's rule, a double rule);
     a labelled one is a heading row ── */
  .s-separator { height: var(--hairline); background: var(--rule); opacity: 1; }
  .s-separator-labeled { height: auto; background: none; align-items: center; padding: 0 var(--pad); &::before, &::after { display: none; } }
  .s-separator-label { opacity: ${reads(60) / 100}; }

  /* ── Knob: inset off the column rule and inside its row, as a field's value is ── */
  .s-knob .s-input { padding-left: calc(var(--u) * 4); align-items: center; }
  .s-knob-dial { width: calc(var(--u) * 6); height: calc(var(--u) * 6); }

  /* ── Vector: axis letters start one value inset off the column rule ── */
  .s-vector .s-input { padding-left: calc(var(--u) * 4); }
  .s-vec-label { opacity: ${reads(55) / 100}; }

  /* ── Color ── */
  .s-color {
    &.s-picker .s-color-input {
      input[type="color"] { position: static; flex: none; width: calc(var(--u) * 6); height: calc(var(--u) * 6); }
      input[type="text"] { width: 0; }
    }
    .s-color-input {
      input[type="text"] { font-variant-numeric: tabular-nums; }
      input[type="color"] { border: var(--hairline) solid var(--rule); padding: 0; margin-left: calc(var(--u) * 4); }
    }
    /* the code is as wide as its nine characters (narrower only in a narrow host); the alpha slider takes what is left */
    &.s-rgba .s-color-input input[type="text"] { flex: 0 1 auto; width: calc(11ch + var(--u) * 8); }
    /* the slider's groove, showing the colour's ramp over a checkerboard instead of the fill */
    &.s-rgba .s-color-input .s-alpha { width: 0; background: linear-gradient(to right, transparent, var(--c)), conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / calc(8 * var(--length)) calc(8 * var(--length)); }
  }
}`

  return baseCSS + '\n' + overrides
}
