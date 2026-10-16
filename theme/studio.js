/**
 * studio – an original theme after the pill-row dial panel of
 * DialKit (Josh Puckett – https://www.dialkit.dev/, https://github.com/joshpuckett/dialkit,
 * verified against commit 0301abdf0b84fc3d60a4c4fa3a99bfb2044959e3: theme.css + Slider.tsx).
 *
 * Signature: every row is a soft alpha-tinted pill, label at left / value at
 * right. One ink color drives every state; there is no accent axis
 * (tweakpane's precedent here – interaction reads as lightness/alpha, never hue).
 * A box inside a row (button, segment, toggle, axis, textarea, pad) sits one
 * nest inset from the row's top, bottom and near edge, its radius the row's
 * less that inset.
 *
 * Deliberate departures from the shipped DialKit source, matching the
 * reference screenshots over the current repo (per orchestrator decision):
 *   - color swatch is a circle (source draws a 5px-rounded square)
 *   - the slider is a track and thumb in the value column, not DialKit's
 *     row-as-fill (owner's decision): the thumb is the switch's knob, the
 *     track its ink steps; step dots mark the steps still ahead
 *   - values (text/number/select/slider) render in the UI font with tabular
 *     numerals, not a separate monospace face
 *   - boolean gains a `segmented` Off/On variant – the design-tool "grey
 *     track + raised active segment" convention – alongside DialKit's switch
 *   - two section-header conventions, one per reference: the static group
 *     title is an uppercase tracked eyebrow (`separator:labeled`, light
 *     reference's TEXT/LAYOUT/PATH); the collapsible group keeps DialKit's
 *     real sentence-case title + chevron (`folder`, dark reference's
 *     Enter/Exit/Dividers) – each screenshot's own convention, kept apart
 *     rather than merged into one
 *
 * Contrast: every text / UI-boundary tone comes from theme/color.js's
 * `ink()` against `shade`, not a hand-picked alpha. `ink(shade)` is the
 * ratio-4.5 (AA text) neutral of shade's own hue, used for every row label,
 * value and heading (including the separator eyebrow: real text, not a UI
 * boundary, so it earns the text ratio, not the 3:1 one); `ink(shade, 3)` is
 * the ratio-3 (WCAG 1.4.11) UI-boundary tone, reserved for marks and
 * chevrons; a placeholder is text, that tone lifted to 4.5:1 on its row.
 * A chromatic shade therefore still reads correctly.
 * Every alpha wash below (row fills, hairlines, the slider fill, marks) is
 * a color-mix() of that one root ink - DialKit's own verified percentages
 * (8.5:1 dark / 5.7:1 light label contrast, theme.css) reapplied as ratios
 * of whichever ink `shade` produces, so they hold for any custom shade, not
 * only DialKit's native `#212121` / `#fafafa`. Every ink shares the same
 * capped chroma (`nC`, including the focus ring) - a neutral shade's own
 * hue is numerically undefined, so nothing here may invent one just to
 * make a ring "pop"; that would break the theme's own no-accent premise.
 *
 * Axes: shade (bg; no accent), spacing, size, roundness (1 = DialKit's own
 * 8px row / 14px panel), weight, font (UI face only – values stay in it).
 *
 * studio(axes?) → CSS string
 */

import metrics from './metrics.js'
import baseCSS from './base.js'
import { resolveRoles, ink, contrast, mix } from './color.js'

