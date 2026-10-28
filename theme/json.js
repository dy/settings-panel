/**
 * json – the panel as the JSON object it edits: one entry per line, "key": value, folders as nested { }.
 *
 * Every value stays its control, set as a JSON literal and selectable as text: text, a dropdown's choice
 * and a colour are quoted strings (the dropdown opens its options); a number, a slider's readout and a
 * knob's value are numbers that edit and scrub (a number's ": " drags too); a boolean reads true / false and
 * toggles on click; a range and a vector are [a, b], each part its own field; an XY pad is [x, y] over
 * the pad, which drags. Choices in a row (segmented, radio) stand side by side, the chosen one lit.
 * Buttons are not data: each is its name called, `name()`. Separators are blank lines. Keys, braces,
 * quotes and commas are drawn by CSS, so a text selection copies the values, not the punctuation.
 *
 * Colours: VS Code's Default Light+ / Dark+ JSON tokens (microsoft/vscode extensions/theme-defaults:
 * property names #0451a5 / #9cdcfe, strings #a31515 / #ce9178, numbers #098658 / #b5cea8, true/false
 * #0000ff / #569cd6), each held to 4.5:1 on the shade; `accent` recolours the keys.
 *
 * Axes: shade, accent, size, spacing, font.
 *
 * json(axes?) → CSS string
 */
import baseCSS from './base.js'
import metrics from './metrics.js'
import { resolveRoles, ink, mix } from './color.js'

