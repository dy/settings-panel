/**
 * Control-panel theme — freeman-lab/control-panel reproduction
 *
 * Signatures: a flat, 95%-opaque monospace (Hack) panel with square corners,
 * every control a hard-edged 20px strip on a 25px row. Geometry is
 * native's own: the row splits at 38% (a 36% label plus a 2% gutter), and
 * every box on the right is a share of the row width (12.5% readouts and
 * swatches, 2% gaps, 62% buttons and selects), so the panel reflows like the
 * original at any width. Labels sit on native's `vertical-align: sub`; the
 * text field is a 20px strip like the rest (native's is 22px and 1px wider,
 * from UA padding it never reset); the slider thumb is 10×20, and the
 * colour's alpha slider is that slider over a checkerboard; checkboxes fill the
 * row's 20px line with a 10px core (native's 18px box sat 2px low), and radios are
 * the same box round, in native multibox's row. Native has one boolean widget, so
 * switch/toggle render as that box. What native lacks (pad, knob, swatches) is drawn
 * in its own terms: background2 fields, square, the thumb colour for the mark.
 *
 * Colors: native ships two fixed palettes (themes.js). Each role keeps its
 * OKLCH lightness offset from background1, so shade #232323 (dark) or
 * #e3e3e3 (light) lands the original values exactly and any other shade
 * carries the same ramp in its own hue, except where WCAG moves a role (text
 * on background2 to 4.5:1, the accent to 3:1; see below). accent (thumb,
 * interval, checkbox core) defaults to native's foreground1.
 *
 * Sizes: heights are multiples of --u (5px); widths are row shares, with
 * text-bearing boxes also scaled by --size so readouts keep their digits.
 * --row is the row width seen from inside .s-input (which spans 62% of it).
 *
 * Axes: shade, accent, spacing, weight, size, font. roundness is accepted for
 * axis-signature parity but, as in the original, never drives a radius.
 *
 * base scaffold + control-panel visual layer.
 * controlPanel(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { parseColor, resolveAccent, clamp, contrast, toHex, mix } from './color.js'

// Native palettes (control-panel themes.js), in order: background1, background2,
// background2hover, foreground1, text1, text2
const palettes = {
  dark: ['#232323', '#363636', '#3a3a3a', '#707070', '#ebebeb', '#a1a1a1'],
  light: ['#e3e3e3', '#cccccc', '#d0d0d0', '#696969', '#242424', '#575757'],
}

export default function controlPanel({
  shade = '#232323',
  accent,
  spacing = 1,
  weight = 400,
  roundness = 0,
  size = 1,
  font,
} = {}) {
  const { L, C, H } = parseColor(shade)
  const dark = L < .6
  const [base, ...roles] = palettes[dark ? 'dark' : 'light'].map(c => parseColor(c).L)
  const at = l => `oklch(${clamp(l, 0, 1).toFixed(4)} ${C.toFixed(4)} ${H.toFixed(1)})`
  const [bg2, bg2h, fg, text, dim] = roles.map(l => at(L + l - base))
  // The panel is 95% opaque, as native, so whatever sits on background2 takes 5% of the page behind it
  // too; over a white page that costs contrast. Text on background2 (native text2: 4.2:1 dark, 4.1:1
  // light) and the accent it carries (foreground1 thumb and checkbox core: 2.3:1 dark) move away from
  // it, lightness only, until they hold 4.5:1 and 3:1 over a white or a black page (WCAG 1.4.3, 1.4.11).
  // a composite lands within a level of the exact blend, so both colors are tried a level either way
  const veil = (c, back, near) => '#' + toHex(parseColor(c)).slice(1).match(/../g).map(h => near(parseInt(h, 16) * .95 + back * .05).toString(16).padStart(2, '0')).join('')
  const reach = (tone, ratio, ground = bg2) => {
    const t = parseColor(tone, null), reads = l => [0, 255].every(back => [Math.floor, Math.ceil].every(near =>
      contrast(veil(toHex({ ...t, L: l }), back, near), veil(ground, back, near === Math.floor ? Math.ceil : Math.floor)) >= ratio))
    if (!t || reads(t.L)) return tone
    let l = t.L
    while (l > 0 && l < 1 && !reads(l)) l += dark ? .005 : -.005
    return toHex({ ...t, L: clamp(l, 0, 1) })
  }
  const fieldInk = reach(dim, 4.5)
  const placeholder = reach(fg, 4.5)   // native's placeholder is foreground1: 2.3:1 on background2
  const searchPlaceholder = reach(fg, 4.5, shade)   // and the search field's, on the bare panel in the title
  const quiet = reach(mix(shade, text, .6), 4.5, shade)   // hints and a separator's label, the base's .6 of text1 (3.6:1 light), on the panel
  const acc = reach(resolveAccent(accent, shade) || fg, 3)

  // Body 11px: control-panel sets its labels and values at 11px (Hack, or the default monospace where Hack is absent).
  const body = 11
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, unit: 5, fontSize: 11, fontFamily: "'Hack', monospace", lineHeight: 20, controlHeight: 20, inset: 4, rowGap: 5, columnGap: 5, sectionGap: 4, panelPadding: 14})}

  --bg: ${shade};
  --bg2: ${bg2};
  --bg2h: ${bg2h};
  --fg: ${fg};
  --text: ${text};
  --dim: ${dim};
  --field-ink: ${fieldInk};
  --placeholder: ${placeholder};
  --accent: ${acc};

  --weight: ${weight};
  --roundness: ${roundness};
  --r: 0;

  /* ── Derived tokens (size) ── */
  --fs: var(--font-size);
  --line: calc(1 * var(--length));
  --col: 38%;                       /* label column share of the row (36% + 2% gutter) */
  --thumb: calc(var(--u) * 2);      /* 10px: slider thumb / checkbox core */
  --box: calc(var(--u) * 3.6);      /* 18px: checkbox square */
  --tick: calc(var(--u) * 1.6);     /* 8px: checkbox → name → next box */
  --pad-xs: calc(var(--u) * .4);    /* 2px: checkbox top offset, name chip padding */
  color-scheme: ${dark ? 'dark' : 'light'};

  background-color: var(--bg);
  opacity: .95;
  color: var(--text);
  border-radius: 0;
  padding: var(--panel-padding) var(--panel-padding) calc(var(--u) * 1.6 * var(--spacing));
  min-width: 0;
  user-select: none;
  cursor: default;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: normal;

  /* ── Panel header: text2, uppercase, top of a 20px strip ── */
  > summary, > .s-panel-title {
    display: block;
    font-size: var(--fs);
    font-weight: ${weight};
    color: var(--dim);
    text-transform: uppercase;
    text-align: center;
    height: var(--lh);
    padding: 0;
    &::after { display: none; }
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
  }
  > summary { cursor: pointer; }
  .s-search-input::placeholder { color: ${searchPlaceholder}; }
  .s-hint, .s-separator-label { color: ${quiet}; opacity: 1; }
  /* secondary text, one step under the body */
  :is(.s-hint, .s-mark-label, .s-separator-label, .s-tooltip, .s-title-text, .s-vec-label, .s-knob-val, .s-pad-val) { font-size: calc(10 * var(--length)); }

  .s-panel-content { gap: 0; padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content {
    padding-top: var(--section-gap);
  }

  /* ── Layout: native rows are 25px, content pinned to the top: a 20px line and the 5px gap under it. The gap is the
     value's padding, so a value that outgrows the line (a textarea, a pad, a knob, wrapped boxes) keeps it too, and
     the label's, so a label that wraps or carries a hint does (native's runs into the next row); the last row's
     label needs no gap, the panel's padding follows it ── */
  .s-control {
    gap: 0;
    padding: 0;
    position: relative;
    align-items: flex-start;
    min-height: calc(var(--lh) + var(--row-gap));
    > .s-input { padding-bottom: var(--row-gap); }
    &:not(:last-child) > .s-label-group { padding-bottom: var(--row-gap); }
  }
  /* content-box like native's 36% div + 2% padding, so both round to the same layout units */
  .s-label-group {
    display: block;
    box-sizing: content-box;
    min-width: 0;
    width: calc(var(--col) - 2% * var(--spacing));
    max-width: none;
    flex: 0 0 calc(var(--col) - 2% * var(--spacing));
    padding: 0 calc(2% * var(--spacing)) 0 0;
    min-height: var(--lh);
    line-height: normal;
  }
  .s-label-row { display: block; }
  .s-label-group .s-label { display: inline-block; vertical-align: sub; font-size: var(--fs); overflow-wrap: break-word; }
  /* Row shares resolve inside .s-input, so they are declared there: a custom property
     substitutes var() where it is declared, and % resolves where it is used. */
  .s-input {
    --row: calc(100% / .62);
    --gap: calc(var(--row) * .02 * var(--spacing));
    --cell: calc(var(--row) * .125 * var(--size));    /* readout / swatch: 11% + 1.5% padding */
    --inset-x: calc(var(--row) * .015 * var(--size)); /* value-box left padding */
    gap: var(--gap);
    row-gap: var(--row-gap);   /* a % gap resolves to 0 between wrapped lines */
    align-items: flex-start;
  }
  .s-control:has(> .s-label-group[hidden]) > .s-input { margin-left: var(--col); }

  /* ── Value boxes (native value.js): readouts, color text, number. Text entry keeps
     native's outline: none on focus (the caret is the cue); other controls keep a
     keyboard-only ring, which mouse use never shows. ── */
  :is(.s-readout, .s-color-input input[type="text"], input[type="number"]) {
    background: var(--bg2);
    border: none;
    border-radius: 0;
    outline: none;
    color: var(--field-ink);
    font-family: inherit;
    font-size: var(--fs);
    height: var(--lh);
    line-height: var(--lh);
    padding: 0 0 0 var(--inset-x);
    overflow: hidden;
    font-variant-numeric: tabular-nums;
  }
  /* the original's 12.5% cell; a longer value ('440 Hz') widens it and the track gives way */
  .s-readout { flex: 0 0 auto; width: var(--cell); min-width: var(--cell); text-align: left; user-select: text; cursor: text;
    @supports (field-sizing: content) { field-sizing: content; width: auto; } }

  /* ── Text field (native text.js): 6px left padding ── */
  input[type="text"]:not(.s-readout, .s-color-input *), textarea {
    background: var(--bg2);
    border: none;
    border-radius: 0;
    outline: none;
    color: var(--field-ink);
    font-family: inherit;
    font-size: var(--fs);
    line-height: normal;
    padding: var(--line) calc(var(--line) * 2) var(--line) calc(var(--u) * 1.2);
    &::placeholder { color: var(--placeholder); }
  }
  /* native's text box is 22px (20 of content in a 1px pad), 2px taller than every other box, so the gap under it
     is 3px where it is 5 under the rest; here it is the others' 20px, and every row keeps the same 5px gap */
  .s-text input[type="text"] { flex: 1; height: var(--lh); padding-block: 0; padding-right: 0; }
  .s-number {
    input[type="number"] { flex: 1; min-width: 0; text-align: left; }
    .s-step { display: none; }
  }
  .s-textarea {
    textarea {
      flex: 1;
      align-self: stretch;
      width: auto;
      min-width: 0;
      height: auto;
      min-height: calc(var(--lh) * 3);
      max-height: 50vh;
      field-sizing: content;
      white-space: nowrap;
      overflow: auto;
      resize: none;
      &::-webkit-scrollbar { width: calc(var(--u) * 1.6); height: calc(var(--u) * 1.6); }
      &::-webkit-scrollbar-track { background: var(--bg2); }
      &::-webkit-scrollbar-thumb {
        background: var(--accent);
        border-radius: 0;
        border: var(--pad-xs) solid var(--bg2);
      }
      &::-webkit-scrollbar-corner { background: var(--bg2); }
    }
  }

  /* ── Button (native button.css): text2 on background2, hover lifts, press inverts.
     Native sets 11px on inputs only, so in Chromium and Firefox its buttons and selects fall back to
     the UA's 13.333px (Safari's 11px is what the 2016 README shot shows); here they read at the body size. ── */
  button {
    background: var(--bg2);
    border: none;
    border-radius: 0;
    color: var(--field-ink);
    font-family: inherit;
    font-size: var(--fs);
    height: var(--lh);
    padding: 0 calc(var(--u) * 1.2);
    cursor: pointer;
    &:hover { background-color: var(--bg2h); }
    &:active { background-color: var(--field-ink); color: var(--bg2); }
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
  }
  :is(.s-button, .s-segmented) {
    /* A label never breaks: buttons that do not fit share the row by wrapping onto their own line. */
    .s-input { flex: 1; flex-wrap: wrap; }
    button { flex: 1 1 auto; white-space: nowrap; }
  }

  /* ── Slider (native range.css / interval.css). The colour's alpha is the same slider,
     its track base's checkerboard under the colour's ramp. ── */
  :is(.s-slider:not(.s-multiple) .s-track, .s-rgba) input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: var(--lh);
    margin: 0;
    background-color: var(--bg2);
    border-radius: 0;
    outline: none;
    cursor: ew-resize;
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
    &::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: var(--thumb); height: var(--lh); background: var(--accent); border-radius: 0; cursor: ew-resize; border: none; box-shadow: none; }
    &::-moz-range-thumb { width: var(--thumb); height: var(--lh); background: var(--accent); border-radius: 0; cursor: ew-resize; border: none; }
    &::-webkit-slider-runnable-track { -webkit-appearance: none; appearance: none; height: var(--lh); border-radius: 0; box-shadow: none; }
    &::-moz-range-track { height: var(--lh); background: transparent; border-radius: 0; border: none; }
  }
  .s-slider {
    &:not(.s-multiple) .s-track { margin: 0; height: var(--lh); }
    /* native draws no ticks; labelled marks hang under the strip */
    &:has(.s-mark-labels:not(:empty)) .s-track { margin-bottom: calc(var(--lh) * .8); }
    .s-marks { display: none; }
    .s-mark-labels { position: absolute; inset: 0; pointer-events: none; }
    .s-mark-label { position: absolute; top: 100%; transform: translate(-50%, var(--pad-xs)); color: ${quiet}; white-space: nowrap;
      /* the end labels stay inside the track's span: the first starts at 0%, the last ends at 100% */
      &.s-first { transform: translate(0, var(--pad-xs)); } &.s-last { transform: translate(-100%, var(--pad-xs)); } }
    /* the interval is a bare handle span over the track: no thumbs, just the filled span */
    &.s-multiple .s-interval-track {
      height: var(--lh);
      margin: 0;
      background: var(--bg2);
      cursor: ew-resize;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: var(--low, 0%);
        width: calc(var(--high, 100%) - var(--low, 0%));
        min-width: var(--line);
        background: var(--accent);
        pointer-events: none;
      }
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: ew-resize;
        &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
        &::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; cursor: ew-resize; width: var(--thumb); height: var(--lh); background: transparent; border: none; box-shadow: none; }
        &::-moz-range-thumb { cursor: ew-resize; width: var(--thumb); height: var(--lh); background: transparent; border: none; }
        &::-webkit-slider-runnable-track { -webkit-appearance: none; appearance: none; background: transparent; box-shadow: none; }
      }
    }
  }

  /* ── Checkbox (native checkbox.css / multibox.css): native's is an 18px box 2px below the row top, which leaves 7px
     over it where every other box has 5; here it fills the row's 20px line as the other boxes do, so the rhythm holds;
     checked shows a 10px core inside a background2 frame ── */
  :is(.s-boolean, .s-checkboxes) .s-track {
    position: relative;
    flex: none;
    display: block;
    width: var(--lh);
    height: var(--lh);
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: var(--bg2);
    cursor: pointer;
    &::after {
      content: '';
      position: absolute;
      inset: auto;
      margin: 0;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: var(--thumb);
      height: var(--thumb);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }
  }
  input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
  .s-boolean {
    .s-input { flex: none; }
    &:has(input:checked) .s-track::after { background: var(--s-color, var(--accent)); }
    &:has(input:focus-visible) .s-track { outline: var(--line) solid var(--accent); outline-offset: 0; }
  }

  /* ── Option lists (native multibox.js): boxes in a row, each followed by its name, a line apart when they wrap.
     Radio is native's missing sibling: the same box and 10px core, round ── */
  .s-select:is(.s-radio, .s-checkboxes) {
    > .s-input { flex-direction: row; flex-wrap: wrap; gap: var(--pad-xs) var(--tick); padding-bottom: calc(var(--u) * 1.4); }
    .s-input label { display: inline-flex; align-items: flex-start; gap: var(--tick); cursor: pointer; color: var(--field-ink);
      /* the option's name, bare: native boxes it in the field fill, dropped at the owner's request */
      > span:not(.s-track) { margin-top: var(--pad-xs); padding: var(--pad-xs); font-size: var(--fs); line-height: normal; } }
  }
  .s-select.s-radio {
    input[type="radio"] { -webkit-appearance: none; appearance: none; flex: none; display: grid; place-items: center; width: var(--lh); height: var(--lh); margin: 0; border-radius: 50%; background: var(--bg2); cursor: pointer;
      &::after { content: ''; width: var(--thumb); height: var(--thumb); border-radius: 50%; }
      &:checked::after { background: var(--s-color, var(--accent)); }
      &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; } }
  }

  /* ── Select (native select.css): 62% strip, two 6×5 carets at 2.5% from the right ── */
  .s-select {
    select {
      flex: 1;
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      background: var(--bg2);
      border: none;
      border-radius: 0;
      outline: none;
      color: var(--field-ink);
      font-family: inherit;
      font-size: var(--fs);
      height: var(--lh);
      padding: 0 0 0 var(--inset-x);
      &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
      option { background: var(--bg); color: var(--text); }
    }
    &.s-dropdown .s-input {
      &::before, &::after {
        content: '';
        position: absolute;
        right: 2.5%;
        z-index: 1;
        border-inline: calc(var(--u) * .6) solid transparent;
        pointer-events: none;
      }
      &::before { top: calc(var(--u) * .8); border-bottom: var(--u) solid var(--dim); }
      &::after { top: calc(var(--u) * 2.2); border-top: var(--u) solid var(--dim); }
    }
    &.s-checkboxes {
      label .s-track { margin-bottom: var(--line); }   /* native's box sat 2px down in a 22px line: the line keeps its depth */
      label:has(input:checked) .s-track::after { background: var(--s-color, var(--accent)); }
      label:has(input:focus-visible) .s-track { outline: var(--line) solid var(--accent); outline-offset: 0; }
    }
    &.s-segmented button.s-selected { background-color: var(--field-ink); color: var(--bg2); }
  }

  /* ── Color (native color.js): 12.5% swatch, value box fills the rest ── */
  input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    flex: 0 0 var(--cell);
    width: var(--cell);
    height: var(--lh);
    padding: 0;
    border: none;
    cursor: pointer;
    &:focus-visible { outline: var(--line) solid var(--accent); outline-offset: 0; }
    &::-webkit-color-swatch-wrapper { padding: 0; }
    &::-webkit-color-swatch { border: none; border-radius: 0; }
    &::-moz-color-swatch { border: none; border-radius: 0; }
  }
  .s-color.s-rgba .s-color-input { gap: var(--gap); .s-alpha { min-width: var(--cell); } input[type="text"] { flex: 0 0 auto; width: auto; min-width: 0; field-sizing: content; } }   /* the whole code; the alpha gives way */
  /* swatches are the row's 20px boxes, packed a hairline apart so a palette reads as one block, rows a gap apart */
  .s-color.s-swatches { .s-input { gap: var(--pad-xs); } button { width: var(--lh); height: var(--lh); padding: 0; } }
  .s-color.s-picker .s-color-input {
    gap: var(--gap);
    input[type="color"] { position: static; }
    input[type="text"] { flex: 1; min-width: 0; width: auto; }
  }

  /* ── Vector: native value boxes, the number at the box's start ── */
  .s-vector input[type="number"] { text-align: left; }

  /* ── XY pad: native has none; a background2 field like its strips, the panel's colour for the cross, the
     slider's thumb colour for the point, square as every box here ── */
  .s-pad { background: var(--bg2); border: none; border-radius: 0;
    .s-pad-x, .s-pad-y { background: var(--bg); }
    .s-pad-dot { width: var(--thumb); height: var(--thumb); border-radius: 0; background: var(--accent); box-shadow: none; }
    &:focus-visible:not(:active) { outline: var(--line) solid var(--accent); outline-offset: 0; } }

  /* ── Knob: native has none; the dial a background2 disc, its mark the thumb colour ── */
  .s-knob-dial { background: var(--bg2); border: none; i { background: var(--accent); } }

  /* ── Folder ── */
  .s-folder {
    > summary {
      font-size: var(--fs);
      font-weight: ${weight};
      color: var(--dim);
      padding: calc(var(--u) * var(--spacing) * 2) 0;
      opacity: 1;
      /* the fold's caret, the select's 6×5 caret: down shut, up open */
      &::after { content: ''; display: block; flex: none; margin-left: auto; margin-right: 2.5%; width: 0; height: 0; background: none; -webkit-mask: none; mask: none;
        border-inline: calc(var(--u) * .6) solid transparent; border-top: var(--u) solid var(--dim); }
    }
    &[open] > summary::after { border-top: 0; border-bottom: var(--u) solid var(--dim); transform: none; }
    .s-content { gap: 0; }
  }
}`

  return baseCSS + '\n' + overrides
}
