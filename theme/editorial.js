/**
 * Editorial – a reader's settings sheet (the reference: an e-reader Settings
 * panel over a page of book text).
 *
 * A pale sheet framed by a solid ink border, no shadow, no radius. An upper-case
 * bold masthead sits on one dark hairline; muted labels are right-aligned in a
 * narrow column; values and choices sit in the column beside them, each row
 * closed by a pale rule drawn under the value column only. Choices are
 * typographic: the active one in full ink, the rest muted, nothing boxed. The
 * slider is a hairline with an ink dot and LOW / HIGH read inline. Actions are
 * pills: the primary solid ink with small tracked capitals, the secondary grey.
 *
 * Every tone is ink mixed into the paper at the reference's measured ratios
 * (masthead rule 65 %, row rules 13 %, slider groove 22 %), so any shade, light
 * or dark, keeps the sheet's relationships. Tones under or behind lettering are
 * raised until it reads 4.5:1: labels 52 % → 56 % and the grey pill 39 % → 48 %
 * on the reference paper (more on a paper that needs it); hints take the labels'
 * tone where their 40 % would not read.
 *
 * Axes: shade (paper), accent (focus ring only; ink when omitted), spacing,
 * size, weight (masthead and choice emphasis), rule (row-rule weight in px),
 * font (the sheet's face).
 *
 * editorial(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, toHex, resolveAccent, contrast } from './color.js'

// Chevron glyph as a mask (shape only; colour comes from the element's background).
const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1 L5 5 L9 1' fill='none' stroke='%23000' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

export default function editorial({
  shade = '#dfe0e4',
  accent,
  spacing = 1,
  size = 1,
  weight = 700,
  rule = 1,
  font,
} = {}) {
  const dark = parseColor(shade).L < 0.5
  const ink = dark ? '#ffffff' : '#000000'
  const focus = resolveAccent(accent, shade) || ink
  // Ink mixed into the paper, as the reference's greys are.
  const mix = a => `color-mix(in srgb, var(--ink) ${a}%, var(--paper))`
  const paper = toHex(parseColor(shade)).slice(1).match(/../g).map(h => parseInt(h, 16))
  const tone = a => paper.map(c => Math.round((dark ? 255 : 0) * a / 100 + c * (1 - a / 100)).toString(16).padStart(2, '0')).join('')
  // The reference's ratio, raised as far as lettering needs to read (4.5:1): more ink for a grey
  // printed on the paper, for a pill under paper-coloured lettering.
  const reach = (a, reads) => { while (a < 100 && !reads('#' + tone(a))) a++; return a }
  const onPaper = a => reach(a, t => contrast(t, shade) >= 4.5), underLettering = a => reach(a, t => contrast(t, dark ? '#000000' : '#ffffff') >= 4.5)
  const muted = onPaper(52), faint = onPaper(40), pill = underLettering(39)
  // A native <select> cannot tint a mask, so its chevron is the muted tone, baked.
  const mutedHex = tone(muted)
  const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1 L5 5 L9 1' fill='none' stroke='%23${mutedHex}' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { fontSize: 13, lineHeight: 17, controlHeight: 56, inset: 6, rowGap: 0, columnGap: 28, sectionGap: 25, panelPadding: 14, fontFamily: "'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif" })}

  /* ── Ink on paper ── */
  --bg: ${shade};
  --paper: ${shade};
  --ink: ${ink};
  --on-ink: ${dark ? '#000000' : '#ffffff'};
  --muted: ${mix(muted)};         /* labels, inactive choices, LOW / HIGH */
  --faint: ${mix(faint)};         /* hints */
  --masthead-rule: ${mix(65)};    /* the one dark hairline under the title */
  --rule-color: ${mix(13)};       /* row rules */
  --groove: ${mix(22)};           /* slider track beyond the dot */
  --pill: ${mix(pill)};           /* secondary action, fold control */
  --accent: ${focus};
  --rule: ${rule}px;
  --weight: ${weight};
  --row: var(--control-height);   /* row pitch: one rule to the next */
  --label-w: 28%;
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--paper);
  color: var(--ink);
  border: calc(2 * var(--length)) solid var(--ink);
  border-radius: 0;
  box-shadow: none;
  padding: 0 var(--panel-padding) calc(19 * var(--space));
  font-family: var(--font-family);
  font-size: var(--font-size);
  font-weight: 400; /* --weight is the masthead's and the choices' emphasis, not the sheet's */
  line-height: var(--line-height);
  -webkit-font-smoothing: antialiased;

  :focus-visible { outline: calc(2 * var(--length)) solid var(--accent); outline-offset: calc(2 * var(--length)); }

  /* ── Masthead: bold capitals on one dark hairline; the fold control is the grey pill ── */
  > summary, > .s-panel-title {
    display: flex; align-items: center; gap: var(--column-gap);
    min-height: calc(58 * var(--space));
    padding: 0;
    border-bottom: 1px solid var(--masthead-rule);
    font-size: calc(17 * var(--length)); font-weight: var(--weight); line-height: 1;
    text-transform: uppercase; letter-spacing: .02em;
    color: var(--ink);
    &::after { display: none; }
  }
  > summary:focus-visible { outline-offset: calc(-2 * var(--length)); }
  .s-fold-icon {
    margin-left: auto; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    height: calc(34 * var(--length)); padding: 0 calc(24 * var(--length));
    border-radius: 999px; background: var(--pill); color: var(--on-ink);
    font-size: calc(11 * var(--length)); font-weight: 400; letter-spacing: .1em;
    i { display: none; }
    &::before { content: 'Hide'; }
  }
  &:not([open]) > summary .s-fold-icon::before { content: 'Show'; }
  &:not([open]) > summary { border-bottom-color: transparent; }
  .s-panel-content { gap: var(--row-gap); padding-top: calc(4 * var(--space)); }

  /* ── Rows: a right-aligned label column, the value column closed by a rule ── */
  .s-control { gap: var(--column-gap); align-items: center; min-height: var(--row); padding: 0; }
  .s-label-group { flex: 0 0 var(--label-w); width: var(--label-w); max-width: var(--label-w); align-items: flex-end; text-align: right; gap: calc(2 * var(--space)); padding-block: calc(6 * var(--space)); }
  .s-label { color: var(--muted); font-weight: 400; }
  .s-hint { color: var(--faint); font-size: calc(11 * var(--length)); line-height: 1.25; opacity: 1; }
  .s-input { flex: 1; min-width: 0; align-self: stretch; align-items: center; gap: calc(12 * var(--space)); border-bottom: var(--rule) solid var(--rule-color); transition: border-color .15s; }
  .s-input:has(:focus-visible) { border-bottom-color: var(--ink); }
  input, select, textarea, button { font: inherit; color: inherit; }

  input[type="text"], input[type="number"], select, textarea {
    flex: 1; min-width: 0; width: 100%; height: 100%;
    padding: 0; border: none; border-radius: 0; background: transparent;
    font-size: calc(14 * var(--length)); color: var(--ink);
    &::placeholder { color: var(--faint); }
    &:focus-visible { outline: none; }
  }
  input[type="number"], .s-readout { font-variant-numeric: tabular-nums; }
  select {
    appearance: none; -webkit-appearance: none; cursor: pointer;
    padding-right: calc(18 * var(--length));
    background: ${selectChevron} right center / calc(10 * var(--length)) no-repeat;
  }
  textarea { padding-block: calc(10 * var(--space)); line-height: 1.5; resize: vertical; field-sizing: content; min-height: calc(3 * 1.5em + 20 * var(--space)); }

  /* ── Choices: typographic, the active one in ink ── */
  .s-select.s-segmented .s-input { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; justify-items: center; gap: 0; }
  .s-select.s-segmented button {
    background: none; border: none; padding: calc(6 * var(--space)) calc(4 * var(--space));
    color: var(--muted); font-weight: var(--weight); line-height: 1; cursor: pointer;
    transition: color .12s;
    &:hover { color: ${mix(80)}; }
    &.s-selected { color: var(--ink); }
    &[style*="--icon"]::before {
      content: ''; display: block; width: calc(32 * var(--length)); height: calc(27 * var(--length));
      background: currentColor; -webkit-mask: var(--icon) center / contain no-repeat; mask: var(--icon) center / contain no-repeat;
    }
  }
  .s-select:is(.s-radio, .s-checkboxes) .s-input { flex-direction: row; flex-wrap: wrap; column-gap: calc(18 * var(--space)); }
  .s-select:is(.s-radio, .s-checkboxes) .s-input label {
    display: inline-flex; align-items: center; gap: calc(7 * var(--space)); cursor: pointer; color: var(--muted);
    &:has(input:checked) { color: var(--ink); }
    input { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-track { display: none; }
    &::before {
      content: ''; width: calc(12 * var(--length)); height: calc(12 * var(--length)); flex: none;
      border: calc(1.5 * var(--length)) solid currentColor; border-radius: 50%; box-sizing: border-box;
    }
    &:has(input:checked)::before { background: radial-gradient(circle, currentColor 45%, transparent 50%); }
    &:has(input:focus-visible) { outline: calc(2 * var(--length)) solid var(--accent); outline-offset: calc(2 * var(--length)); }
  }
  .s-select.s-checkboxes .s-input label::before { border-radius: 0; }
  .s-select.s-checkboxes .s-input label:has(input:checked)::before { background: currentColor; box-shadow: inset 0 0 0 calc(2 * var(--length)) var(--paper); }

  /* ── Boolean: Off / On in the same typographic language ── */
  .s-boolean {
    input { position: absolute; opacity: 0; width: 0; height: 0; }
    .s-track {
      display: inline-flex; gap: calc(22 * var(--space)); cursor: pointer;
      font-weight: var(--weight); line-height: 1; background: none; border: none; width: auto; height: auto;
      &::before { content: 'Off'; color: var(--ink); transition: color .12s; }
      &::after { content: 'On'; color: var(--muted); position: static; width: auto; height: auto; background: none; box-shadow: none; transform: none; transition: color .12s; }
    }
    &:has(input:checked) .s-track { &::before { color: var(--muted); } &::after { color: var(--ink); } }
    &:has(input:focus-visible) .s-track { outline: calc(2 * var(--length)) solid var(--accent); outline-offset: calc(4 * var(--length)); }
    &.s-checkbox .s-track {
      gap: 0; width: calc(14 * var(--length)); height: calc(14 * var(--length));
      border: calc(1.5 * var(--length)) solid var(--ink); box-sizing: border-box;
      &::before, &::after { content: none; }
    }
    &.s-checkbox:has(input:checked) .s-track { background: var(--ink); box-shadow: inset 0 0 0 calc(2 * var(--length)) var(--paper); }
  }

  /* ── Slider: a hairline, an ink dot, LOW / HIGH read inline ── */
  .s-slider {
    .s-track { flex: 1; position: relative; display: flex; align-items: center; min-height: var(--row); }
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-inline: calc(40 * var(--length)); }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; width: 100%; height: calc(12 * var(--length)); margin: 0; cursor: pointer;
      background: linear-gradient(var(--ink), var(--ink)) 0 50% / var(--p, 0%) calc(2 * var(--length)) no-repeat, linear-gradient(var(--groove), var(--groove)) 0 50% / 100% calc(2 * var(--length)) no-repeat;
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(12 * var(--length)); height: calc(12 * var(--length)); border-radius: 50%; border: none; background: var(--ink); }
      &::-moz-range-thumb { width: calc(12 * var(--length)); height: calc(12 * var(--length)); border-radius: 50%; border: none; background: var(--ink); }
    }
    .s-marks { display: none; }
    .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translateX(-50%); font-size: calc(10 * var(--length)); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
    /* Each label sits in its own .s-mark-labels wrapper: the ends are found by sibling order.
       The sheet reads only its ends; inner labels have no room on the hairline, so they are not drawn. */
    .s-mark-labels:not(.s-mark-labels ~ .s-mark-labels) .s-mark-label { top: 50%; transform: translate(calc(-100% - 12 * var(--length)), -50%); }
    .s-mark-labels:not(:has(~ .s-mark-labels)) .s-mark-label { top: 50%; transform: translate(calc(12 * var(--length)), -50%); }
    .s-mark-labels ~ .s-mark-labels:has(~ .s-mark-labels) { display: none; }
    .s-readout { flex: none; width: 5ch; min-width: 5ch; @supports (field-sizing: content) { field-sizing: content; width: auto; } height: auto; text-align: right; color: var(--muted); font-size: calc(12 * var(--length)); border: none; background: transparent; padding: 0; }
    .s-tooltip { background: var(--ink); color: var(--on-ink); font-size: calc(11 * var(--length)); padding: calc(2 * var(--length)) calc(6 * var(--length)); }
    &.s-multiple .s-interval-track { height: calc(2 * var(--length)); background: var(--groove); position: relative;
      &::before { content: ''; position: absolute; inset-block: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--ink); }
      input[type="range"] { top: 50%; translate: 0 -50%; background: none; } }
  }

  /* ── Number ── */
  .s-number .s-step { opacity: 0; transition: opacity .12s;
    button { background: none; border: none; color: var(--muted); padding: 0 calc(3 * var(--length)); cursor: pointer; &:hover { color: var(--ink); } } }
  .s-number:hover .s-step, .s-number:focus-within .s-step { opacity: 1; }

  /* ── Colour: a square swatch and the hex beside it ── */
  .s-color {
    .s-color-input { gap: calc(12 * var(--space)); }
    input[type="color"] { position: static; flex: none; width: calc(20 * var(--length)); height: calc(20 * var(--length)); padding: 0; border: 1px solid var(--rule-color); border-radius: 0; background: none; cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 0; } &::-moz-color-swatch { border: none; border-radius: 0; } }
    &.s-swatches button { width: calc(20 * var(--length)); height: calc(20 * var(--length)); padding: 0; border: 1px solid var(--rule-color); border-radius: 0; cursor: pointer;
      &.s-selected { outline: calc(1.5 * var(--length)) solid var(--ink); outline-offset: calc(2 * var(--length)); } }
  }

  /* ── Actions: pills, the primary solid ink with tracked capitals ── */
  .s-button {
    .s-input { justify-content: center; gap: calc(12 * var(--space)); border-bottom: none; padding-top: calc(25 * var(--space)); }
    button {
      flex: 0 1 auto; min-width: min(40%, calc(140 * var(--length)));
      height: calc(50 * var(--length)); padding: 0 calc(28 * var(--length));
      border: none; border-radius: 999px; background: var(--ink); color: var(--on-ink);
      font-size: calc(11 * var(--length)); font-weight: 400; letter-spacing: .12em; text-transform: uppercase; line-height: 1;
      cursor: pointer; transition: opacity .12s;
      &:hover { opacity: .86; }
      &:active { opacity: .72; }
      &:disabled { opacity: .35; cursor: not-allowed; }
      &.s-secondary { background: var(--pill); color: var(--on-ink); }
    }
    .s-input > button:only-of-type { min-width: 66%; }
  }

  /* ── Structure ── */
  .s-folder > summary {
    display: flex; align-items: center; justify-content: space-between;
    padding: calc(16 * var(--space)) 0 calc(8 * var(--space));
    font-size: calc(11 * var(--length)); font-weight: var(--weight); letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
    &::after { content: ''; width: calc(10 * var(--length)); height: calc(6 * var(--length)); background: currentColor; -webkit-mask: ${chevron} center / contain no-repeat; mask: ${chevron} center / contain no-repeat; transition: transform .15s; }
  }
  .s-folder[open] > summary::after { transform: rotate(180deg); }
  .s-separator { color: var(--rule-color); opacity: 1; }
  .s-separator::before, .s-separator::after { background: var(--rule-color); opacity: 1; }
  .s-separator-label { color: var(--muted); font-size: calc(11 * var(--length)); letter-spacing: .1em; text-transform: uppercase; opacity: 1; }
  .s-info .s-monitor { color: var(--muted); opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