export default function json({ shade = '#ffffff', accent, size = 1, spacing = 1, font } = {}) {
  const { dark } = resolveRoles(shade, accent)
  const on = c => ink(shade, 4.5, c)
  const tone = dark ? { key: '#9cdcfe', str: '#ce9178', num: '#b5cea8', lit: '#569cd6', fg: '#d4d4d4' } : { key: '#0451a5', str: '#a31515', num: '#098658', lit: '#0000ff', fg: '#000000' }
  // an entry: a row that holds a value (buttons hold none; separators are not rows)
  const entry = '.s-control:not(.s-button, .s-separator)'
  const body = 12
  return baseCSS + `
.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 12, lineHeight: 18, controlHeight: 18, inset: 0, rowGap: 0, columnGap: 8, sectionGap: 0, panelPadding: 12, fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" })}
  --bg: ${shade}; --fg: ${on(tone.fg)}; --key: ${on(accent ?? tone.key)};
  --str: ${on(tone.str)}; --num: ${on(tone.num)}; --lit: ${on(tone.lit)};
  --muted: ${[shade, mix(shade, tone.fg, dark ? .08 : .05)].reduce((t, g) => ink(g, 4.6, t), dark ? '#858585' : '#767676')};   /* on the row and under the pointer's wash */
  --hover: color-mix(in srgb, var(--fg) ${dark ? 8 : 5}%, transparent);
  --accent: var(--key);
  --indent: calc(2ch * var(--spacing));
  color-scheme: ${dark ? 'dark' : 'light'};
  background: var(--bg); color: var(--fg);
  padding: var(--panel-padding);
  font: var(--font-size)/var(--line-height) var(--font-family);
  font-variant-numeric: tabular-nums;
  ::selection { background: color-mix(in srgb, var(--key) 30%, transparent); }

  /* ── The object: braces around the entries; a title is the opening brace, folded it reads {…} ── */
  > summary, > .s-panel-title { font-size: 0; color: transparent; gap: 0;
    &::before { content: '{'; font-size: var(--font-size); color: var(--fg); } }
  > summary .s-fold-icon { display: none; }
  &:is(details):not([open]) > summary::after { content: '…}'; font-size: var(--font-size); color: var(--muted); }
  .s-panel-content, .s-folder .s-content { gap: var(--row-gap); padding-left: var(--indent); }
  > .s-panel-content::after { content: '}'; margin-left: calc(-1 * var(--indent)); }
  &:not(:has(> summary, > .s-panel-title)) > .s-panel-content::before { content: '{'; margin-left: calc(-1 * var(--indent)); }

  /* ── An entry: "key": value, a comma when another entry follows ── */
  /* the value keeps its column: a value too long for the line wraps under itself, its comma glued to its end */
  .s-control { flex-direction: row; align-items: baseline; flex-wrap: nowrap; gap: 0; min-height: var(--line-height); --comma: ''; }
  ${entry}:not(.s-folder)::before { content: '"' attr(data-key) '"'; flex: none; color: var(--key); white-space: pre; }
  ${entry}:not(.s-folder):has(~ ${entry}) { --comma: ','; }
  /* an entry with its label hidden still reads "key": value, the colon on the key */
  ${entry}:not(.s-folder):has(> .s-label-group[hidden])::before { content: '"' attr(data-key) '": '; }
  .s-label-group { display: inline; width: auto; min-width: 0; max-width: none; font-size: 0; flex: none;
    .s-label, .s-hint { display: none; }
    .s-label-row { display: inline; }
    /* a title's ? stays by its key, a comment's tone, its text a tooltip */
    .s-title { font-size: var(--font-size); color: var(--muted); margin-left: .5ch; cursor: help; }
    .s-title-text { font-size: var(--font-size); padding: 0 1ch; background: var(--fg); color: var(--bg); max-width: 40ch; }
    &::after { content: ': '; font-size: var(--font-size); white-space: pre; } }
  .s-input { flex: 0 1 auto; display: inline-flex; align-items: baseline; gap: 0; min-width: 0; max-width: 100%; flex-wrap: wrap;
    &::after { content: var(--comma); color: var(--fg); } }
  .s-control:not(.s-folder):hover { background: linear-gradient(var(--hover), var(--hover)) calc(-1 * var(--panel-padding)) 0 / 100vw 100% no-repeat; }

  /* ── Literals: fields sized to their text, coloured by kind ── */
  input, select, textarea, button { font: inherit; color: inherit; }
  input[type=text], input[type=number], select, textarea {
    field-sizing: content; min-width: 1ch; width: auto; max-width: 100%; height: auto;
    padding: 0; border: 0; border-radius: 2px; background: none; line-height: inherit; box-shadow: none;
    &:hover { text-decoration: underline; }
    &:focus { outline: 1px solid var(--key); outline-offset: 1px; text-decoration: none; }
    &::placeholder { color: var(--muted); }
  }
  input[type=number] { -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } }
  select { appearance: none; -webkit-appearance: none; cursor: pointer; option { background: var(--bg); color: var(--fg); } }
  textarea { resize: none; max-height: 50vh; }
  .s-step, .s-track, .s-marks, .s-mark-labels, .s-hint { display: none; }
  /* a slider whose readout is a tooltip prints it in place */
  .s-slider .s-tooltip { position: static; transform: none; translate: none; opacity: 1; visibility: visible; padding: 0; background: none; color: inherit; font: inherit; }
  .s-slider .s-track:has(.s-tooltip) { display: inline; width: auto; height: auto; background: none; > :not(.s-tooltip) { display: none; } &::before, &::after { content: none; } }
  /* and one with no readout prints its value from the track */
  .s-slider:not(:has(.s-readout)) .s-track:not(:has(.s-tooltip)) { display: inline; width: auto; height: auto; background: none; > * { display: none; } &::before { content: attr(data-value); } &::after { content: none; } }

  /* strings: quoted */
  /* a string stays one literal: its quotes hold to it, a long one runs on in its field (scrolling there) */
  :is(.s-text, .s-dropdown) .s-input { flex-wrap: nowrap; > :is(input, select) { flex: 0 1 auto; min-width: 1ch; } }
  :is(.s-text, .s-textarea, .s-dropdown, .s-color) .s-input { color: var(--str);
    &::before { content: '"'; } &::after { content: '"' var(--comma); color: inherit; } }
  .s-color .s-color-input { display: contents; }
  .s-color .s-color-input input[type=text] { flex: none; }
  .s-color input[type=color] { order: -1; position: relative; top: .15em; flex: none; width: 1em; height: 1em; margin-right: .5ch; padding: 0; border: 1px solid var(--muted); border-radius: 2px; background: none; cursor: pointer;
    &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: 0; border-radius: 1px; } &::-moz-color-swatch { border: 0; } }
  .s-color .s-alpha { display: none; }
  .s-color.s-swatches .s-input { &::before { content: none; } &::after { content: var(--comma); color: var(--fg); } }
  .s-color.s-swatches button { width: 1em; height: 1em; margin-right: .5ch; padding: 0; border: 1px solid var(--muted); border-radius: 2px; cursor: pointer; align-self: center;
    &.s-selected { outline: 1px solid var(--fg); outline-offset: 1px; } }
  .s-info .s-monitor { color: var(--str); opacity: 1; white-space: pre-wrap; &::before, &::after { content: '"'; } }

  /* numbers: a number, a slider's readout, a knob's value; a slider's readout scrubs */
  :is(.s-number, .s-slider, .s-vector, .s-xy, .s-knob, .s-graph) .s-input { color: var(--num); }
  .s-slider .s-readout { flex: none; width: auto; min-width: 1ch; text-align: left; cursor: ew-resize; }
  /* a range, a vector, a pad: [a, b] */
  :is(.s-multiple, .s-vector, .s-xy) .s-input { &::before { content: '['; color: var(--fg); } &::after { content: ']' var(--comma); } }
  .s-multiple .s-interval-track { display: inline; position: static; width: auto; height: auto; background: none;
    &::before { content: ', '; white-space: pre; color: var(--fg); } &::after { content: none; }
    input { display: none; } }
  .s-vector .s-vec-axis { flex: none; display: inline-flex; align-items: baseline; gap: 0; height: auto; min-width: 0; padding: 0; background: none; border: 0; box-shadow: none; }
  .s-vector.s-curve .s-vec-axis { flex: none; }   /* the four print in a line, as a literal */
  .s-vector .s-vec-axis + .s-vec-axis::before { content: ', '; white-space: pre; color: var(--fg); }
  .s-vector :is(.s-vec-label, .s-vec-expand, .s-vec-pad) { display: none; }
  .s-vector input[type=number] { flex: none; text-align: left; }
  :is(.s-xy, .s-graph) .s-input, .s-knob .s-input { position: relative; }
  /* the pad prints its value (its data-value) and still drags and takes the arrow keys */
  :is(.s-xy, .s-graph) .s-pad { position: static; display: inline; width: auto; height: auto; aspect-ratio: auto; background: none; border: 0; box-shadow: none; cursor: move;
    > * { display: none; } &::after { content: attr(data-value); } }
  .s-knob .s-knob-val { position: static; opacity: 1; font-size: inherit; transform: none; translate: none; }
  :is(.s-xy, .s-graph) .s-pad-val { display: none; }   /* the pad prints the value itself */
  .s-knob .s-knob-wrap { display: inline; position: static; width: auto; height: auto; background: none; box-shadow: none; cursor: ns-resize;
    &::before, &::after { content: none; } &:focus-visible { outline: 1px solid var(--key); outline-offset: 1px; } }
  .s-knob .s-knob-dial { display: none; }

  /* true / false: the word is the switch */
  .s-boolean .s-input { color: var(--lit); cursor: pointer; }
  .s-boolean input[type=checkbox] { position: absolute; opacity: 0; width: 0; height: 0; margin: 0; }
  .s-boolean .s-track { display: inline; width: auto; height: auto; background: none; border: 0; box-shadow: none;
    &::before { content: 'false'; } &::after { content: none; } }
  .s-boolean:has(input:checked) .s-track::before { content: 'true'; }
  .s-boolean .s-input:hover .s-track { text-decoration: underline; }
  .s-boolean:has(input:focus-visible) .s-track { outline: 1px solid var(--key); outline-offset: 1px; border-radius: 2px; }

  /* choices in a row: each a quoted string, the chosen one lit */
  .s-select:is(.s-segmented, .s-radio, .s-checkboxes) .s-input { display: block; color: var(--muted); font-size: 0;   /* the markup's spaces between choices take no room */
    > *, &::before, &::after { font-size: var(--font-size); } }
  .s-select:is(.s-segmented, .s-radio, .s-checkboxes) .s-input > :not(:last-child) { margin-right: 1ch; }
  .s-segmented button { display: inline-block; padding: 0; border: 0; background: none; cursor: pointer; color: inherit; box-shadow: none; height: auto;
    &::before, &::after { content: '"'; }
    &.s-selected { color: var(--str); }
    &:hover { text-decoration: underline; } &:focus-visible { outline: 1px solid var(--key); outline-offset: 1px; } }
  .s-select:is(.s-radio, .s-checkboxes) .s-input label { display: inline-flex; vertical-align: baseline; cursor: pointer; &::before, &::after { content: '"'; }
    &:has(input:checked) { color: var(--str); } &:hover { text-decoration: underline; }
    &:has(input:focus-visible) { outline: 1px solid var(--key); outline-offset: 1px; } }
  .s-select:is(.s-radio, .s-checkboxes) :is(input, .s-track) { position: absolute; opacity: 0; width: 0; height: 0; margin: 0; }
  /* the closing quote, bracket and comma ride on the last choice (and a list's [ on the first), so a line never
     breaks between them: an atomic choice and the text after it would otherwise part */
  .s-select:is(.s-segmented, .s-radio, .s-checkboxes) .s-input::after { content: none; }
  .s-select:is(.s-segmented, .s-radio) .s-input > :last-child::after { content: '"' var(--comma); }
  .s-select.s-checkboxes .s-input { > :first-child::before { content: '["'; } > :last-child::after { content: '"]' var(--comma); } > :only-child::before { content: '["'; } }

  /* ── A folder: "key": { … }, its entries indented, its brace closing under its key ── */
  .s-folder { display: block; }
  .s-folder > summary { display: block; list-style: none; cursor: pointer; font-size: 0; color: var(--fg); padding: 0; background: none;
    &::-webkit-details-marker { display: none; }
    &::before { content: '"' attr(data-key) '"'; font-size: var(--font-size); color: var(--key); }
    &::after { content: ': {'; font-size: var(--font-size); white-space: pre; }
    &:hover::before { text-decoration: underline; } }
  .s-folder:not([open]) > summary::after { content: ': {…}'; }
  .s-folder:not([open]):has(~ ${entry}) > summary::after { content: ': {…},'; }
  .s-folder > .s-content::after { content: '}'; margin-left: calc(-1 * var(--indent)); }
  .s-folder:has(~ ${entry}) > .s-content::after { content: '},'; }

  /* ── Filter: a prompt after the brace ── */
  .s-search { gap: 1ch; font-size: var(--font-size); }
  .s-search-btn { background: var(--muted); }
  .s-search-input { color: var(--fg); font: inherit; &::placeholder { color: var(--muted); } }

  /* ── Not data: separators a blank line, buttons their names called ── */
  .s-separator { height: var(--line-height); background: none; opacity: 1; margin: 0; &::before, &::after { content: none; } }
  .s-separator-label { display: none; }
  .s-button .s-input { gap: 0 2ch; }
  .s-button > .s-label-group { display: none; }   /* a key is no entry: no ": " before it */
  .s-button button { padding: 0; border: 0; background: none; color: var(--key); cursor: pointer; height: auto; box-shadow: none;
    &::after { content: '()'; color: var(--fg); }
    &:hover { text-decoration: underline; }
    &:focus-visible { outline: 1px solid var(--key); outline-offset: 1px; border-radius: 2px; }
    &:disabled { color: var(--muted); cursor: default; } }
  .s-button .s-icon { display: none; }
  .s-button button.s-icon-only::before { content: attr(aria-label); }
}`
}