export default function studio({
  shade = '#212121',
  spacing = 1,
  size = 1,
  roundness = 1,
  weight = 500,
  font,
} = {}) {
  const { dark, C, H } = resolveRoles(shade)
  const nC = Math.min(C, 0.025)   // a whisper of shade's own hue – stays monochrome, never saturated

  const primary  = ink(shade, 7,   { L: dark ? .97 : .09, C: nC, H }) // root ink – anchors every wash below
  const label    = ink(shade, 4.5, { L: dark ? .82 : .34, C: nC, H }) // row label, value text, separator eyebrow (AA text)
  const tertiary = ink(shade, 3,   { L: dark ? .64 : .56, C: nC, H }) // marks, chevrons (UI boundary)
  const focus    = ink(shade, 3,   { L: dark ? .90 : .28, C: nC, H }) // keyboard focus ring (UI boundary) – same capped chroma as every other ink; a neutral shade must not manufacture a hue it doesn't have

  const wash = a => `color-mix(in oklab, var(--ink), transparent ${100 - a}%)`
  // The panel is 88% opaque, so it shows 12% of the page. Lettering off the plain rows (the eyebrow,
  // which base dims to 60%, on the panel; a button's label on its face, row + active wash) is
  // measured on the panel both opaque and over a white page, and moves only where it then reads
  // 4.5:1 on both: a shade too mid-grey for any ink keeps its tone.
  const page = g => [g(shade), g(mix(shade, '#ffffff', .12))]
  const fit = (grounds, tone) => { const t = grounds.reduce((t, g) => ink(g, 4.5, t), tone); return grounds.every(g => contrast(t, g) >= 4.5) ? t : tone }
  const row = g => mix(g, primary, dark ? .05 : .04), hovered = g => mix(g, primary, dark ? .1 : .08)
  const face = (g, under = row) => mix(under(g), primary, dark ? .11 : .1)
  const eyebrow = fit(page(g => g), mix(shade, label, .6))
  const onButton = fit(page(face), label)
  // A placeholder, the tertiary tone (2.9:1 on its row), held the same way on the row and, in a textarea, on its face,
  // at rest and in a hovered or focused row (--row-hover)
  const placeholder = fit([...page(row), ...page(hovered)], tertiary)
  const placeholderOnFace = fit([...page(face), ...page(g => face(g, hovered))], tertiary)
  // and the search field's, which lies on the bare panel in the title
  const placeholderOnPanel = fit(page(g => g), tertiary)
  const knobRing = dark ? '' : 'box-shadow: 0 0 0 1px rgba(0,0,0,.06), 0 1px calc(2 * var(--length)) rgba(0,0,0,.08);'

  const chevDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.5 2 L6 6.5 L10.5 2' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const chevUpDown = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L5 1 L9 5' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M1 9 L5 13 L9 9' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const chevUp = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 6 L5 2 L9 6' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const chevDn = `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1 L5 5 L9 1' fill='none' stroke='%23000' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
  const check = `url("data:image/svg+xml,%3Csvg viewBox='0 0 12 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5 L4.5 8.5 L11 1.5' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`

  // Body 13px: DialKit sets its labels and values at 13px.
  const body = 13
  const overrides = `.s-panel {
  ${metrics({ size, spacing, font }, { body, fontSize: 13, fontFamily: "-apple-system, system-ui, 'SF Pro Display', sans-serif", lineHeight: 18, controlHeight: 36, inset: 12, rowGap: 6, columnGap: 12, sectionGap: 12, panelPadding: 12 })}

  /* ── Ink (shade axis only – no accent; every state is lightness/alpha of one ink) ── */
  --bg: ${shade};
  --ink: ${primary};
  --ink-label: ${label};
  --ink-tertiary: ${tertiary};
  --ink-placeholder: ${placeholder};
  --ink-placeholder-face: ${placeholderOnFace};
  --focus: ${focus};

  /* ── Alpha ladder off --ink (DialKit's own cited percentages, theme.css:8-27 / :1762-76) ── */
  --row: ${wash(dark ? 5 : 4)};
  --row-hover: ${wash(dark ? 10 : 8)};
  --row-active: ${wash(dark ? 11 : 10)};
  --border: ${wash(10)};
  --border-hover: ${wash(15)};
  --dot-active: ${wash(45)};

  /* ── Scale ── */
  --weight: ${weight};
  --r: calc(8 * var(--length) * ${roundness});
  --r-panel: calc(14 * var(--length) * ${roundness});
  --h: var(--control-height);
  /* A box inside a row sits one nest in from its top, bottom and near edge; its radius nests too */
  --nest: calc(4 * var(--space));
  --r-nest: max(0px, calc(var(--r) - var(--nest)));
  --box: calc(var(--h) - 2 * var(--nest));
  /* A value that fills its column (track, segments, axes, buttons, options) starts at one x in every row */
  --label-col: 50%;
  /* One slider: a pill track in the ink's steps under the switch's knob */
  --track: calc(6 * var(--length));
  --thumb: calc(16 * var(--length));
  --knob: #fff;
  --glyph: calc(16 * var(--length)); /* check box and radio */
  --chev-w: calc(9 * var(--length)); /* the up/down chevron's width: select and number stepper */
  --w: calc(320 * var(--length));
  --shadow: ${dark ? '0 calc(8 * var(--length)) calc(32 * var(--length)) rgba(0,0,0,.5)' : '0 calc(4 * var(--length)) calc(20 * var(--length)) rgba(0,0,0,.08)'};
  color-scheme: ${dark ? 'dark' : 'light'};

  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: var(--r-panel);
  box-shadow: var(--shadow);
  color: var(--ink-label);
  width: min(100%, var(--w));
  max-width: min(100%, var(--w));
  min-width: 0;
  padding: var(--panel-padding);
  -webkit-font-smoothing: antialiased;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  /* ── Panel title ── */
  > summary, > .s-panel-title {
    font-weight: calc(var(--weight) + 150); font-size: calc(15 * var(--length)); color: var(--ink);
    padding: 0 0 calc(8 * var(--space));
    &::after { content: ''; width: calc(10 * var(--length)); height: calc(10 * var(--length)); margin-left: auto; background: var(--ink-tertiary); -webkit-mask: ${chevDown} center / contain no-repeat; mask: ${chevDown} center / contain no-repeat; opacity: .7; transition: transform .15s, opacity .15s; }
    &:hover::after { opacity: 1; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: calc(var(--r) / 2); }
  }
  &[open] > summary::after { transform: rotate(180deg); }
  .s-search-input::placeholder { color: ${placeholderOnPanel}; }
  .s-panel-content { gap: var(--row-gap); padding: 0; }
  &:is(details) > .s-panel-content, .s-panel-title + .s-panel-content { padding-top: calc(4 * var(--space)); }

  /* ── Row (the generic pill every leaf control starts from) ── */
  .s-control { background: var(--row); border-radius: var(--r); min-height: var(--h); padding: 0 var(--inset); align-items: center; gap: var(--inset); transition: background .15s; }
  .s-control:hover, .s-control:focus-within { background: var(--row-hover); }
  .s-control:has(> .s-input[inert]) { opacity: .5; }
  .s-label-group { width: auto; max-width: 55%; flex: 0 1 auto; min-width: 0; gap: 0; }
  :is(.s-slider:not(.s-multiple), .s-select:is(.s-segmented, .s-radio, .s-checkboxes), .s-button) > .s-label-group { flex: 0 0 auto; width: var(--label-col); max-width: var(--label-col); }
  /* an interval leads with its low readout, so its track cannot share that x: it takes the room its label leaves */
  .s-label { font-weight: var(--weight); color: var(--ink-label); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .s-hint { display: none; } /* DialKit rows carry no secondary hint line – title (?) still works */
  .s-title-text { font-size: calc(11 * var(--length)); background: var(--ink); color: var(--bg); padding: calc(2 * var(--space)) calc(6 * var(--space)); border-radius: calc(var(--r) / 2); } /* as the slider's tooltip */
  .s-input { flex: 1 1 auto; justify-content: flex-end; align-items: center; gap: var(--inset); color: var(--ink); min-width: 0; }
  /* A box at the row's end nests: the row's own inset at the near edge becomes the nest */
  .s-control:is(.s-button, .s-vector, .s-textarea, .s-xy, .s-select.s-segmented, .s-boolean:is(.s-toggle, .s-segmented)) { padding-block: var(--nest); padding-right: var(--nest); }
  .s-button:has(> .s-label-group[hidden]) { padding-left: var(--nest); }
  /* A row of several lines keeps its label on the first, centred where a one-line row centres it */
  .s-control:is(.s-radio, .s-checkboxes, .s-swatches, .s-textarea, .s-xy) { align-items: flex-start;
    > .s-label-group { min-height: var(--h); justify-content: center; }
  }
  .s-control:is(.s-textarea, .s-xy) > .s-label-group { min-height: var(--box); }
  .s-folder, .s-separator,
  .s-folder:hover, .s-folder:focus-within,
  .s-separator:hover, .s-separator:focus-within { background: none; padding: 0; min-height: 0; }
  input, select, textarea, button { font-family: inherit; font-size: inherit; font-variant-numeric: tabular-nums; }
  /* Values end at the row's inset, as every row's value does */
  .s-text input, .s-number input, .s-select.s-dropdown select, .s-color input[type="text"] { height: var(--h); padding-block: 0; padding-inline: 0; }
  button { cursor: pointer; }

  /* ── Slider: label left, a pill track and the switch's knob in the value column, the readout at the row's end ── */
  .s-slider {
    .s-track { height: var(--thumb); }
    input[type="range"], .s-interval-track { height: var(--track); border-radius: 999px; }
    input[type="range"] {
      -webkit-appearance: none; appearance: none; width: 100%; margin: 0; cursor: pointer;
      background: linear-gradient(to right, var(--dot-active) var(--p, 0%), var(--row-active) var(--p, 0%));
      &:focus-visible { outline: none; }
    }
    /* Step dots mark the steps still ahead: those under the fill are hidden, and the far end,
       which the track's own end marks */
    .s-marks, .s-mark-labels { position: absolute; inset: 0 calc(var(--thumb) / 2); pointer-events: none; }
    .s-mark-labels { display: none; } /* DialKit's hashmarks carry no text, dots only */
    .s-mark { position: absolute; top: 50%; width: calc(3 * var(--length)); height: calc(3 * var(--length)); border-radius: 50%; transform: translate(-50%, -50%); background: var(--border-hover); transition: background .2s; }
    .s-mark.s-active, .s-marks:not(:has(~ .s-marks)) .s-mark { visibility: hidden; }
    &:hover .s-mark, &:focus-within .s-mark { background: var(--dot-active); }
    /* The readout is the row's value: body size, at the row's end; at least 4ch, so the track holds still */
    .s-readout { flex: none; min-width: 4ch; background: transparent; border: none; padding: 0; text-align: right; font-weight: var(--weight); color: var(--ink); cursor: text; }
    input.s-readout { width: 7ch; @supports (field-sizing: content) { field-sizing: content; width: auto; } }
    .s-readout:focus-visible { outline: none; box-shadow: inset 0 -1px var(--focus); }
    .s-tooltip { margin-bottom: calc(6 * var(--space)); background: var(--ink); color: var(--bg); font-size: calc(11 * var(--length)); padding: calc(2 * var(--space)) calc(6 * var(--space)); border-radius: calc(var(--r) / 2); z-index: 4; }
    &.s-multiple .s-interval-track { flex: 1; align-self: center;
      background: linear-gradient(to right, var(--row-active) var(--low, 0%), var(--dot-active) var(--low, 0%), var(--dot-active) var(--high, 100%), var(--row-active) var(--high, 100%));
      input[type="range"] { background: none; height: 100%; }
    }
  }
  .s-slider input[type="range"], .s-color.s-rgba .s-alpha {
    &::-webkit-slider-thumb { -webkit-appearance: none; width: var(--thumb); height: var(--thumb); border: none; border-radius: 50%; background: var(--knob); ${knobRing} }
    &::-moz-range-thumb { width: var(--thumb); height: var(--thumb); border: none; border-radius: 50%; background: var(--knob); ${knobRing} }
    &:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 2px var(--focus); }
    &:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 2px var(--focus); }
  }

  /* ── Boolean: switch (image 1), segmented Off/On (image 2), plus checkbox/toggle ── */
  .s-boolean {
    input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
    &.s-switch .s-track {
      width: calc(36 * var(--length)); height: calc(20 * var(--length)); border-radius: 999px; background: var(--row-active); position: relative; cursor: pointer; transition: background .2s;
      &::after { content: ''; position: absolute; top: calc(2 * var(--length)); left: calc(2 * var(--length)); width: calc(16 * var(--length)); height: calc(16 * var(--length)); border-radius: 50%; background: #fff; transition: left .2s; ${knobRing} }
    }
    &.s-switch:has(input:checked) .s-track { background: var(--border-hover); &::after { left: calc(100% - 18 * var(--length)); } }
    &.s-switch:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }

    &.s-checkbox .s-track { width: var(--glyph); height: var(--glyph); border-radius: calc(var(--r) / 2); background: var(--row-active); display: grid; place-items: center; cursor: pointer; transition: background .15s;
      &::after { content: ''; width: 62%; height: 50%; opacity: 0; background: var(--ink); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; transition: opacity .1s; }
    }
    &.s-checkbox:has(input:checked) .s-track { background: var(--border-hover); &::after { opacity: 1; } }
    &.s-checkbox:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }

    &.s-toggle .s-track { height: var(--box); border-radius: var(--r-nest); cursor: pointer; padding: 0 calc(14 * var(--space)); background: var(--row-active); display: flex; align-items: center; justify-content: center; font-weight: var(--weight); color: var(--ink-label); transition: background .15s, color .15s;
      &::after { content: 'Off'; }
    }
    &.s-toggle:has(input:checked) .s-track { background: var(--border-hover); color: var(--ink); &::after { content: 'On'; } }
    &.s-toggle:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }

    /* segmented: both words always visible at the row's end; the active one carries the raised pill (image 2) */
    &.s-segmented .s-input { flex: 0 0 auto; margin-left: auto; }
    &.s-segmented .s-track {
      display: flex; cursor: pointer;
      &::before, &::after { display: grid; place-items: center; height: var(--box); padding: 0 calc(14 * var(--space)); border-radius: var(--r-nest); font-weight: var(--weight); transition: background .2s, color .15s; }
      &::before { content: 'Off'; color: var(--ink); background: var(--border-hover); }
      &::after { content: 'On'; color: var(--ink-label); }
    }
    &.s-segmented:has(input:checked) .s-track { &::before { color: var(--ink-label); background: none; } &::after { color: var(--ink); background: var(--border-hover); } }
    &.s-segmented:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Select: dropdown with an up/down chevron (image 1), segmented (image 3), radio/checkboxes ── */
  .s-select {
    &.s-dropdown .s-input { position: relative; flex: 0 1 auto; min-width: 0; margin-left: auto; padding-right: calc(var(--chev-w) + var(--nest));
      &::after { content: ''; position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: var(--chev-w); height: calc(13 * var(--length)); background: var(--ink-tertiary); -webkit-mask: ${chevUpDown} center / contain no-repeat; mask: ${chevUpDown} center / contain no-repeat; pointer-events: none; }
    }
    &.s-dropdown select { flex: 0 1 auto; width: auto; min-width: 0; max-width: 100%; appearance: none; -webkit-appearance: none; background: transparent; border: none; cursor: pointer; color: var(--ink); font-weight: var(--weight); text-align: right; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
      option { background: var(--bg); color: var(--ink); }
    }
    /* the row is the segments' track: the chosen one is a pill nested in it */
    &.s-segmented .s-input { gap: 0; }
    &.s-segmented button { flex: 1; height: var(--box); padding: 0 calc(8 * var(--space)); background: transparent; border: none; border-radius: var(--r-nest); color: var(--ink-label); font-weight: var(--weight); transition: background .15s, color .15s;
      &:hover { color: var(--ink); }
      &.s-selected { background: var(--border-hover); color: var(--ink); }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
    }
    &.s-radio, &.s-checkboxes { .s-input { flex-direction: column; align-items: stretch; gap: calc(6 * var(--space)); padding-block: calc((var(--h) - var(--line-height)) / 2); } .s-input label { display: flex; align-items: center; gap: calc(8 * var(--space)); cursor: pointer; color: var(--ink-label); } }
    &.s-radio input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; width: var(--glyph); height: var(--glyph); border-radius: 50%; background: var(--row-active); flex-shrink: 0; display: grid; place-items: center; cursor: pointer;
      &::after { content: ''; width: 50%; height: 50%; border-radius: 50%; background: var(--ink); opacity: 0; }
      &:checked::after { opacity: 1; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
    &.s-checkboxes .s-track { width: var(--glyph); height: var(--glyph); border-radius: calc(var(--r) / 2); background: var(--row-active); display: grid; place-items: center; flex-shrink: 0;
      &::after { content: ''; width: 62%; height: 50%; opacity: 0; background: var(--ink); -webkit-mask: ${check} center / contain no-repeat; mask: ${check} center / contain no-repeat; }
    }
    &.s-checkboxes label:has(input:checked) .s-track { background: var(--border-hover); &::after { opacity: 1; } }
    &.s-checkboxes label:has(input:focus-visible) .s-track { outline: 2px solid var(--focus); outline-offset: 2px; }
  }

  /* ── Color: circular swatch (image 1/2 – DialKit's own source draws a rounded square) ── */
  .s-color {
    &.s-picker .s-color-input, &.s-rgba .s-color-input { justify-content: flex-end; gap: calc(8 * var(--space)); }
    input[type="color"] { width: calc(22 * var(--length)); height: calc(22 * var(--length)); border-radius: 50%; border: 1px solid var(--border-hover); padding: 0; cursor: pointer;
      &::-webkit-color-swatch-wrapper { padding: 0; border-radius: 50%; overflow: hidden; }
      &::-webkit-color-swatch { border: none; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
    &.s-picker input[type="text"] { width: 0; min-width: 0; opacity: 0; padding: 0; border: none; background: transparent; text-align: right; color: var(--ink-label); font-weight: var(--weight); transition: width .15s, opacity .15s, margin .15s; }
    &.s-picker:hover input[type="text"], &.s-picker:focus-within input[type="text"] { width: 9ch; opacity: 1; }
    /* the alpha slider is the slider: its track and knob, the checkerboard and ramp in place of the fill */
    &.s-rgba .s-alpha { height: var(--track); border-radius: 999px; }
    &.s-rgba input[type="text"] { flex: 1; min-width: 6ch; background: transparent; border: none; text-align: right; color: var(--ink-label); font-weight: var(--weight); }
    &.s-swatches .s-input { flex-wrap: wrap; justify-content: flex-end; gap: calc(8 * var(--space)); padding-block: calc((var(--h) - 20 * var(--length)) / 2); }
    &.s-swatches button { width: calc(20 * var(--length)); height: calc(20 * var(--length)); padding: 0; border-radius: 50%; border: 1px solid var(--border);
      &.s-selected { outline: 2px solid var(--ink); outline-offset: 2px; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    }
  }

  /* ── Text / Number / Textarea ── */
  .s-text input[type="text"] { flex: 1; min-width: 0; background: transparent; border: none; text-align: right; color: var(--ink); font-weight: var(--weight);
    &::placeholder { color: var(--ink-placeholder); }
    &:focus-visible { outline: none; box-shadow: inset 0 -1px var(--focus); }
  }
  .s-number input[type="number"] { flex: 1; min-width: 0; background: transparent; border: none; text-align: right; color: var(--ink); font-weight: var(--weight); cursor: ns-resize; -moz-appearance: textfield;
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    &:focus { cursor: text; }
    &:focus-visible { outline: none; box-shadow: inset 0 -1px var(--focus); }
  }
  /* the stepper is the select's up/down chevron cut in two, one nest past the value, shown in hand */
  .s-number .s-input { gap: var(--nest); }
  .s-number .s-step { opacity: 0; transition: opacity .15s; gap: 0;
    button { width: var(--chev-w); height: calc(6.5 * var(--length)); padding: 0; border: none; font-size: 0; background: var(--ink-tertiary); -webkit-mask: ${chevUp} center / contain no-repeat; mask: ${chevUp} center / contain no-repeat; &:hover { background: var(--ink); } }
    .s-step-down { -webkit-mask-image: ${chevDn}; mask-image: ${chevDn}; }
  }
  .s-number:hover .s-step, .s-number:focus-within .s-step { opacity: .7; }
  .s-textarea {
    /* its first line sits on the label's */
    --pad-y: calc((var(--h) - var(--line-height)) / 2 - var(--nest));
    textarea { flex: 1; background: var(--row-active); border: none; border-radius: var(--r-nest); padding: var(--pad-y) calc(var(--inset) - var(--nest)); color: var(--ink); resize: vertical; field-sizing: content; min-height: calc(3 * var(--line-height) + 2 * var(--pad-y)); max-height: 50vh;
      &::placeholder { color: var(--ink-placeholder-face); }
      &:focus-visible { outline: none; box-shadow: inset 0 0 0 1px var(--border-hover); }
    }
    &.s-code textarea { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: .92em; }
  }

  /* ── Button ── */
  .s-button .s-input { gap: var(--nest); }
  .s-button button { flex: 1; min-height: var(--box); background: var(--row-active); color: ${onButton}; border: none; border-radius: var(--r-nest); font-weight: var(--weight); transition: background .15s, color .15s;
    &:hover { background: var(--border-hover); color: var(--ink); }
    &:active { background: var(--border-hover); }
    &:disabled, &[aria-busy="true"] { opacity: .4; cursor: not-allowed; }
    &:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
  }
  .s-button.s-secondary button, .s-button button.s-secondary { background: transparent; box-shadow: inset 0 0 0 1px var(--border); color: var(--ink-label);
    &:hover { background: var(--row-hover); }
  }

  /* ── Info ── */
  .s-info .s-monitor { color: var(--ink); font-weight: var(--weight); opacity: 1; }

  /* ── Vector ── */
  .s-vector .s-input { gap: var(--nest); }
  .s-vector .s-vec-axis { flex: 1; min-width: 0; gap: calc(4 * var(--space)); background: var(--row-active); border-radius: var(--r-nest); padding: 0 calc(8 * var(--space)); height: var(--box);
    &:focus-within { box-shadow: inset 0 0 0 1px var(--border-hover); }
  }
  .s-vector .s-vec-label { color: var(--ink-tertiary); font-size: calc(11 * var(--length)); }
  .s-vector input[type="number"] { padding: 0; background: transparent; border: none; text-align: right; color: var(--ink); font-weight: var(--weight); }
  .s-vector .s-vec-expand { background: var(--ink-tertiary); opacity: .7; &:hover, &.s-open { opacity: 1; } }

  /* ── XY pad / Knob ── */
  .s-pad { background: var(--row-active); border: 1px solid var(--border); border-radius: var(--r-nest);
    .s-pad-x, .s-pad-y { background: var(--border-hover); }
    .s-pad-dot { background: var(--ink); box-shadow: 0 0 0 calc(2 * var(--length)) var(--bg); }
  }
  .s-pad-val { color: var(--ink-tertiary); font-size: calc(11 * var(--length)); }
  .s-knob-dial { background: var(--row-active); border: 1px solid var(--border); i { background: var(--ink); } }
  .s-knob-val { color: var(--ink); font-size: inherit; font-weight: var(--weight); opacity: 1; } /* the row's value, as a slider's readout */

  /* ── Folder: DialKit's real group title – sentence case, chevron (dark reference: Enter/Exit/Dividers) ── */
  .s-folder {
    > summary { font-weight: calc(var(--weight) + 100); font-size: calc(13 * var(--length)); letter-spacing: -0.01em; color: var(--ink-label); padding: calc(8 * var(--space)) 0; cursor: pointer;
      &::after { content: ''; width: calc(10 * var(--length)); height: calc(10 * var(--length)); margin-left: auto; background: var(--ink-tertiary); opacity: .8; -webkit-mask: ${chevDown} center / contain no-repeat; mask: ${chevDown} center / contain no-repeat; transition: transform .15s, opacity .15s; }
      &:hover::after { opacity: 1; }
      &:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: calc(var(--r) / 2); }
    }
    &[open] > summary::after { transform: rotate(180deg); }
    .s-content { gap: var(--row-gap); padding: 0; }
  }

  /* ── Separator: uppercase tracked eyebrow – non-interactive (light reference: TEXT/LAYOUT/PATH) ── */
  .s-separator { height: 1px; background: var(--border); opacity: 1; margin: calc(4 * var(--space)) 0; }
  /* a heading, folder title or eyebrow, sits 14 below the row before it and 8 above its first row */
  .s-separator-labeled { height: auto; background: none; padding: calc(8 * var(--space)) 0 calc(2 * var(--space));
    &::before, &::after { display: none; }
  }
  .s-separator-label { font-size: calc(11 * var(--length)); font-weight: calc(var(--weight) + 100); text-transform: uppercase; letter-spacing: .06em; color: ${eyebrow}; opacity: 1; white-space: normal; }
}
@media (forced-colors: active) { .s-panel { --focus: Highlight; } }`

  return baseCSS + '\n' + overrides
}
