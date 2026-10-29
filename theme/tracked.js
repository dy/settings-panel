/**
 * Tracked theme: a phone's settings sheet in slate and one bright accent.
 *
 * Reproduces a settings screen the owner supplied (a blue bar over a slate sheet; Notifications,
 * Style, Auto refresh), then extends it to every control. Its signature is the lettering: every
 * label and heading in capitals tracked wide (a third of an em, half an em in the headings), set
 * against dark wells. Controls are wells cut a step below the sheet, corners of 4px: a switch is
 * a well with a square knob (grey off, the accent on), a select and a colour are wells with a
 * small triangle at their end, a segmented choice is a strip of wells with the chosen one sunk
 * deeper. The slider is the exception, a thin rail: accent to the value, white past it, a round
 * accent knob. The panel's title is a bar of the accent; each group is a band of its own tone,
 * headed by a darker bar.
 *
 * Axes: shade (the sheet), accent (the bar, the on-states and the fill), spacing, size, weight.
 *
 * tracked(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, ink as legible, mix } from './color.js'

export default function tracked({
  shade = '#52535b',
  accent = '#2196f3',
  spacing = 1,
  weight = 600,
  size = 1,
  font,
} = {}) {
  const { dark, accent: acc, onAccent } = resolveRoles(shade, accent)
  // the bar's mark is large and bold: white wherever it holds 3:1 on the accent (the original's white bolt on its blue)
  const onBar = legible(acc, 3, '#ffffff')
  // the sheet's tones, a step apart: the heading bar and the wells below it, a band lifted above it (on a light sheet
  // the steps are shallower, the band a shade below it, and the rail past the value a well where white would vanish)
  const bar = mix(shade, '#000', dark ? .2 : .07), well = mix(shade, '#000', dark ? .45 : .13), band = mix(shade, dark ? '#fff' : '#000', dark ? .12 : .035)
  const knob = dark ? mix(shade, '#fff', .06) : mix(shade, '#000', .3), rail = dark ? '#fff' : mix(shade, '#000', .2)
  // lettering: near-white on a dark sheet, near-black on a light one, held to 4.5:1 on the sheet, its bands and its wells
  // (one polarity: on a mid sheet the lettering stays on its side rather than flipping between grounds)
  const side = dark ? 1 : 0, on = (grounds, tone) => grounds.reduce((t, g) => legible(g, 4.5, t, side), tone)
  const fg = on([shade, band, well], dark ? '#f2f3f5' : '#1d1e22'), label = on([shade, band], mix(fg, shade, .2)), placeholder = on([well], mix(fg, well, .35))
  const tri = c => `url("data:image/svg+xml,%3Csvg viewBox='0 0 8 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0H8L4 6Z' fill='${encodeURIComponent(c)}'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 5 L4.5 8 L10.5 1.5' fill='none' stroke='%23000' stroke-width='2.4' stroke-linecap='square'/%3E%3C/svg%3E")`

  return baseCSS + `
.s-panel {
  ${metrics({ size, spacing, font }, { body: 12, fontSize: 12, lineHeight: 16, controlHeight: 38, rowGap: 14, columnGap: 14, sectionGap: 0, panelPadding: 18, fontFamily: "'Montserrat', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif" })}

  --bg: ${shade};
  --fg: ${fg};
  --label: ${label};
  --placeholder: ${placeholder};
  --bar: ${bar};
  --well: ${well};
  --band: ${band};
  --knob: ${knob};
  --rail: ${rail};
  --accent: ${acc};
  --on-accent: ${onAccent};
  --on-bar: ${onBar};
  --tri: ${tri(fg)};
  --h: var(--control-height);
  --r: calc(4 * var(--length));
  --track: calc(5 * var(--length));       /* the slider's rail */
  --dot: calc(17 * var(--length));        /* the slider's knob */
  --tracking: .3em;
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg); color: var(--fg); border: none; border-radius: 0; box-shadow: 0 calc(2 * var(--length)) calc(10 * var(--length)) rgb(0 0 0 / .18);
  padding: 0 var(--panel-padding) var(--panel-padding); min-width: 0; overflow: clip;
  font-family: var(--font-family); font-size: var(--font-size); line-height: var(--line-height); font-weight: ${weight}; -webkit-font-smoothing: antialiased;

  /* ── Title: a bar of the accent across the sheet, its word centred and tracked ── */
  > summary, > .s-panel-title {
    margin: 0 calc(-1 * var(--panel-padding)); padding: 0 var(--panel-padding); min-height: calc(var(--h) * 1.9);
    background: var(--accent); color: var(--on-bar); justify-content: center; position: relative;
    font-size: calc(22 * var(--length)); font-weight: 800; text-transform: uppercase; letter-spacing: .5em; text-indent: .5em;
    &::after { display: none; } }
  > summary { cursor: pointer; user-select: none; }
  .s-fold-icon { position: absolute; right: var(--panel-padding); width: calc(10 * var(--length)); height: calc(8 * var(--length)); background: currentColor;
    -webkit-mask: var(--tri-mask) center / contain no-repeat; mask: var(--tri-mask) center / contain no-repeat; --tri-mask: ${tri('#000')}; transition: rotate .15s; i { display: none; } }
  &[open] > summary .s-fold-icon { rotate: 180deg; }
  > summary:focus-visible { outline: 2px solid var(--on-bar); outline-offset: -4px; }
  .s-panel-content { gap: var(--row-gap); padding-top: var(--panel-padding); }
  .s-search { position: absolute; left: var(--panel-padding); letter-spacing: 0; text-indent: 0; text-transform: none; }
  .s-search-btn { background: none; border: none; color: inherit; width: calc(20 * var(--length)); height: calc(20 * var(--length)); padding: 0; cursor: pointer;
    &::before { content: ''; display: block; width: 100%; height: 100%; background: currentColor; -webkit-mask: var(--s-search-icon) center / 70% no-repeat; mask: var(--s-search-icon) center / 70% no-repeat; } }
  .s-search-input { background: var(--well); color: var(--fg); border: none; border-radius: var(--r); height: calc(26 * var(--length)); padding: 0 calc(8 * var(--length)); margin-left: calc(6 * var(--length)); font: inherit; font-size: var(--font-size); &::placeholder { color: var(--placeholder); } }

  /* ── Rows: tracked capitals left, the control right ── */
  .s-control { align-items: center; gap: var(--column-gap); min-height: var(--h); }
  .s-label-group { width: 50%; max-width: none; min-width: 0; }
  .s-control:is(.s-boolean, .s-dropdown, .s-picker) > .s-label-group { width: 62%; }   /* a switch, a select or a swatch is compact: its label takes more */
  .s-control > .s-label-group:has(.s-label[hidden]):not(:has(.s-hint)) { display: none; }   /* no label: the control takes the row */
  .s-label { color: var(--label); font-size: calc(10 * var(--length)); text-transform: uppercase; letter-spacing: var(--tracking); }
  .s-hint { color: var(--label); opacity: 1; font-size: calc(9 * var(--length)); letter-spacing: .06em; }
  .s-control:has(> .s-label-group .s-hint) { align-items: flex-start; > .s-label-group { padding-top: calc((var(--h) - var(--line-height)) / 2); } }
  .s-title { display: inline-grid; place-items: center; width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: 50%; background: var(--well); font-size: calc(9 * var(--length)); letter-spacing: 0; cursor: help;
    &:is(:hover, :focus-visible) + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; margin-top: 4px; padding: 6px 8px; border-radius: var(--r); background: var(--well); color: var(--fg); font-size: calc(11 * var(--length)); letter-spacing: .04em; text-transform: none; width: max-content; max-width: 30ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Wells: every field a step below the sheet ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--well); color: var(--fg); border: none; border-radius: var(--r); font: inherit; font-weight: ${weight};
    &::placeholder { color: var(--placeholder); opacity: 1; }
    &:focus-visible { outline: 2px solid var(--accent); outline-offset: 0; } }
  input[type="text"], input[type="number"], select { height: var(--h); padding: 0 calc(12 * var(--length)); }
  textarea { padding: calc(10 * var(--length)) calc(12 * var(--length)); }
  input[type="number"] { font-variant-numeric: tabular-nums; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  select { appearance: none; -webkit-appearance: none; cursor: pointer; padding-right: calc(30 * var(--length));
    background: var(--tri) right calc(12 * var(--length)) center / calc(8 * var(--length)) no-repeat, var(--well);
    option { background: var(--well); color: var(--fg); } }
  .s-text input[type="text"], .s-select.s-dropdown select { flex: 1; min-width: 0; }
  .s-select.s-dropdown .s-input { justify-content: flex-end; }
  .s-select.s-dropdown select { flex: 0 1 auto; min-width: calc(var(--h) * 2.4); }
  .s-textarea { align-items: flex-start; > .s-label-group { padding-top: calc(10 * var(--length)); }
    textarea { flex: 1; resize: none; field-sizing: content; min-height: calc(var(--lh) * 3 + 20 * var(--length)); max-height: 50vh; } }

  /* ── Number: a well, its steppers two small triangles at its end ── */
  .s-number { .s-input { position: relative; }
    input[type="number"] { flex: 1; text-align: right; padding-right: calc(30 * var(--length)); &.s-scrub { cursor: ew-resize; } }
    .s-step { position: absolute; right: calc(10 * var(--length)); top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: calc(3 * var(--length));
      button { width: calc(10 * var(--length)); height: calc(7 * var(--length)); padding: 0; border: none; font-size: 0; background: var(--fg); opacity: .8; cursor: pointer;
        -webkit-mask: ${tri('#000')} center / contain no-repeat; mask: ${tri('#000')} center / contain no-repeat;
        &.s-step-up { rotate: 180deg; } &:hover { opacity: 1; background: var(--accent); } } } }

  /* ── Vector: a well per axis, its letter tracked ahead of the value ── */
  .s-vector { .s-input { gap: calc(8 * var(--length)); }
    .s-vec-axis { height: var(--h); gap: 0; padding-left: calc(10 * var(--length)); background: var(--well); border-radius: var(--r); &:focus-within { outline: 2px solid var(--accent); } }
    .s-vec-label { color: var(--label); font-size: calc(10 * var(--length)); letter-spacing: var(--tracking); }
    input[type="number"] { height: 100%; padding: 0 calc(10 * var(--length)); text-align: right; &:focus-visible { outline: none; } } }

  /* ── Buttons: a bar of the heading's tone, the word tracked; the primary in the accent ── */
  button { font: inherit; cursor: pointer; }
  .s-button { .s-input { flex-wrap: wrap; gap: calc(8 * var(--length)); }
    button { flex: 1; min-width: 0; min-height: var(--h); padding: 0 calc(10 * var(--length)); border: none; border-radius: var(--r); background: var(--accent); color: var(--on-accent);
      font-size: calc(11 * var(--length)); font-weight: 700; text-transform: uppercase; letter-spacing: .2em; text-indent: .2em;
      &:hover { filter: brightness(1.08); } &:active { filter: brightness(.92); }
      &:disabled, &[aria-busy="true"] { opacity: .45; cursor: not-allowed; filter: none; }
      &:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; } }
    &.s-secondary button, button.s-secondary { background: var(--bar); color: var(--fg); } }

  /* ── Boolean: a well with a square knob, grey at the left off, the accent at the right on ── */
  .s-boolean { input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; } .s-input { cursor: pointer; justify-content: flex-end; }
    &.s-switch .s-track { position: relative; width: calc(var(--h) * 2); height: var(--h); border-radius: calc(6 * var(--length)); background: var(--well);
      &::after { content: ''; position: absolute; top: calc(5 * var(--length)); left: calc(5 * var(--length)); width: calc(var(--h) - 10 * var(--length)); aspect-ratio: 1; border-radius: var(--r); background: var(--knob); transition: translate .18s cubic-bezier(.3, 1.2, .5, 1), background-color .18s; } }
    &.s-switch:has(input:checked) .s-track::after { translate: calc(var(--h)) 0; background: var(--accent); }
    &.s-checkbox .s-track { display: grid; place-items: center; width: calc(24 * var(--length)); height: calc(24 * var(--length)); border-radius: var(--r); background: var(--well);
      &::after { content: ''; width: 60%; height: 60%; border-radius: calc(2 * var(--length)); background: var(--accent); opacity: 0; transition: opacity .12s; } }
    &.s-checkbox:has(input:checked) .s-track::after { opacity: 1; }
    &.s-toggle .s-track { display: grid; place-items: center; min-width: calc(var(--h) * 2); height: var(--h); padding: 0 calc(12 * var(--length)); border-radius: var(--r); background: var(--well); color: var(--label);
      font-size: calc(11 * var(--length)); text-transform: uppercase; letter-spacing: var(--tracking); text-indent: var(--tracking); &::after { content: 'Off'; } }
    &.s-toggle:has(input:checked) .s-track { background: var(--accent); color: var(--on-accent); &::after { content: 'On'; } }
    &:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; } }

  /* ── Slider: a thin rail, the accent to the value, white past it, a round accent knob ── */
  .s-slider input[type="range"], .s-color .s-alpha {
    width: 100%; height: var(--track); -webkit-appearance: none; appearance: none; border-radius: var(--track); cursor: pointer;
    background: linear-gradient(to right, var(--accent) 0 var(--p, 0%), var(--rail) var(--p, 0%));
    &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--dot); height: var(--dot); border-radius: 50%; border: none; background: var(--accent); box-shadow: 0 1px 3px rgb(0 0 0 / .3); }
    &::-moz-range-thumb { width: var(--dot); height: var(--dot); border-radius: 50%; border: none; background: var(--accent); }
    &:focus-visible { outline: none; &::-webkit-slider-thumb { outline: 2px solid var(--fg); outline-offset: 2px; } } }
  .s-slider {
    .s-track { height: var(--h); margin: 0; }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(14 * var(--length)); }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark { position: absolute; top: 50%; width: calc(3 * var(--length)); height: calc(3 * var(--length)); border-radius: 50%; translate: -50% -50%; background: var(--well); }
    .s-mark-label { position: absolute; top: 100%; translate: -50% 0; font-size: calc(10 * var(--length)); color: var(--label); letter-spacing: .06em; white-space: nowrap; }
    .s-readout { flex: 0 0 auto; field-sizing: content; width: auto; min-width: 5ch; text-align: right; background: transparent; height: auto; padding: 0; font-variant-numeric: tabular-nums; cursor: ew-resize; &:focus-visible { outline: 2px solid var(--accent); } }
    .s-tooltip { padding: 3px 8px; border-radius: var(--r); background: var(--well); color: var(--fg); font-size: calc(11 * var(--length)); white-space: nowrap; }
    &.s-multiple .s-interval-track { position: relative; height: var(--track); margin: calc((var(--h) - var(--track)) / 2) 0; border-radius: var(--track); background: var(--rail);
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); }
      input[type="range"] { background: transparent; height: 100%; } } }

  /* ── Choices: a strip of wells, the chosen one sunk deeper; lists of wells with the accent inside ── */
  .s-select {
    &.s-segmented { .s-input { flex: 1; gap: 0; }
      button { flex: 1; min-width: 0; height: calc(var(--h) * 1.3); border: none; border-radius: 0; background: var(--bar); color: var(--label); padding: 0 calc(4 * var(--length));
        font-size: calc(11 * var(--length)); text-transform: uppercase; letter-spacing: .12em; text-indent: .12em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        &:first-child { border-radius: var(--r) 0 0 var(--r); } &:last-child { border-radius: 0 var(--r) var(--r) 0; }
        &:hover { color: var(--fg); } &.s-selected { background: var(--well); color: var(--fg); }
        &:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; } } }
    &.s-radio, &.s-checkboxes { align-items: flex-start;
      > .s-label-group { padding-top: calc((24 * var(--length) - var(--line-height)) / 2); }
      .s-input { flex-direction: column; align-items: stretch; gap: calc(8 * var(--length)); }
      .s-input label { display: flex; align-items: center; gap: calc(10 * var(--length)); cursor: pointer; min-height: calc(24 * var(--length)); } }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; flex: none; width: calc(24 * var(--length)); height: calc(24 * var(--length)); border-radius: 50%; background: var(--well); display: grid; place-items: center; cursor: pointer;
      &::after { content: ''; width: 45%; height: 45%; border-radius: 50%; background: var(--accent); opacity: 0; }
      &:checked::after { opacity: 1; } &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } }
    &.s-checkboxes { input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { flex: none; display: grid; place-items: center; width: calc(24 * var(--length)); height: calc(24 * var(--length)); border-radius: var(--r); background: var(--well);
        &::after { content: ''; width: 60%; height: 60%; border-radius: calc(2 * var(--length)); background: var(--s-color, var(--accent)); opacity: 0; } }
      label:has(input:checked) .s-track::after { opacity: 1; }
      label:has(input:focus-visible) .s-track { outline: 2px solid var(--accent); outline-offset: 2px; } } }

  /* ── Colour: a well holding a wide swatch, a triangle at its end; the code beside it ── */
  .s-color {
    &.s-picker .s-color-input { position: relative; flex: 0 1 calc(var(--h) * 4.2); margin-left: auto; height: var(--h); padding: calc(6 * var(--length)) calc(30 * var(--length)) calc(6 * var(--length)) calc(6 * var(--length)); border-radius: var(--r);
      background: var(--tri) right calc(12 * var(--length)) center / calc(8 * var(--length)) no-repeat, var(--well);
      input[type="color"] { position: static; flex: 1; width: auto; height: 100%; padding: 0; border: none; border-radius: calc(3 * var(--length)); cursor: pointer;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: calc(3 * var(--length)); } &::-moz-color-swatch { border: none; border-radius: calc(3 * var(--length)); }
        &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } }
      input[type="text"] { position: absolute; inset: 0; opacity: 0; pointer-events: none; } }
    &.s-rgba .s-color-input { gap: calc(8 * var(--length));
      input[type="color"] { width: var(--h); height: var(--h); padding: 0; border: none; border-radius: var(--r); &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: var(--r); } }
      .s-alpha { width: 0; background: linear-gradient(to right, transparent, var(--c)), conic-gradient(#c4c4c4 90deg, #fff 0 180deg, #c4c4c4 0 270deg, #fff 0) 0 0 / calc(8 * var(--length)) calc(8 * var(--length)); }
      input[type="text"] { flex: 0 1 auto; min-width: 0; width: calc(10ch + 24 * var(--length)); } }
    &.s-swatches { .s-input { flex-wrap: wrap; justify-content: flex-end; gap: calc(8 * var(--length)); }
      button { width: calc(24 * var(--length)); height: calc(24 * var(--length)); padding: 0; border: none; border-radius: var(--r); box-shadow: inset 0 0 0 1px rgb(0 0 0 / .2);
        &.s-selected { outline: 2px solid var(--fg); outline-offset: 2px; } &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } } } }

  /* ── Info, separators, pad, knob ── */
  .s-info .s-monitor { color: var(--fg); opacity: 1; font-variant-numeric: tabular-nums; }
  .s-separator { height: 1px; background: var(--bar); opacity: 1; }
  .s-separator-labeled { height: auto; background: none; &::before, &::after { height: 1px; background: var(--bar); opacity: 1; } }
  .s-separator-label { color: var(--label); font-size: calc(10 * var(--length)); text-transform: uppercase; letter-spacing: var(--tracking); opacity: 1; }
  .s-xy { align-items: flex-start; > .s-label-group { padding-top: calc(10 * var(--length)); } }
  .s-pad { background: var(--well); border: none; border-radius: var(--r);
    .s-pad-x, .s-pad-y { background: color-mix(in oklab, var(--fg), transparent 85%); }
    .s-pad-dot { width: calc(14 * var(--length)); height: calc(14 * var(--length)); border-radius: 50%; background: var(--accent); border: none; box-shadow: 0 1px 3px rgb(0 0 0 / .3); } }
  .s-knob-dial { width: var(--h); height: var(--h); border-radius: 50%; background: var(--well); border: none; i { background: var(--accent); width: calc(3 * var(--length)); } }
  .s-knob-val { color: var(--fg); opacity: 1; font-variant-numeric: tabular-nums; }

  /* ── Groups: a band of the sheet's own tone across it, headed by a darker bar, the title tracked wide ── */
  .s-folder:not(.s-section) { margin: 0 calc(-1 * var(--panel-padding)); padding: var(--panel-padding); gap: 0;
    &:nth-child(even of .s-folder:not(.s-section)) { background: linear-gradient(160deg, var(--band), color-mix(in oklab, var(--band), var(--bg) 50%)); }
    &:first-child { margin-top: calc(-1 * var(--panel-padding)); }
    &:last-child { margin-bottom: calc(-1 * var(--panel-padding)); }
    > summary { min-height: calc(var(--h) * 1.3); padding: 0 calc(14 * var(--length)); border-radius: var(--r); background: var(--bar); color: var(--fg); gap: calc(10 * var(--length));
      font-size: calc(12 * var(--length)); font-weight: 800; text-transform: uppercase; letter-spacing: .5em;
      &::after { content: ''; margin-left: auto; width: calc(8 * var(--length)); height: calc(6 * var(--length)); background: var(--tri) center / contain no-repeat; opacity: .7; transition: rotate .15s; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } }
    &[open] > summary::after { rotate: 180deg; }
    .s-content { gap: var(--row-gap); padding: var(--panel-padding) calc(10 * var(--length)) 0; } }
  .s-folder.s-section > summary { font-size: calc(11 * var(--length)); text-transform: uppercase; letter-spacing: var(--tracking); color: var(--label); &::after { display: none; } }
}`
}
