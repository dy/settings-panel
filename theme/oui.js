/**
 * oui — calibrated to wearekuva/oui
 *
 * Signatures: a minimal white panel with Menlo monospace at a small size, a red
 * slider fill with no visible thumb (oui's #ff5252, deepened to read 3:1 on its
 * #d2d2d2 track), and borderless inputs that show
 * only a bottom rule (turning red on focus). Clinical, code-editor restraint.
 * Ref: https://github.com/wearekuva/oui
 *
 * Axes: shade (panel bg — light by default, flips the whole neutral ramp dark
 * below L 0.5) and accent (slider fill / focus rule / selected state). Every
 * other color is a derived token — text/line/hint/placeholder ink, the fill
 * used by elevated chips (select options), and the tint used by
 * recessed surfaces (button, open-folder body) — computed off the shade's own
 * OKLCH lightness/chroma/hue so they reproduce oui's exact literals in light
 * mode and flip coherently if shade goes dark. The checkbox keeps the browser's
 * default accent (oui sets none), independent of the panel's own accent; still
 * a named, overridable token.
 *
 * oui(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, resolveAccent, toHex, clamp, ink, mix } from './color.js'

export default function oui({
  shade = '#fafafa',
  accent = '#ff5252',
  size = 1,
  spacing = 1,
  font,
} = {}) {
  const acc = resolveAccent(accent, shade)
  const { L: surfaceL, C: surfaceC, H: surfaceH } = parseColor(shade)
  const { L: accentL } = parseColor(acc)
  const dark = surfaceL < 0.5
  const accentDark = accentL < 0.75

  // Hex builder tinted by the shade's own hue/chroma — reproduces oui's exact
  // literal defaults in light mode (verified byte-for-byte below) while still
  // tracking a tinted or inverted shade continuously.
  const $ = (L, C = surfaceC, H = surfaceH) => toHex({ L: clamp(L, 0, 1), C, H })
  const enc = c => encodeURIComponent(c)

  // ── Neutral ramp: clinical grays, flipped if the shade axis goes dark ──
  // Light defaults: text #424242, line #d2d2d2, hint #999, placeholder #aaa, fill #fff.
  const text = $(dark ? 0.92 : 0.379)
  const line = $(dark ? 0.32 : 0.864)
  const hint = ink(shade, 4.5, $(dark ? 0.56 : 0.683))   // oui #999, 2.7:1: hints and mark labels are text
  const placeholder = ink(shade, 4.5, $(dark ? 0.46 : 0.738))   // oui #aaa, 2.2:1: a placeholder is text
  const fill = $(dark ? clamp(surfaceL + 0.16, 0, 1) : 1)
  const rule = dark ? 'rgba(255,255,255,.05)' : 'rgba(1,1,1,.05)' // header hr, drawn inset like the UA hr
  const tint = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.044)' // #efefef (UA buttonface) over #fafafa
  const tint2 = dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)'
  const tooltipFg = dark ? $(0.12) : '#ffffff'
  const onAccent = accentDark ? '#ffffff' : '#1a1a1a'
  // the selected fill under lettering, lifted only as far as 4.5:1 needs (white on #ff5252, 3.2:1),
  // and a labeled separator's label (text at 60% on its line-colored band, 2.8:1)
  const action = ink(onAccent, 4.5, acc)
  const sepLabel = ink(line, 4.5, mix(line, text, .6))
  const nativeAccent = 'auto' // oui leaves the checkbox to the browser default (Chromium #0075ff)

  // Body 10px: ouioui sets its labels and values in Menlo at 10px.
  const body = 10
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 10, fontFamily: "Menlo, Inconsolata, Consolas, ui-monospace, monospace", lineHeight: 16, controlHeight: 20, inset: 4, rowGap: 2, columnGap: 8, sectionGap: 8, panelPadding: 10})}

  --bg: ${shade};
  --accent: ${ink(line, 3, acc)};   /* the fill reads 3:1 on its track (WCAG 1.4.11): oui's #ff5252 gives 2.1:1 on #d2d2d2 */
  --on-accent: ${onAccent};
  --action: ${action};
  --text: ${text};
  --line: ${line};
  --rule: ${rule};
  --hint: ${hint};
  --placeholder: ${placeholder};
  --fill: ${fill};
  --tint: ${tint};
  --tint-2: ${tint2};
  --tooltip-fg: ${tooltipFg};
  --native-accent: ${nativeAccent};

  --weight: 400;
  --r: calc(2 * var(--length));
  color-scheme: ${dark ? 'dark' : 'light'};

  background: var(--bg);
  color: var(--text);

  width: calc(275 * var(--length));   /* OUI's 275px, capped by a narrower host */
  min-width: 0;
  max-width: 100%;
  border-radius: var(--r);
  padding: var(--panel-padding);
  box-shadow: none;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Title: 11px label line over a 1px inset rule, 5px either side (native header > div + hr) ── */
  > summary, > .s-panel-title { color: var(--text); font-weight: 400; line-height: calc(11 * var(--length)); align-items: flex-start; padding: 0 0 calc(5 * var(--space)); border-bottom: 1px inset var(--rule); }
  > summary::after { content: ''; width: calc(10 * var(--length)); height: calc(10 * var(--length)); margin-left: auto; background: var(--text); -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transform: rotate(-180deg); }
  &:not([open]) > summary { padding-bottom: 0; border-bottom: none; }
  /* oui's chevron glyph (40-unit viewBox, open = down; the collapsed "up" path is its 180deg turn) */
  --chev: url("data:image/svg+xml,%3Csvg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m27.7 14.3l2.3 2.3-10 10-10-10 2.3-2.3 7.7 7.7z'/%3E%3C/svg%3E");
  &[open] > summary::after { transform: rotate(0deg); }
  .s-panel-content { gap: var(--row-gap); padding: calc(7 * var(--space)) 0 calc(2 * var(--space)); }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(7 * var(--space)); }

  /* ── Row ── */
  .s-control { gap: var(--column-gap); padding: 0; min-height: var(--control-height); align-items: center; }
  .s-boolean { min-height: calc(24 * var(--length)); }
  .s-label-group { width: 50%; min-width: 0; max-width: none; padding: 0; }
  .s-label { color: var(--text); font-weight: 400; }
  .s-hint { color: var(--hint); opacity: 1; }
  /* secondary text, one step under the body */
  :is(.s-hint, .s-mark-label, .s-separator-label, .s-tooltip, .s-title-text, .s-vec-label, .s-knob-val, .s-pad-val) { font-size: calc(9 * var(--length)); }
  /* a hint grows the label downward; the label itself stays centred on its control's line */
  .s-control:has(> .s-label-group .s-hint) { align-items: flex-start; > .s-label-group { padding-top: calc((var(--control-height) - 1lh) / 2); } > .s-input { min-height: var(--control-height); } }
  .s-input { gap: calc(6 * var(--space)); align-items: center; justify-content: flex-end; }

  /* ── Fields: borderless, bottom rule only ── */
  input[type="text"], input[type="number"], textarea {
    background: transparent; color: var(--text); border: none; border-bottom: 1px solid var(--line); border-radius: 0;
    height: var(--control-height); padding: 0 calc(2 * var(--length)); font: inherit; text-align: right;
    &::placeholder { color: var(--placeholder); }
    &:hover { border-bottom-color: var(--accent); }
  }
  .s-search-input::placeholder { color: var(--placeholder); }
  input[type="number"] { &:focus { outline: none; border-bottom-color: var(--accent); } }
  .s-text input[type="text"] { flex: 1; }
  .s-text, .s-color.s-picker {
    .s-label-group { width: auto; flex: 0 1 auto; }
    .s-input { flex: 0 0 50.2%; margin-left: auto; }
    input[type="text"] { flex: 1; width: auto; }
  }
  select { background: transparent; color: var(--text); border: none; cursor: pointer; height: var(--control-height); padding: 0 calc(2 * var(--length)); font: inherit; line-height: calc(20 * var(--length)); text-align: right; &:focus { outline: none; } option { background: var(--fill); color: var(--text); } }

  /* ── Number ── */
  .s-number { input[type="number"] { flex: 1; -moz-appearance: textfield; &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } } .s-step { display: none; } }

  /* ── Slider: label + readout line, 2px, then the 10px svg bar (two rx=2 rects, invisible thumb) ── */
  .s-slider {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: calc(2 * var(--space)) 0;
    align-items: start;
    /* labelled marks hang in a line the row reserves under the track: the gap and a 1.25 line of the label */
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(13.25 * var(--length)); }
    .s-label-group { grid-column: 1; grid-row: 1; width: auto; line-height: var(--control-height); align-self: baseline; }
    .s-input { display: contents; }
    .s-track { grid-column: 1 / 3; grid-row: 2; height: calc(10 * var(--length)); margin: 0; }
    input[type="range"] {
      width: 100%; height: calc(10 * var(--length)); -webkit-appearance: none; appearance: none; cursor: default; border-radius: var(--r); outline: none;
      /* track = the input's own r=2 box; fill = oui's second rx=2 rect ending at p: a body to p - r, a band with its edge at p,
         and two corner discs at p - r. The band stops short of the disc rows so their AA edges don't stack; --aa ramps an edge
         over one device px at 2x, like the svg's */
      --aa: .25px; --x: calc(var(--p, 0%) - var(--r));
      background:
        linear-gradient(to right, var(--accent) var(--x), #0000 0),
        linear-gradient(to right, var(--accent) calc(var(--p, 0%) - var(--aa)), #0000 calc(var(--p, 0%) + var(--aa))) 0 50% / 100% calc(100% - 2 * var(--r) - 2 * var(--aa)) no-repeat,
        radial-gradient(circle calc(var(--r) + var(--aa)) at var(--x) var(--r), var(--accent) calc(var(--r) - var(--aa)), #0000),
        radial-gradient(circle calc(var(--r) + var(--aa)) at var(--x) calc(100% - var(--r)), var(--accent) calc(var(--r) - var(--aa)), #0000)
        var(--line);
      &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(10 * var(--length)); height: calc(10 * var(--length)); background: transparent; cursor: default; }
      &::-moz-range-thumb { width: calc(10 * var(--length)); height: calc(10 * var(--length)); border: none; background: transparent; cursor: default; }
      &:focus-visible { box-shadow: inset 0 0 0 1px var(--accent); }
    }
    .s-marks { display: none; } .s-marks, .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, calc(2 * var(--length))); color: var(--hint); white-space: nowrap; line-height: 1.25;
      /* the end labels stay inside the track's span: the first starts at 0%, the last ends at 100% */
      &.s-first { transform: translate(0, calc(2 * var(--length))); } &.s-last { transform: translate(-100%, calc(2 * var(--length))); } }
    /* native number input: UA padding and line-height, left-aligned, baseline-aligned to the label */
    /* the original's 28px box; a longer value ('0.75', '440 Hz') widens it */
    .s-readout { grid-column: 2; grid-row: 1; align-self: baseline; flex: 0 0 auto; width: calc(28 * var(--length)); min-width: calc(28 * var(--length)); text-align: left; background: transparent; color: var(--text); border: 1px solid var(--line); border-radius: var(--r); height: auto; line-height: normal; padding: calc(1 * var(--length)) calc(2 * var(--length)); font-variant-numeric: tabular-nums; &:focus { outline: none; border-color: var(--accent); }
      @supports (field-sizing: content) { field-sizing: content; width: auto; } }
    .s-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: calc(2 * var(--length)); background: var(--text); color: var(--tooltip-fg); padding: calc(1 * var(--length)) calc(5 * var(--space)); border-radius: calc(2 * var(--length)); white-space: nowrap; }
    /* the bar sits under the label line, so its tooltip would cover the label: it shows while the bar is in use */
    .s-track:not(:hover, :active, :focus-within) .s-tooltip { visibility: hidden; }
    /* a hint goes under the bar, which stays right under its label */
    &:has(.s-hint) { .s-label-group { display: contents; } .s-label-row { grid-column: 1; grid-row: 1; line-height: var(--control-height); align-self: baseline; } .s-hint { grid-column: 1 / -1; grid-row: 3; } }
    /* interval: both readouts on the label line, the bar under them carrying the band as oui's fill rect */
    &.s-multiple { grid-template-columns: 1fr auto auto; column-gap: calc(4 * var(--space)); }
    &.s-multiple .s-readout-hi { grid-column: 3; }
    &.s-multiple .s-interval-track { grid-column: 1 / -1; grid-row: 2; height: calc(10 * var(--length)); margin: 0; background: var(--line); border-radius: var(--r); position: relative;
      &::before { content: ''; position: absolute; top: 0; bottom: 0; left: var(--low, 0%); width: calc(var(--high, 100%) - var(--low, 0%)); background: var(--accent); border-radius: inherit; }
      input[type="range"] { background: none; } }
  }

  /* ── The colour's alpha: the slider's 10px bar, the checkerboard under the colour's ramp; with no
     fill to end at the value, a 2px ink mark stands where the fill would end ── */
  .s-rgba .s-alpha { height: calc(10 * var(--length)); border-radius: var(--r); cursor: default;
    background: linear-gradient(to right, transparent, var(--c)), conic-gradient(#d2d2d2 90deg, #fff 0 180deg, #d2d2d2 0 270deg, #fff 0) 0 0 / calc(10 * var(--length)) calc(10 * var(--length)), var(--line);
    &::-webkit-slider-thumb { -webkit-appearance: none; width: calc(2 * var(--length)); height: calc(10 * var(--length)); border: none; border-radius: 0; background: var(--text); box-shadow: 0 0 0 1px var(--bg); cursor: default; }
    &::-moz-range-thumb { width: calc(2 * var(--length)); height: calc(10 * var(--length)); border: none; border-radius: 0; background: var(--text); box-shadow: 0 0 0 1px var(--bg); cursor: default; }
    &:focus-visible { outline: none; box-shadow: inset 0 0 0 1px var(--accent); } }

  /* ── Select ── */
  .s-select {
    &.s-dropdown select { flex: 1; appearance: none; -webkit-appearance: none; border-bottom: 1px solid var(--line);
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='1,1 5,5 9,1' fill='none' stroke='${enc(hint)}' stroke-width='1.2'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1px center; background-size: calc(9 * var(--length)) calc(6 * var(--length)); padding: 0 calc(18 * var(--space)) 0 calc(2 * var(--length)); }
    &.s-segmented { .s-input { gap: 0; } button { flex: 1; background: transparent; border: 1px solid var(--line); color: var(--text); margin-left: calc(-1 * var(--length)); height: var(--control-height); padding: 0 calc(3 * var(--space)); font: inherit; &:first-child { margin-left: 0; } &:hover { color: var(--accent); } &.s-selected { background: var(--action); color: var(--on-accent); border-color: var(--action); } } }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: flex-end; gap: calc(3 * var(--space)); } .s-input label { display: flex; align-items: center; gap: calc(6 * var(--space)); cursor: pointer; } }
  }

  /* ── Boolean: native checkbox, right; the checkboxes list shows the same native box ── */
  .s-boolean input[type="checkbox"], .s-checkboxes input[type="checkbox"] { -webkit-appearance: auto; appearance: auto; position: static; opacity: 1; width: calc(13 * var(--length)); height: calc(13 * var(--length)); margin: 0 calc(3 * var(--length)) 0 0; accent-color: var(--s-color, var(--native-accent)); cursor: pointer; }
  :is(.s-boolean, .s-checkboxes) .s-track { display: none; }
  /* option text then its box, so the boxes and radios line up on the right edge */
  :is(.s-checkboxes, .s-radio) .s-input label { flex-direction: row-reverse; }
  .s-boolean {
    align-items: center;
    .s-input { justify-content: flex-end; }
  }

  /* ── Color: circular swatch ── */
  .s-color {
    &.s-picker .s-color-input { gap: calc(6 * var(--space)); justify-content: flex-end;
      input[type="color"] { display: none; }
      input[type="text"] { flex: 0 1 auto; width: auto; min-width: 8ch; } }
    &.s-rgba .s-color-input { gap: calc(6 * var(--space)); justify-content: flex-end;
      input[type="color"] { width: calc(16 * var(--length)); height: calc(16 * var(--length)); padding: 0; border: none; border-radius: 50%; overflow: hidden; background: none; &::-webkit-color-swatch-wrapper { padding: 0; } &::-webkit-color-swatch { border: none; border-radius: 50%; } &::-moz-color-swatch { border: none; border-radius: 50%; } }
      input[type="text"] { flex: 0 1 auto; width: auto; min-width: 8ch; field-sizing: content; } }
    &.s-swatches { .s-input { justify-content: flex-end; } button { width: calc(16 * var(--length)); height: calc(16 * var(--length)); border-radius: 50%; border: 1px solid var(--line); &.s-selected { outline: 2px solid var(--accent); } } }
  }

  /* ── Button (small gray pill, left-aligned) ── */
  button { font: inherit; cursor: pointer; }
  .s-button {
    margin-top: calc(2 * var(--length)); /* native: 4px gap before button row vs the 2px row gap */
    .s-input { justify-content: flex-start; gap: 0; }
    button { background: var(--tint); color: var(--text); border: none; border-radius: var(--r); min-width: calc(50 * var(--length)); height: calc(25 * var(--length)); padding: 0 calc(10 * var(--space)); &:hover { background: var(--accent); color: var(--on-accent); } &:active { filter: brightness(.92); } }
    &.s-secondary button, button.s-secondary { background: var(--tint-2); &:hover { background: var(--accent); color: var(--on-accent); } }
  }

  /* ── Textarea ── */
  .s-textarea { align-items: stretch; textarea { flex: 1; resize: vertical; field-sizing: content; min-height: calc(40 * var(--length)); max-height: 50vh; padding: calc(4 * var(--space)); text-align: left; border: 1px solid var(--line); } }

  /* ── Folder ── */
  .s-folder {
    > summary { color: var(--text); font-weight: 400; height: var(--control-height); padding: 0;
      &::after { content: ''; width: calc(10 * var(--length)); height: calc(10 * var(--length)); margin-left: auto; background: var(--text); -webkit-mask: var(--chev) center / contain no-repeat; mask: var(--chev) center / contain no-repeat; transform: rotate(-180deg); } }
    &[open] > summary::after { transform: rotate(0deg); }
    /* native body: 1em padding around rows that keep their 2px margins (collapsed to one row gap between) */
    &[open] > .s-content { background: var(--tint-2); border-radius: var(--r); padding: calc(10 * var(--space) + var(--row-gap)) calc(10 * var(--space)); }
    .s-content { gap: var(--row-gap); }
  }

  /* ── Info / separator ── */
  .s-info { .s-input { justify-content: flex-end; } .s-monitor { flex: 0 1 auto; color: var(--text); font-variant-numeric: tabular-nums; } }
  .s-separator { background: var(--line); opacity: 1; }
  .s-separator-label { color: ${sepLabel}; opacity: 1; }
}`

  return baseCSS + '\n' + overrides
}
