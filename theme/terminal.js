/**
 * Terminal theme — monospace, cell grid, inverse video
 *
 * Every dimension is a whole number of character cells: the label column, the
 * gaps, the wells, the thumb — all measured in `ch` and line-heights, so the
 * panel lays out like a TUI on a real terminal grid. Depth doesn't exist:
 * state is drawn the way a terminal draws it — inverse video for selected and
 * pressed, a cursor bar for focus, dim text for secondary, bracketed glyphs
 * (`[x]`, `( )`, `[ RUN ]`) for controls. One 1px frame around the panel with
 * the title cut into its top edge; folders indent their rows behind a tree
 * guide.
 *
 * Axes: shade (screen color — dark by default, a light shade gives a paper
 * terminal), accent (phosphor: on / selected / live values), spacing (row
 * gap, in fractions of a line), size (type scale), weight, leading (line
 * height as a multiple of the type size — the cell height). roundness is
 * accepted and ignored: a terminal has no corners.
 *
 * terminal(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles } from './color.js'

export default function terminal({
  shade = '#0e1013',
  accent,
  spacing = 1,
  weight = 400,
  size = 1,
  leading = 1.6,
  font,
} = {}) {
  const { dark, fg, accent: acc } = resolveRoles(shade, accent)
  const phosphor = accent != null ? acc : dark ? '#5be49b' : '#0b7f5c'
  // Dim text and lines are mixes of fg into bg, so any shade keeps the same
  // contrast ladder: text 100%, dim 55%, line 22%, well 8%.
  const mix = pct => `color-mix(in oklab, var(--fg) ${pct}%, var(--bg))`

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, {fontSize: 13, fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace", lineHeight: 20, controlHeight: 20, rowGap: 10})}

  --bg: ${shade};
  --fg: ${fg};
  --accent: ${phosphor};
  --dim: ${mix(55)};
  --line: ${mix(22)};
  --well: ${mix(dark ? 8 : 6)};
  --well-hi: ${mix(dark ? 14 : 10)};

  --weight: ${weight};
  --roundness: 0;
  --r: 0;
  /* the cell: type size × leading, snapped to whole pixels, is one line; --u is a quarter line */
  --fs: var(--font-size);
  --u: round(nearest, calc(var(--fs) * ${leading} / 4), 1px);

  --line-height: calc(var(--u) * 4);
  --control-height: var(--line-height);
  --inset: calc(1ch * var(--spacing));
  --pad-i: var(--inset);
  --label-w: 12ch;

  --s-clear-icon: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 2 L8 8 M8 2 L2 8' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='square'/%3E%3C/svg%3E");
  color-scheme: ${dark ? 'dark' : 'light'};

  position: relative;
  background: var(--bg);
  color: var(--fg);


  font-weight: var(--weight);
  line-height: var(--lh);
  font-variant-numeric: tabular-nums;
  border: 1px solid var(--line);
  border-radius: 0;
  padding: calc(var(--lh) * 1.5) 2ch var(--lh);
  min-width: 40ch;
  max-width: 72ch;
  -webkit-font-smoothing: antialiased;
  ::selection { background: var(--accent); color: var(--bg); }

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title — cut into the top edge of the frame ── */
  > summary, > .s-panel-title {
    position: absolute; top: calc(var(--lh) * -0.5); left: 1ch;
    height: var(--lh); padding: 0 1ch;
    background: var(--bg);
    color: var(--accent);
    font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
    white-space: nowrap;
    &::after { display: none; }
  }
  > summary { cursor: pointer; user-select: none; }
  > summary:focus-visible { outline: none; .s-fold-icon { background: var(--accent); color: var(--bg); } }
  &:is(details):not([open]) { padding-top: calc(var(--lh) * 0.5); padding-bottom: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: 0; }
  .s-panel-content { gap: var(--row-gap); }

  .s-fold-icon { display: inline-block; margin-left: 1ch; color: var(--dim); letter-spacing: 0; font-weight: 400;
    i { font-style: normal; &::before { content: '[+]'; } } }
  &[open] .s-fold-icon i::before { content: '[-]'; }
  > summary:hover .s-fold-icon { color: var(--fg); }

  /* ── Search — a slash prompt that opens a well ── */
  .s-search { margin-left: 1ch; gap: 0; letter-spacing: 0; text-transform: none; font-weight: 400; }
  .s-search-btn { width: 1ch; height: var(--lh); background: none; -webkit-mask: none; mask: none; color: var(--dim); font: inherit;
    &::before { content: '/'; }
    &:hover, &:focus-visible { color: var(--accent); outline: none; } }
  &.s-searching .s-search-btn { color: var(--accent); }
  .s-search-input { width: 16ch; height: var(--lh); padding: 0 1ch; background: var(--well); color: var(--fg); caret-color: var(--accent); outline: none; appearance: none; -webkit-appearance: none;
    &::placeholder { color: var(--dim); }
    &:focus-visible { box-shadow: inset 2px 0 0 var(--accent); }
    &::-webkit-search-decoration, &::-webkit-search-results-button, &::-webkit-search-results-decoration { display: none; }
    &::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; width: 1ch; height: 1ch; cursor: pointer; background: var(--dim);
      -webkit-mask: var(--s-clear-icon) center / contain no-repeat; mask: var(--s-clear-icon) center / contain no-repeat; &:hover { background: var(--fg); } } }

  /* ── Rows — one line high, one cell apart ── */
  .s-control { min-height: var(--lh); align-items: center; gap: var(--column-gap); }
  .s-input { gap: 1ch; align-items: center; }
  .s-label-group { width: var(--label-w); min-width: var(--label-w); max-width: none; line-height: var(--lh); gap: 0; }
  .s-label { color: var(--fg); }
  .s-hint { color: var(--dim); font-size: inherit; opacity: 1; }
  .s-title { color: var(--dim); cursor: help; font-size: inherit; &::before { content: '['; } &::after { content: ']'; }
    &:hover { color: var(--accent); } &:hover + .s-title-text { opacity: 1; visibility: visible; } }
  .s-title-text { position: absolute; left: 0; top: 100%; padding: 0 1ch; background: var(--fg); color: var(--bg); width: max-content; max-width: 40ch; z-index: 10; opacity: 0; visibility: hidden; pointer-events: none; }

  /* ── Wells — every field is a filled cell run, cursor bar on focus ── */
  input[type="text"], input[type="number"], textarea, select {
    background: var(--well); color: var(--fg); border: 0; border-radius: 0;
    font: inherit; line-height: var(--lh); height: var(--lh); padding: 0 1ch;
    caret-color: var(--accent);
    transition: background .1s;
    &::placeholder { color: var(--dim); }
    &:hover { background: var(--well-hi); }
    &:focus-visible { outline: none; background: var(--well-hi); box-shadow: inset 2px 0 0 var(--accent); }
    &:read-only:not(select) { color: var(--dim); }
  }
  input.s-scrubbing { background: var(--well-hi); box-shadow: inset 2px 0 0 var(--accent); }
  textarea { height: auto; min-height: calc(var(--lh) * 3); padding: 0 1ch; resize: vertical; field-sizing: content; max-height: 50vh; }
  select { cursor: pointer; appearance: none; -webkit-appearance: none; padding-right: 3ch;
    option { background: var(--bg); color: var(--fg); } }
  .s-select.s-dropdown .s-input { position: relative;
    select { flex: 1; }
    &::after { content: '▾'; position: absolute; right: 1ch; top: 0; line-height: var(--lh); color: var(--dim); pointer-events: none; } }

  /* ── Number — well + two half-line step cells ── */
  .s-number {
    .s-input { gap: 1px; }
    input[type="number"] { flex: 1; text-align: right; -moz-appearance: textfield; cursor: ew-resize;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      &:focus { cursor: text; } }
    .s-step { gap: 1px;
      button { width: 2ch; height: calc(var(--lh) / 2 - 0.5px); padding: 0; border: 0; background: var(--well); color: var(--dim); font-size: .6em; line-height: 1; cursor: pointer;
        &:hover { color: var(--bg); background: var(--accent); } } }
  }

  /* ── Vector — labelled cells ── */
  .s-vector {
    .s-input { gap: 1ch; }
    .s-vec-axis { gap: 0; height: var(--lh); min-width: 8ch; background: var(--well); padding: 0 0 0 1ch;
      &:focus-within { background: var(--well-hi); box-shadow: inset 2px 0 0 var(--accent); } }
    .s-vec-label { color: var(--dim); font-size: inherit; opacity: 1; &::after { content: ':'; } }
    input[type="number"] { background: transparent; box-shadow: none; padding: 0 1ch 0 0.5ch; &:hover, &:focus-visible { background: transparent; box-shadow: none; } }
  }

  /* ── Buttons — bracketed, inverse on hover/press ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    .s-input { gap: 2ch; justify-content: flex-start; }
    button { flex: 0 1 auto; min-width: 0; height: var(--lh); padding: 0; border: 0; background: none; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; white-space: nowrap;
      &::before { content: '[ '; color: var(--dim); font-weight: 400; letter-spacing: 0; } &::after { content: ' ]'; color: var(--dim); font-weight: 400; letter-spacing: 0; }
      &:hover, &:focus-visible { outline: none; background: var(--accent); color: var(--bg); &::before, &::after { color: var(--bg); } }
      &:active { background: var(--fg); color: var(--bg); }
      &:disabled, &[aria-busy="true"] { color: var(--dim); background: none; cursor: not-allowed; &::before, &::after { color: var(--dim); } }
      &[aria-busy="true"]::after { content: ' …'; } }
    &.s-secondary button, button.s-secondary { color: var(--fg); font-weight: 400; text-transform: none; letter-spacing: 0;
      &:hover, &:focus-visible { background: var(--fg); color: var(--bg); } }
  }

  /* ── Boolean ── */
  .s-boolean {
    .s-input { cursor: pointer; }
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-checkbox {
      .s-track { color: var(--dim); white-space: pre; &::before { content: '[ ]'; } }
      .s-input:hover .s-track { color: var(--fg); }
      &:has(input:checked) .s-track { color: var(--accent); font-weight: 700; &::before { content: '[x]'; } }
      &:has(input:focus-visible) .s-track { background: var(--accent); color: var(--bg); }
    }
    &.s-switch {
      .s-track { width: 4ch; height: var(--lh); background: var(--well); position: relative;
        &::after { content: ''; position: absolute; top: 2px; bottom: 2px; left: 2px; width: calc(2ch - 3px); background: var(--dim); transition: left .12s, background .12s; } }
      .s-input:hover .s-track { background: var(--well-hi); }
      &:has(input:checked) .s-track::after { left: calc(2ch + 1px); background: var(--accent); }
      &:has(input:focus-visible) .s-track { box-shadow: inset 0 0 0 1px var(--accent); }
    }
    &.s-toggle {
      .s-track { height: var(--lh); padding: 0 1ch; background: var(--well); color: var(--dim); display: flex; align-items: center; white-space: pre; text-transform: uppercase; font-weight: 700; letter-spacing: .04em;
        &::after { content: 'off'; } }
      .s-input:hover .s-track { background: var(--well-hi); color: var(--fg); }
      &:has(input:checked) .s-track { background: var(--accent); color: var(--bg); &::after { content: 'on '; } }
      &:has(input:focus-visible) .s-track { box-shadow: 0 0 0 1px var(--accent); }
    }
  }

  /* ── Slider — a bar of cells, a block cursor for the thumb ── */
  .s-slider {
    --cells: repeating-linear-gradient(90deg, transparent 0 calc(1ch - 1px), var(--bg) calc(1ch - 1px) 1ch);
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: var(--lh); }
    .s-track { height: var(--lh); margin: 0; }
    input[type="range"] {
      width: 100%; height: var(--lh); -webkit-appearance: none; appearance: none; cursor: ew-resize; border-radius: 0; margin: 0;
      background: var(--cells), linear-gradient(90deg, var(--accent) var(--p, 0%), var(--well) var(--p, 0%));
      &::-webkit-slider-thumb { -webkit-appearance: none; width: 1ch; height: var(--lh); background: var(--fg); border: 0; border-radius: 0; cursor: ew-resize; }
      &::-moz-range-thumb { width: 1ch; height: var(--lh); background: var(--fg); border: 0; border-radius: 0; cursor: ew-resize; }
      &:hover::-webkit-slider-thumb, &:active::-webkit-slider-thumb { background: var(--accent); box-shadow: inset 0 0 0 1px var(--bg); }
      &:focus-visible { outline: none; box-shadow: 0 0 0 1px var(--accent); }
    }
    .s-marks { display: none; }
    .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translateX(-50%); color: var(--dim); white-space: nowrap; &.s-active { color: var(--fg); } }
    .s-readout { flex: 0 0 auto; width: auto; min-width: 7ch; field-sizing: content; text-align: right; background: none; color: var(--dim); padding: 0; cursor: ew-resize;
      &:hover, &:focus-visible, &.s-scrubbing { color: var(--accent); background: none; box-shadow: none; } }
    .s-tooltip { position: absolute; bottom: 100%; transform: translateX(-50%); background: var(--fg); color: var(--bg); padding: 0 1ch; white-space: nowrap; }
    &.s-multiple .s-interval-track { height: var(--lh); margin: 0; position: relative;
      background: var(--cells), linear-gradient(90deg, var(--well) var(--low, 0%), var(--accent) var(--low, 0%), var(--accent) var(--high, 100%), var(--well) var(--high, 100%));
      input[type="range"] { background: transparent; } }
  }

  /* ── Select variants ── */
  .s-select {
    &.s-segmented {
      .s-input { gap: 0; background: var(--well); }
      button { flex: 1; min-width: 0; height: var(--lh); padding: 0 1ch; border: 0; background: transparent; color: var(--dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        & + button { border-left: 1px solid var(--bg); }
        &:hover { color: var(--fg); background: var(--well-hi); }
        &.s-selected { background: var(--accent); color: var(--bg); font-weight: 700; }
        &:focus-visible { outline: none; box-shadow: inset 0 0 0 1px var(--accent); } }
    }
    &.s-radio, &.s-checkboxes { align-items: flex-start;
      .s-input { flex-direction: column; align-items: stretch; gap: 0; }
      .s-input label { display: flex; align-items: center; gap: 1ch; height: var(--lh); cursor: pointer; white-space: pre; &:hover { color: var(--fg); } }
    }
    &.s-radio {
      input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-input label { color: var(--dim);
        &::before { content: '( )'; }
        &.s-selected { color: var(--fg); &::before { content: '(•)'; color: var(--accent); font-weight: 700; } }
        &:has(input:focus-visible)::before { background: var(--accent); color: var(--bg); } }
    }
    &.s-checkboxes {
      input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
      .s-track { color: var(--dim); &::before { content: '[ ]'; } }
      .s-input label:has(input:checked) { color: var(--fg); .s-track { color: var(--s-color, var(--accent)); font-weight: 700; &::before { content: '[x]'; } } }
      .s-input label:has(input:focus-visible) .s-track { background: var(--accent); color: var(--bg); }
    }
  }

  /* ── Color — a 2-cell swatch beside the hex ── */
  .s-color {
    &.s-picker .s-color-input { gap: 1ch;
      input[type="color"] { position: static; flex: none; width: 2ch; height: var(--lh); padding: 0; border: 0; border-radius: 0; cursor: pointer; background: none; -webkit-appearance: none; appearance: none;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: 0; border-radius: 0; }
        &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; } }
      input[type="text"] { flex: 1; min-width: 0; } }
    &.s-rgba .s-color-input { gap: 1ch;
      input[type="color"] { width: 2ch; height: var(--lh); border-radius: 0; -webkit-appearance: none; appearance: none; background: none;
        &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: 0; border-radius: 0; } }
      .s-alpha { height: var(--lh); border-radius: 0;
        &::-webkit-slider-thumb { width: 1ch; height: var(--lh); border: 0; border-radius: 0; background: var(--fg); }
        &::-moz-range-thumb { width: 1ch; height: var(--lh); border: 0; border-radius: 0; background: var(--fg); } } }
    &.s-swatches { .s-input { flex-wrap: wrap; gap: 1ch calc(1ch - 1px); }
      button { width: 2ch; height: var(--lh); padding: 0; border: 0; border-radius: 0; cursor: pointer;
        &:hover { outline: 1px solid var(--fg); outline-offset: 1px; }
        &.s-selected { outline: 1px solid var(--accent); outline-offset: 1px; }
        &:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; } } }
  }

  /* ── Text / textarea ── */
  .s-text input[type="text"] { flex: 1; }
  .s-textarea { align-items: flex-start; textarea { flex: 1; } }

  /* ── Info / separator ── */
  .s-info .s-monitor { color: var(--accent); opacity: 1; }
  .s-separator { height: 1px; margin: 0; opacity: 1; background: repeating-linear-gradient(90deg, var(--line) 0 0.5ch, transparent 0.5ch 1ch); }
  .s-separator-labeled { height: var(--lh); background: none; gap: 1ch;
    &::before, &::after { opacity: 1; background: repeating-linear-gradient(90deg, var(--line) 0 0.5ch, transparent 0.5ch 1ch); } }
  .s-separator-label { color: var(--dim); font-size: inherit; text-transform: uppercase; letter-spacing: .08em; opacity: 1; }

  /* ── XY pad / knob ── */
  .s-xy { align-items: flex-start; }
  .s-pad-val { color: var(--dim); font-size: inherit; opacity: 1; }
  .s-pad { width: 24ch; height: calc(var(--lh) * 8); aspect-ratio: auto; background: var(--well); border: 0; border-radius: 0;
    .s-pad-x, .s-pad-y { background: repeating-linear-gradient(90deg, var(--line) 0 0.5ch, transparent 0.5ch 1ch); }
    .s-pad-y { background: repeating-linear-gradient(180deg, var(--line) 0 2px, transparent 2px 4px); }
    .s-pad-dot { width: 1ch; height: var(--lh); border-radius: 0; background: var(--accent); box-shadow: none; }
    &:focus-visible:not(:active) { outline: 1px solid var(--accent); outline-offset: 1px; } }
  .s-knob-dial { width: calc(var(--lh) * 2); height: calc(var(--lh) * 2); background: var(--well); border: 1px solid var(--line);
    i { background: var(--accent); width: 2px; border-radius: 0; } }
  .s-knob-wrap:focus-visible:not(:active) .s-knob-dial { outline: 1px solid var(--accent); outline-offset: 1px; }
  .s-knob-val { color: var(--accent); font-size: inherit; opacity: 1; }

  /* ── Folder — [+] header, rows indented behind a tree guide ── */
  .s-folder {
    > summary { height: var(--lh); color: var(--dim); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; gap: 1ch;
      &::before { content: '[+]'; color: var(--accent); font-weight: 400; letter-spacing: 0; }
      &:hover { color: var(--fg); }
      &:focus-visible { outline: none; color: var(--fg); &::before { background: var(--accent); color: var(--bg); } } }
    &[open] > summary { color: var(--fg); &::before { content: '[-]'; } }
    .s-content { gap: var(--row-gap); margin: var(--row-gap) 0 0 1ch; padding-left: 3ch; border-left: 1px solid var(--line); }
    &.s-section > summary { pointer-events: none; &::before { content: '──'; color: var(--line); } }
  }
}`

  return baseCSS + '\n' + overrides
}
